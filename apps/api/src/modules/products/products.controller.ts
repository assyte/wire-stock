import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Ürünleri listele (filtreleme + pagination)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'lowStock', required: false })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.productsService.findAll(organizationId, {
      page,
      pageSize,
      search,
      categoryId,
      brandId,
      lowStock: lowStock === 'true',
    });
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Barkod ile ürün bul' })
  async findByBarcode(
    @CurrentUser('organizationId') organizationId: string,
    @Param('barcode') barcode: string,
  ) {
    return this.productsService.findByBarcode(organizationId, barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detayı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ürün güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Ürün sil (soft delete)' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(organizationId, id);
  }
}
