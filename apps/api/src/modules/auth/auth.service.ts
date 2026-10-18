import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, Plan, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/common/prisma/prisma.service';

import { RegisterDto, LoginDto } from './dto/auth.dto';

interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Yeni kullanıcı ve organizasyon kaydı
   */
  async register(dto: RegisterDto) {
    // Email kontrolü
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    // Slug oluştur
    const baseSlug = this.generateSlug(dto.organizationName);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Şifre hashle
    const hashedPassword = await this.hashPassword(dto.password);

    // Transaction ile kullanıcı + organizasyon oluştur
    const result = await this.prisma.$transaction(async (tx) => {
      // Organizasyon
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug,
          businessType: dto.businessType,
          plan: Plan.FREE,
          phone: dto.phone,
        },
      });

      // Kullanıcı (owner)
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: UserRole.OWNER,
          organizationId: organization.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
        },
      });

      // Varsayılan birimler
      await this.createDefaultUnits(tx, organization.id);

      // Varsayılan depo
      const defaultWarehouse = await tx.warehouse.create({
        data: {
          name: 'Ana Depo',
          code: 'ANA',
          organizationId: organization.id,
          isDefault: true,
        },
      });

      // Varsayılan raflar
      const shelfCodes = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1', 'C-2'];
      await tx.shelf.createMany({
        data: shelfCodes.map((code) => ({
          code,
          warehouseId: defaultWarehouse.id,
        })),
      });

      // Varsayılan kategoriler
      await this.createDefaultCategories(tx, organization.id);

      return { user, organization };
    });

    // Token üret
    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.organizationId,
      result.user.role,
    );

    return {
      ...tokens,
      user: result.user,
    };
  }

  /**
   * Giriş yap
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    // Son giriş zamanını güncelle
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.organizationId,
      user.role,
    );

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Refresh token ile yeni access token al
   */
  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Geçersiz token tipi');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }

      // Eski refresh token'ı session tablosundan sil (rotation)
      // Token unique olduğu için aynı token'la tekrar session yaratılırsa conflict olur
      await this.prisma.session.deleteMany({
        where: { token: refreshToken },
      });

      return this.generateTokens(user.id, user.email, user.organizationId, user.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token');
    }
  }

  /**
   * Çıkış yap (token'ı sil)
   */
  async logout(userId: string) {
    // Session tablosundan ilgili token'ları sil
    // (Şimdilik tüm session'ları siliyoruz, ileride cihaz bazlı yapılabilir)
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Çıkış yapıldı' };
  }

  /**
   * Mevcut kullanıcıyı getir
   */
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        organizationId: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessType: true,
            plan: true,
            currency: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    return user;
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async generateTokens(
    userId: string,
    email: string,
    organizationId: string,
    role: string,
  ) {
    const payload: Omit<JwtPayload, 'type'> = {
      sub: userId,
      email,
      organizationId,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: this.configService.get<string>('jwt.expiresIn'),
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    // Refresh token'ı veritabanına kaydet
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
    await this.prisma.session.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 dakika (saniye)
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get<number>('bcrypt.rounds', 12);
    return bcrypt.hash(password, rounds);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/[ıİ]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async createDefaultUnits(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ) {
    const units = [
      { name: 'Adet', shortName: 'ad', type: 'COUNT' as const },
      { name: 'Metre', shortName: 'm', type: 'LENGTH' as const },
      { name: 'Kilogram', shortName: 'kg', type: 'WEIGHT' as const },
      { name: 'Litre', shortName: 'lt', type: 'VOLUME' as const },
      { name: 'Rulo', shortName: 'rl', type: 'LENGTH' as const },
      { name: 'Kutu', shortName: 'kt', type: 'COUNT' as const },
    ];

    for (const unit of units) {
      await tx.unit.create({
        data: { ...unit, organizationId },
      });
    }
  }

  private async createDefaultCategories(
    tx: Prisma.TransactionClient,
    organizationId: string,
  ) {
    const categories = [
      { name: 'Kablolar', slug: 'kablolar', icon: 'cable', color: '#00D9A3' },
      { name: 'Pano & Sigorta', slug: 'pano-sigorta', icon: 'shield', color: '#FFB800' },
      { name: 'Aydınlatma', slug: 'aydinlatma', icon: 'lightbulb', color: '#F59E0B' },
      { name: 'Anahtar & Priz', slug: 'anahtar-priz', icon: 'plug', color: '#3B82F6' },
      { name: 'Kanal & Boru', slug: 'kanal-boru', icon: 'package', color: '#8B5CF6' },
      { name: 'Topraklama', slug: 'topraklama', icon: 'shield-check', color: '#10B981' },
    ];

    for (const category of categories) {
      await tx.category.create({
        data: { ...category, organizationId },
      });
    }
  }
}
