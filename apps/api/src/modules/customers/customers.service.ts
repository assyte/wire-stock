import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {},
  ) {
    const { page = 1, pageSize = 50, search, isActive } = options;

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } as any },
          { code: { contains: search, mode: Prisma.QueryMode.insensitive } as any },
          { phone: { contains: search, mode: Prisma.QueryMode.insensitive } as any },
          { taxNumber: { contains: search, mode: Prisma.QueryMode.insensitive } as any },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          _count: { select: { salesOrders: true, projects: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        _count: { select: { salesOrders: true, projects: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    return customer;
  }

  async create(organizationId: string, dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: { organizationId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Bu kod ile bir müşteri zaten mevcut');
    }

    return this.prisma.customer.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(organizationId, id);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    const customer = await this.findOne(organizationId, id);

    // Aktif satış siparişi var mı kontrol
    const activeOrders = await this.prisma.salesOrder.count({
      where: { customerId: id, status: { in: ['DRAFT', 'CONFIRMED', 'PREPARING', 'READY'] } },
    });

    if (activeOrders > 0) {
      throw new BadRequestException(
        `Bu müşterinin ${activeOrders} aktif satış siparişi var. Önce onları tamamlayın.`,
      );
    }

    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Müşteri silindi' };
  }
}