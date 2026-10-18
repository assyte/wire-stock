import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.unit.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, organizationId },
    });
    if (!unit) throw new NotFoundException('Birim bulunamadı');
    return unit;
  }

  async create(organizationId: string, dto: CreateUnitDto) {
    const existing = await this.prisma.unit.findFirst({
      where: { organizationId, shortName: dto.shortName },
    });
    if (existing) throw new ConflictException('Bu kısa ad ile birim zaten mevcut');

    return this.prisma.unit.create({
      data: { ...dto, organizationId },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateUnitDto) {
    await this.findOne(organizationId, id);
    return this.prisma.unit.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    // Bu birimde ürün var mı kontrol
    const productCount = await this.prisma.product.count({
      where: { unitId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Bu birim ${productCount} ürün tarafından kullanılıyor. Önce ürünleri güncelleyin.`,
      );
    }
    await this.prisma.unit.delete({ where: { id } });
    return { message: 'Birim silindi' };
  }
}