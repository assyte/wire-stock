import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[çÇğĞşŞüÜıİöÖ]/g, (m) => {
        const map: Record<string, string> = {
          ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ş: 's', Ş: 'S',
          ü: 'u', Ü: 'U', ı: 'i', İ: 'I', ö: 'o', Ö: 'O',
        };
        return map[m] || m;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async findAll(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(organizationId: string, dto: CreateCategoryDto) {
    const baseSlug = this.generateSlug(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (
      await this.prisma.category.findUnique({
        where: { organizationId_slug: { organizationId, slug } },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        slug,
        organizationId,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, organizationId },
    });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    // Ürün var mı kontrol
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `Bu kategoride ${productCount} ürün var. Önce ürünleri taşıyın.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Kategori silindi' };
  }
}
