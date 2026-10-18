import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { UnitsService } from './units.service';

@ApiTags('units')
@ApiBearerAuth('JWT-auth')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm ölçü birimleri' })
  async findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.unitsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Birim detayı' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.unitsService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni ölçü birimi' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.unitsService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Birim güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
  ) {
    return this.unitsService.update(organizationId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Birim sil' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.unitsService.remove(organizationId, id);
  }
}