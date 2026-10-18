import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateShelfDto,
} from './dto/warehouse.dto';
import { WarehousesService } from './warehouses.service';

@ApiTags('warehouses')
@ApiBearerAuth('JWT-auth')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm depoları listele' })
  @ApiResponse({ status: 200, description: 'Depo listesi' })
  async findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.warehousesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Depo detayı (raflar ile birlikte)' })
  @ApiResponse({ status: 200, description: 'Depo detayı' })
  @ApiResponse({ status: 404, description: 'Depo bulunamadı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.warehousesService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni depo oluştur' })
  @ApiResponse({ status: 201, description: 'Depo oluşturuldu' })
  @ApiResponse({ status: 409, description: 'Kod zaten mevcut' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Depo güncelle' })
  @ApiResponse({ status: 200, description: 'Depo güncellendi' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Depo sil' })
  @ApiResponse({ status: 200, description: 'Depo silindi' })
  @ApiResponse({ status: 400, description: 'Stok hareketi var' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.warehousesService.remove(organizationId, id);
  }

  // ============================================
  // SHELVES
  // ============================================

  @Post('shelves')
  @ApiOperation({ summary: 'Yeni raf oluştur' })
  async addShelf(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateShelfDto,
  ) {
    return this.warehousesService.addShelf(organizationId, dto);
  }

  @Delete('shelves/:shelfId')
  @ApiOperation({ summary: 'Raf sil' })
  async removeShelf(
    @CurrentUser('organizationId') organizationId: string,
    @Param('shelfId') shelfId: string,
  ) {
    return this.warehousesService.removeShelf(organizationId, shelfId);
  }
}
