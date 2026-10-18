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

import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Müşterileri listele (filtreleme + pagination)' })
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
    return this.customersService.findAll(organizationId, {
      page,
      pageSize,
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Müşteri güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Müşteri sil (soft delete)' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.remove(organizationId, id);
  }
}