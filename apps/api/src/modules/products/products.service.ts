import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: {
      page?: number;
      pageSize?: number;
      search?: string;
      categoryId?: string;
      brandId?: string;
      isActive?: boolean;
      lowStock?: boolean;
    } = {},
  ) {
    const {
      page = 1,
      pageSize = 20,
      search,
      categoryId,
      brandId,
      isActive,
      lowStock,
    } = options;

    const where: Prisma.ProductWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          brand: { select: { id: true, name: true, logoUrl: true } },
          unit: { select: { id: true, name: true, shortName: true } },
          stockLevels: {
            select: { quantity: true, reserved: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithStock = items.map((product) => {
      const totalStock = product.stockLevels.reduce(
        (sum, level) => sum + Number(level.quantity),
        0,
      );
      const { stockLevels: _sl, ...rest } = product;
      return { ...rest, totalStock };
    });

    let filtered = productsWithStock;
    if (lowStock) {
      filtered = productsWithStock.filter(
        (p) => p.totalStock <= Number(p.minStock),
      );
    }

    return {
      items: filtered,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
        stockLevels: {
          include: {
            shelf: {
              include: { warehouse: true },
            },
          },
        },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true } },
            warehouse: { select: { name: true, code: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  async findByBarcode(organizationId: string, barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { organizationId, barcode, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        stockLevels: {
          select: { quantity: true, shelfId: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Bu barkoda sahip ürün bulunamadı');
    }

    return product;
  }

  async create(organizationId: string, dto: CreateProductDto) {
    // SKU kontrolü
    const existing = await this.prisma.product.findUnique({
      where: { organizationId_sku: { organizationId, sku: dto.sku } },
    });

    if (existing) {
      throw new ConflictException('Bu SKU kodu zaten kullanılıyor');
    }

    // Kategori kontrolü
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, organizationId },
    });

    if (!category) {
      throw new BadRequestException('Kategori bulunamadı');
    }

    // Birim kontrolü
    const unit = await this.prisma.unit.findFirst({
      where: { id: dto.unitId, organizationId },
    });

    if (!unit) {
      throw new BadRequestException('Birim bulunamadı');
    }

    // Marka kontrolü (varsa)
    if (dto.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: { id: dto.brandId, organizationId },
      });
      if (!brand) {
        throw new BadRequestException('Marka bulunamadı');
      }
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        organizationId,
      },
      include: {
        category: true,
        unit: true,
        brand: true,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(organizationId, id);

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        unit: true,
        brand: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    // Stok var mı kontrol
    const stockSum = await this.prisma.stockLevel.aggregate({
      where: { productId: id },
      _sum: { quantity: true },
    });

    if (Number(stockSum._sum.quantity || 0) > 0) {
      throw new BadRequestException(
        'Bu ürünün stoğu var. Önce stoku sıfırlayın.',
      );
    }

    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Ürün silindi' };
  }
}
