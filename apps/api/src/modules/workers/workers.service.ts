import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateWorkerDto, UpdateWorkerDto } from './dto/worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    options: { search?: string; isActive?: boolean; title?: string } = {},
  ) {
    const { search, isActive, title } = options;

    return this.prisma.worker.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as any } },
            { lastName: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
        ...(title && { title }),
      },
      include: {
        _count: { select: { stockMovements: true } },
      },
      orderBy: [{ isActive: 'desc' }, { firstName: 'asc' }],
    });
  }

  async findOne(organizationId: string, id: string) {
    const worker = await this.prisma.worker.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { id: true, name: true, sku: true } },
            warehouse: { select: { id: true, name: true, code: true } },
          },
        },
        _count: { select: { stockMovements: true } },
      },
    });
    if (!worker) throw new NotFoundException('Çalışan bulunamadı');
    return worker;
  }

  async create(organizationId: string, dto: CreateWorkerDto) {
    // Aynı ad + telefon var mı kontrolü (unique işveren içinde)
    if (dto.phone) {
      const existing = await this.prisma.worker.findFirst({
        where: {
          organizationId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          deletedAt: null,
        },
      });
      if (existing) {
        throw new ConflictException(
          `${dto.firstName} ${dto.lastName} (${dto.phone}) zaten kayıtlı`,
        );
      }
    }

    return this.prisma.worker.create({
      data: {
        ...dto,
        organizationId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateWorkerDto) {
    await this.findOne(organizationId, id);

    // Conflict kontrolü (phone değişiyorsa)
    if (dto.phone) {
      const existing = await this.prisma.worker.findFirst({
        where: {
          organizationId,
          firstName: dto.firstName ?? undefined,
          lastName: dto.lastName ?? undefined,
          phone: dto.phone,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException('Bu telefon numarası başka bir çalışanda kayıtlı');
      }
    }

    return this.prisma.worker.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    const worker = await this.findOne(organizationId, id);

    // Aktif stok hareketi var mı kontrol
    const activeMovements = await this.prisma.stockMovement.count({
      where: { workerId: id, organizationId },
    });

    if (activeMovements > 0) {
      throw new BadRequestException(
        `Bu çalışanın ${activeMovements} stok hareketi var. Pasif yapabilirsiniz ama silemezsiniz.`,
      );
    }

    // Soft delete
    await this.prisma.worker.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { message: 'Çalışan silindi (soft delete)' };
  }

  async toggleActive(organizationId: string, id: string) {
    const worker = await this.findOne(organizationId, id);
    return this.prisma.worker.update({
      where: { id },
      data: { isActive: !worker.isActive },
    });
  }
}