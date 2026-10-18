import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, options: { search?: string; isActive?: boolean } = {}) {
    const { search, isActive } = options;

    return this.prisma.customer.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { taxNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: { select: { salesOrders: true, projects: true } },
      },
      orderBy: { name: 'asc' },
    });
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