import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CurrentUser, CurrentUserData } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı ve organizasyon kaydı' })
  @ApiResponse({
    status: 201,
    description: 'Kayıt başarılı',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'E-posta zaten kullanılıyor' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'E-posta ve şifre ile giriş' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Geçersiz bilgiler' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token ile yeni access token al' })
  @ApiResponse({ status: 200, description: 'Yeni token üretildi' })
  @ApiResponse({ status: 401, description: 'Geçersiz token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Çıkış yap (token sil)' })
  @ApiResponse({ status: 200, description: 'Çıkış başarılı' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mevcut kullanıcı bilgilerini getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı bilgileri' })
  async me(@CurrentUser() user: CurrentUserData) {
    return this.authService.me(user.id);
  }
}
