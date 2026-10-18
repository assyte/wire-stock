import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SalesStatus } from '@prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: {
      page?: number;
      pageSize?: number;
      status?: SalesStatus;
      customerId?: string;
    } = {},
  ) {
    const { page = 1, pageSize = 20, status, customerId } = options;

    const where = {
      organizationId,
      deletedAt: null,
      ...(status && { status }),
      ...(customerId && { customerId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, code: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.salesOrder.count({ where }),
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

  async findOne(organizationId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, code: true, phone: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Satış siparişi bulunamadı');
    }

    return order;
  }

  async create(organizationId: string, userId: string, dto: CreateSalesOrderDto) {
    // Müşteri kontrolü
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    // Sipariş numarası unique mi
    const existing = await this.prisma.salesOrder.findUnique({
      where: { organizationId_orderNumber: { organizationId, orderNumber: dto.orderNumber } },
    });
    if (existing) {
      throw new ConflictException('Bu numara ile bir sipariş zaten mevcut');
    }

    // Ürünler mevcut mu ve hesaplamalar
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, organizationId, deletedAt: null },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Bir veya daha fazla ürün bulunamadı');
    }

    // Toplamları hesapla
    let subtotal = 0;
    let vatTotal = 0;
    let total = 0;

    for (const item of dto.items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discount = item.discount ?? 0;
      const afterDiscount = itemSubtotal - discount;
      const itemVat = afterDiscount * ((item.vatRate ?? 20) / 100);
      const itemTotal = afterDiscount + itemVat;

      subtotal += itemSubtotal;
      vatTotal += itemVat;
      total += itemTotal;
    }

    // Transaction ile oluştur
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          organizationId,
          customerId: dto.customerId,
          orderNumber: dto.orderNumber,
          status: dto.status ?? SalesStatus.DRAFT,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
          shippingAddress: dto.shippingAddress,
          note: dto.note,
          subtotal,
          vatTotal,
          total,
          items: {
            create: dto.items.map((item) => {
              const itemSubtotal = item.quantity * item.unitPrice;
              const discount = item.discount ?? 0;
              const afterDiscount = itemSubtotal - discount;
              const itemVat = afterDiscount * ((item.vatRate ?? 20) / 100);
              const itemTotal = afterDiscount + itemVat;
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate ?? 20,
                discount: item.discount ?? 0,
                total: itemTotal,
              };
            }),
          },
        },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });

      return order;
    });
  }

  async update(organizationId: string, id: string, dto: UpdateSalesOrderDto) {
    const order = await this.findOne(organizationId, id);

    if (order.status === SalesStatus.INVOICED) {
      throw new BadRequestException('Faturalanmış sipariş düzenlenemez');
    }
    if (order.status === SalesStatus.CANCELLED) {
      throw new BadRequestException('İptal edilmiş sipariş düzenlenemez');
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: dto.status,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        shippingAddress: dto.shippingAddress,
        note: dto.note,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const order = await this.findOne(organizationId, id);

    if (order.status === SalesStatus.INVOICED || order.status === SalesStatus.DELIVERED) {
      throw new BadRequestException('Bu durumdaki sipariş silinemez');
    }

    await this.prisma.salesOrder.update({
      where: { id },
      data: { deletedAt: new Date(), status: SalesStatus.CANCELLED },
    });

    return { message: 'Sipariş iptal edildi' };
  }
}