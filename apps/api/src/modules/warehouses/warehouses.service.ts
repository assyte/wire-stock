import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto, CreateShelfDto } from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { organizationId },
      include: {
        shelves: {
          orderBy: { code: 'asc' },
        },
        _count: {
          select: { stockMovements: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return warehouses.map((wh) => ({
      ...wh,
      productCount: wh._count.stockMovements,
    }));
  }

  async findOne(organizationId: string, id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, organizationId },
      include: {
        shelves: {
          orderBy: { code: 'asc' },
        },
        _count: {
          select: { stockMovements: true },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    return warehouse;
  }

  async create(organizationId: string, dto: CreateWarehouseDto) {
    // Aynı kod var mı kontrol
    const existing = await this.prisma.warehouse.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Bu kod ile bir depo zaten mevcut');
    }

    // Eğer varsayılan olarak işaretlendiyse, diğerlerini kaldır
    if (dto.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await this.prisma.warehouse.create({
      data: {
        ...dto,
        organizationId,
      },
    });

    // Varsayılan raflar oluştur
    const defaultShelves = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1'];
    await this.prisma.shelf.createMany({
      data: defaultShelves.map((code) => ({
        code,
        warehouseId: warehouse.id,
      })),
    });

    return this.findOne(organizationId, warehouse.id);
  }

  async update(organizationId: string, id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(organizationId, id);

    if (dto.isDefault && !warehouse.isDefault) {
      await this.prisma.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    const warehouse = await this.findOne(organizationId, id);

    // Stok hareketi var mı kontrol et
    const movementCount = await this.prisma.stockMovement.count({
      where: { warehouseId: id },
    });

    if (movementCount > 0) {
      throw new BadRequestException(
        'Bu depoda stok hareketi var. Önce transfer edin veya silin.',
      );
    }

    await this.prisma.warehouse.delete({
      where: { id },
    });

    return { message: 'Depo silindi' };
  }

  // ============================================
  // SHELVES
  // ============================================

  async addShelf(organizationId: string, dto: CreateShelfDto) {
    // Depo kontrolü
    await this.findOne(organizationId, dto.warehouseId);

    // Aynı kod var mı
    const existing = await this.prisma.shelf.findUnique({
      where: {
        warehouseId_code: {
          warehouseId: dto.warehouseId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Bu kod ile bir raf zaten mevcut');
    }

    return this.prisma.shelf.create({
      data: {
        code: dto.code,
        name: dto.name,
        warehouseId: dto.warehouseId,
      },
    });
  }

  async removeShelf(organizationId: string, shelfId: string) {
    const shelf = await this.prisma.shelf.findUnique({
      where: { id: shelfId },
      include: { warehouse: true },
    });

    if (!shelf || shelf.warehouse.organizationId !== organizationId) {
      throw new NotFoundException('Raf bulunamadı');
    }

    // Stok var mı kontrol
    const stockCount = await this.prisma.stockLevel.count({
      where: { shelfId },
    });

    if (stockCount > 0) {
      throw new BadRequestException('Bu rafta ürün var. Önce transfer edin.');
    }

    await this.prisma.shelf.delete({
      where: { id: shelfId },
    });

    return { message: 'Raf silindi' };
  }
}
