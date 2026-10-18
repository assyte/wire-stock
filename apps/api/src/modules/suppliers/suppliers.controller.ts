import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@ApiBearerAuth('JWT-auth')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Tedarikçileri listele' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const page = pageRaw ? parseInt(pageRaw, 10) : undefined;
    const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : undefined;
    return this.suppliersService.findAll(organizationId, {
      page,
      pageSize,
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tedarikçi detayı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni tedarikçi' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Tedarikçi güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Tedarikçi sil (soft)' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.suppliersService.remove(organizationId, id);
  }
}