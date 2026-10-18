import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

import { StockService } from './stock.service';
import {
  CreateStockMovementDto,
  StockAdjustmentDto,
  StockTransferDto,
} from './dto/stock.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('stock')
@ApiBearerAuth('JWT-auth')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movements')
  @ApiOperation({ summary: 'Stok hareketi oluştur (giriş/çıkış/iade)' })
  async createMovement(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockMovementDto,
  ) {
    return this.stockService.createMovement(organizationId, userId, dto);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Sayım sonrası stok düzeltmesi' })
  async adjust(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.stockService.adjust(organizationId, userId, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Raf/Depo arası transfer' })
  async transfer(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StockTransferDto,
  ) {
    return this.stockService.transfer(organizationId, userId, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Stok hareketleri listele' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiQuery({ name: 'type', enum: MovementType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getMovements(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('type') type?: MovementType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockService.getMovements(organizationId, {
      page,
      pageSize,
      productId,
      warehouseId,
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Düşük stoklu ürünler' })
  async getLowStock(@CurrentUser('organizationId') organizationId: string) {
    return this.stockService.getLowStockProducts(organizationId);
  }
}
