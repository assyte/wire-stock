import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateWorkerDto, UpdateWorkerDto, WORKER_TITLES } from './dto/worker.dto';
import { WorkersService } from './workers.service';

@ApiTags('workers')
@ApiBearerAuth('JWT-auth')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @ApiOperation({ summary: 'Çalışanları listele' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'title', required: false })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('title') title?: string,
  ) {
    return this.workersService.findAll(organizationId, {
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      title,
    });
  }

  @Get('titles')
  @ApiOperation({ summary: 'Çalışan unvanları (sabit liste)' })
  async getTitles() {
    return WORKER_TITLES;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Çalışan detayı (son 10 hareket dahil)' })
  async findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.workersService.findOne(organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni çalışan ekle' })
  async create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() dto: CreateWorkerDto,
  ) {
    return this.workersService.create(organizationId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Çalışan güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkerDto,
  ) {
    return this.workersService.update(organizationId, id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Aktif/pasif toggle' })
  async toggle(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.workersService.toggleActive(organizationId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Çalışan sil (soft delete)' })
  async remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.workersService.remove(organizationId, id);
  }
}