import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MovementType } from '@prisma/client';
import {
  CreateStockMovementDto,
  StockAdjustmentDto,
  StockTransferDto,
} from './dto/stock.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Stok hareketi oluştur (giriş, çıkış, iade, vb.)
   */
  async createMovement(
    organizationId: string,
    userId: string,
    dto: CreateStockMovementDto,
  ) {
    // Ürün kontrolü
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, organizationId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Depo kontrolü
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, organizationId },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    // Raf seçilmemişse depodaki ilk rafı kullan
    let shelfId = dto.shelfId;
    if (!shelfId) {
      const firstShelf = await this.prisma.shelf.findFirst({
        where: { warehouseId: dto.warehouseId },
        orderBy: { code: 'asc' },
      });
      if (!firstShelf) {
        throw new BadRequestException('Depoda raf bulunamadı');
      }
      shelfId = firstShelf.id;
    }

    // Çıkış ise yeterli stok var mı kontrol et
    if (dto.type === MovementType.OUT) {
      const currentStock = await this.prisma.stockLevel.aggregate({
        where: {
          productId: dto.productId,
          shelfId,
        },
        _sum: { quantity: true },
      });

      const available = Number(currentStock._sum.quantity || 0);
      if (available < dto.quantity) {
        throw new BadRequestException(
          `Yetersiz stok. Mevcut: ${available}, İstenen: ${dto.quantity}`,
        );
      }
    }

    // Transaction ile stok güncelle + hareket kaydet
    const result = await this.prisma.$transaction(async (tx) => {
      // Stok seviyesini güncelle
      const currentLevel = await tx.stockLevel.findUnique({
        where: {
          productId_shelfId: {
            productId: dto.productId,
            shelfId,
          },
        },
      });

      const change = this.getQuantityChange(dto.type, dto.quantity);

      if (currentLevel) {
        await tx.stockLevel.update({
          where: { id: currentLevel.id },
          data: {
            quantity: { increment: change },
            lastMovementAt: new Date(),
          },
        });
      } else {
        // Yeni stok kaydı (sadece pozitif hareketler için)
        if (change < 0) {
          throw new BadRequestException('Bu rafta ürün yok, önce giriş yapın');
        }
        await tx.stockLevel.create({
          data: {
            productId: dto.productId,
            shelfId,
            quantity: change,
            lastMovementAt: new Date(),
          },
        });
      }

      // Hareket kaydı
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          type: dto.type,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
          totalPrice: dto.unitPrice
            ? dto.unitPrice * dto.quantity
            : null,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          note: dto.note,
          userId,
          organizationId,
        },
        include: {
          product: { select: { name: true, sku: true } },
          warehouse: { select: { name: true, code: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      });

      return movement;
    });

    return result;
  }

  /**
   * Sayım düzeltmesi
   */
  async adjust(
    organizationId: string,
    userId: string,
    dto: StockAdjustmentDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, organizationId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const currentLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_shelfId: {
          productId: dto.productId,
          shelfId: dto.shelfId,
        },
      },
    });

    const currentQty = Number(currentLevel?.quantity || 0);
    const diff = dto.actualQuantity - currentQty;

    if (diff === 0) {
      return { message: 'Stok zaten doğru', currentQuantity: currentQty };
    }

    return this.prisma.$transaction(async (tx) => {
      // Stok güncelle
      if (currentLevel) {
        await tx.stockLevel.update({
          where: { id: currentLevel.id },
          data: {
            quantity: dto.actualQuantity,
            lastCountAt: new Date(),
            lastMovementAt: new Date(),
          },
        });
      } else {
        await tx.stockLevel.create({
          data: {
            productId: dto.productId,
            shelfId: dto.shelfId,
            quantity: dto.actualQuantity,
            lastCountAt: new Date(),
            lastMovementAt: new Date(),
          },
        });
      }

      // Düzeltme hareketi
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          type: MovementType.ADJUSTMENT,
          quantity: Math.abs(diff),
          note: dto.note || `Sayım düzeltmesi: ${currentQty} → ${dto.actualQuantity}`,
          userId,
          organizationId,
        },
      });

      return { movement, currentQuantity: dto.actualQuantity, difference: diff };
    });
  }

  /**
   * Raf transferi
   */
  async transfer(
    organizationId: string,
    userId: string,
    dto: StockTransferDto,
  ) {
    if (dto.fromShelfId === dto.toShelfId) {
      throw new BadRequestException('Kaynak ve hedef raf aynı olamaz');
    }

    // Kaynak rafta yeterli stok var mı
    const sourceLevel = await this.prisma.stockLevel.findUnique({
      where: {
        productId_shelfId: {
          productId: dto.productId,
          shelfId: dto.fromShelfId,
        },
      },
      include: { shelf: { include: { warehouse: true } } },
    });

    if (!sourceLevel || Number(sourceLevel.quantity) < dto.quantity) {
      throw new BadRequestException(
        `Kaynak rafta yeterli stok yok. Mevcut: ${sourceLevel?.quantity || 0}`,
      );
    }

    // Hedef raf kontrolü
    const targetShelf = await this.prisma.shelf.findUnique({
      where: { id: dto.toShelfId },
      include: { warehouse: true },
    });

    if (!targetShelf || targetShelf.warehouse.organizationId !== organizationId) {
      throw new NotFoundException('Hedef raf bulunamadı');
    }

    return this.prisma.$transaction(async (tx) => {
      // Kaynak azalt
      await tx.stockLevel.update({
        where: { id: sourceLevel.id },
        data: {
          quantity: { decrement: dto.quantity },
          lastMovementAt: new Date(),
        },
      });

      // Hedef artır veya oluştur
      const targetLevel = await tx.stockLevel.findUnique({
        where: {
          productId_shelfId: {
            productId: dto.productId,
            shelfId: dto.toShelfId,
          },
        },
      });

      if (targetLevel) {
        await tx.stockLevel.update({
          where: { id: targetLevel.id },
          data: {
            quantity: { increment: dto.quantity },
            lastMovementAt: new Date(),
          },
        });
      } else {
        await tx.stockLevel.create({
          data: {
            productId: dto.productId,
            shelfId: dto.toShelfId,
            quantity: dto.quantity,
            lastMovementAt: new Date(),
          },
        });
      }

      // Hareket kaydı
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: sourceLevel.shelf.warehouseId,
          type: MovementType.TRANSFER,
          quantity: dto.quantity,
          note: `Transfer: ${sourceLevel.shelf.code} → ${targetShelf.code}. ${dto.note || ''}`,
          userId,
          organizationId,
        },
      });

      return { message: 'Transfer tamamlandı', movement };
    });
  }

  /**
   * Stok hareketleri listele
   */
  async getMovements(
    organizationId: string,
    options: {
      page?: number;
      pageSize?: number;
      productId?: string;
      warehouseId?: string;
      type?: MovementType;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const {
      page = 1,
      pageSize = 50,
      productId,
      warehouseId,
      type,
      startDate,
      endDate,
    } = options;

    const where: any = {
      organizationId,
      ...(productId && { productId }),
      ...(warehouseId && { warehouseId }),
      ...(type && { type }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true } },
          warehouse: { select: { name: true, code: true } },
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Düşük stoklu ürünler
   */
  async getLowStockProducts(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        category: { select: { name: true, color: true } },
        unit: { select: { shortName: true } },
        stockLevels: {
          select: { quantity: true },
        },
      },
    });

    return products
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        unit: p.unit,
        minStock: p.minStock,
        criticalStock: p.criticalStock,
        totalStock: p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0),
        status:
          p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0) === 0
            ? 'OUT'
            : p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0) <=
              Number(p.criticalStock)
            ? 'CRITICAL'
            : 'LOW',
      }))
      .filter((p) => p.totalStock <= Number(p.minStock))
      .sort((a, b) => a.totalStock - b.totalStock);
  }

  // ============================================
  // HELPERS
  // ============================================

  private getQuantityChange(type: MovementType, quantity: number): number {
    switch (type) {
      case MovementType.IN:
      case MovementType.RETURN:
        return quantity;
      case MovementType.OUT:
      case MovementType.DAMAGE:
        return -quantity;
      case MovementType.ADJUSTMENT:
      case MovementType.TRANSFER:
        return quantity; // Pozitif/negatif duruma göre service'te ayarlanır
      default:
        return 0;
    }
  }
}
