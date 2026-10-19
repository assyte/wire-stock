import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-summary')
  @ApiOperation({
    summary: 'Dashboard özet — toplam ürün, kritik stok, az stok, bugünkü hareketler',
  })
  async getDashboardSummary(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.reportsService.getDashboardSummary(organizationId);
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Kritik stok raporu — min altına düşen ve tükenen ürünler',
  })
  @ApiQuery({ name: 'status', required: false, description: 'CRITICAL | LOW | OUT (hepsi için boş bırak)' })
  @ApiQuery({ name: 'categoryId', required: false })
  async getLowStockReport(
    @CurrentUser('organizationId') organizationId: string,
    @Query('status') status?: 'CRITICAL' | 'LOW' | 'OUT',
    @Query('categoryId') categoryId?: string,
  ) {
    return this.reportsService.getLowStockReport(organizationId, {
      status,
      categoryId,
    });
  }

  @Get('dead-stock')
  @ApiOperation({
    summary: 'Ölü stok raporu — belirtilen gündür hareket görmemiş ürünler',
  })
  @ApiQuery({ name: 'days', required: false, description: 'varsayılan 90 gün' })
  async getDeadStock(
    @CurrentUser('organizationId') organizationId: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? Number(days) : 90;
    return this.reportsService.getDeadStock(organizationId, daysNum);
  }

  @Get('top-movement')
  @ApiOperation({
    summary: 'En çok hareket gören ürünler (son X gün)',
  })
  @ApiQuery({ name: 'days', required: false, description: 'varsayılan 30 gün' })
  @ApiQuery({ name: 'limit', required: false, description: 'varsayılan 20' })
  @ApiQuery({ name: 'type', required: false, description: 'OUT | IN | hepsi (boş)' })
  async getTopMovement(
    @CurrentUser('organizationId') organizationId: string,
    @Query('days') days?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'IN' | 'OUT',
  ) {
    return this.reportsService.getTopMovement(organizationId, {
      days: days ? Number(days) : 30,
      limit: limit ? Number(limit) : 20,
      type,
    });
  }

  @Get('movement-summary')
  @ApiOperation({
    summary: 'Belirli tarih aralığı için hareket özeti (IN/OUT/TRANSFER/ADJUSTMENT/RETURN/DAMAGE)',
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO tarih, varsayılan 30 gün önce' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO tarih, varsayılan bugün' })
  async getMovementSummary(
    @CurrentUser('organizationId') organizationId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getMovementSummary(organizationId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('purchase-suggestion')
  @ApiOperation({
    summary: 'Satın alma önerisi — kritik + azalan + tüketim hızına göre sıralı liste',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'varsayılan 50' })
  async getPurchaseSuggestion(
    @CurrentUser('organizationId') organizationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getPurchaseSuggestion(
      organizationId,
      limit ? Number(limit) : 50,
    );
  }
}