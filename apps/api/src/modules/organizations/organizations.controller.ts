import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mevcut organizasyon bilgileri' })
  async me(@CurrentUser('organizationId') organizationId: string) {
    return this.organizationsService.getCurrent(organizationId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Organizasyon bilgilerini güncelle' })
  async update(
    @CurrentUser('organizationId') organizationId: string,
    @Body() body: any,
  ) {
    return this.organizationsService.update(organizationId, body);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Organizasyon istatistikleri' })
  async stats(@CurrentUser('organizationId') organizationId: string) {
    return this.organizationsService.getStats(organizationId);
  }
}
