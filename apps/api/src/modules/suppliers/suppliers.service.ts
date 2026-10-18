import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {},
  ) {
    const { page = 1, pageSize = 50, search, isActive } = options;

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where: {
          organizationId,
          deletedAt: null,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' as any } },
              { code: { contains: search, mode: 'insensitive' as any } },
              { phone: { contains: search, mode: 'insensitive' as any } },
              { taxNumber: { contains: search, mode: 'insensitive' as any } },
            ],
          }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          _count: { select: { products: true, purchaseOrders: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.supplier.count({
        where: {
          organizationId,
          deletedAt: null,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' as any } },
              { code: { contains: search, mode: 'insensitive' as any } },
            ],
          }),
          ...(isActive !== undefined && { isActive }),
        },
      }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(organizationId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, sku: true } } },
          take: 20,
        },
        _count: { select: { products: true, purchaseOrders: true, invoices: true } },
      },
    });
    if (!supplier) throw new NotFoundException('Tedarikçi bulunamadı');
    return supplier;
  }

  async create(organizationId: string, dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({
      where: { organizationId, code: dto.code },
    });
    if (existing) throw new ConflictException('Bu kod ile tedarikçi zaten mevcut');

    return this.prisma.supplier.create({
      data: { ...dto, organizationId, isActive: true },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(organizationId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    const supplier = await this.findOne(organizationId, id);

    const orderCount = await this.prisma.purchaseOrder.count({
      where: { supplierId: id, status: { in: ['DRAFT', 'SENT', 'CONFIRMED'] } },
    });
    if (orderCount > 0) {
      throw new BadRequestException(
        `Bu tedarikçinin ${orderCount} aktif siparişi var. Önce onları tamamlayın.`,
      );
    }

    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Tedarikçi silindi' };
  }
}