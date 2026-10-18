import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/category.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele' })
  async findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.categoriesService.findAll(organizationId);
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
