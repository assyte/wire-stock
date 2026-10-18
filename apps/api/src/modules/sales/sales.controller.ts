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
import { SalesStatus } from '@prisma/client';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales.dto';
import { SalesService } from './sales.service';

@ApiTags('sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Satış siparişlerini listele' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('status') status?: SalesStatus,
    @Query('customerId') customerId?: string,
  ) {
    return this.salesService.findAll(organizationId, { page, pageSize, status, customerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Satış siparişi detayı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni satış siparişi oluştur' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSalesOrderDto,
  ) {
    return this.salesService.create(organizationId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Satış siparişini güncelle (status değişimi vb.)' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    return this.salesService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Satış siparişini iptal et' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.remove(organizationId, id);
  }
}