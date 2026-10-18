import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            warehouses: true,
            products: true,
            customers: true,
            suppliers: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organizasyon bulunamadı');
    }

    return org;
  }

  async update(
    organizationId: string,
    data: {
      name?: string;
      taxNumber?: string;
      taxOffice?: string;
      address?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      phone?: string;
      email?: string;
      website?: string;
    },
  ) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  async getStats(organizationId: string) {
    const [totalProducts, totalCustomers, totalSuppliers, totalWarehouses, lowStockProducts, outOfStockProducts] =
      await Promise.all([
        this.prisma.product.count({
          where: { organizationId, deletedAt: null },
        }),
        this.prisma.customer.count({
          where: { organizationId, deletedAt: null },
        }),
        this.prisma.supplier.count({
          where: { organizationId, deletedAt: null },
        }),
        this.prisma.warehouse.count({
          where: { organizationId, isActive: true },
        }),
        this.prisma.product.count({
          where: {
            organizationId,
            deletedAt: null,
            stockLevels: {
              some: {
                quantity: { lte: 0 },
              },
            },
          },
        }),
        this.prisma.product.count({
          where: {
            organizationId,
            deletedAt: null,
            stockLevels: {
              none: {},
            },
          },
        }),
      ]);

    return {
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalWarehouses,
      lowStockProducts,
      outOfStockProducts,
    };
  }
}
