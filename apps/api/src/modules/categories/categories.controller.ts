import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Sadece belirtilen parentId altındaki kategorileri getir' })
  @ApiQuery({ name: 'rootsOnly', required: false, description: 'Sadece ana kategorileri getir (parentId null)' })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('parentId') parentId?: string,
    @Query('rootsOnly') rootsOnly?: string,
  ) {
    return this.categoriesService.findAll(organizationId, {
      parentId: parentId === '' || parentId === 'null' ? null : parentId,
      rootsOnly: rootsOnly === 'true',
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Slug ile tek kategori detayı (alt kategorileri + ürün sayısı ile birlikte)' })
  async findBySlug(
    @CurrentUser('organizationId') organizationId: string,
    @Param('slug') slug: string,
  ) {
    return this.categoriesService.findBySlug(organizationId, slug);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kategori oluştur' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(organizationId, id);
  }
}
