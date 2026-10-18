import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma veritabanına bağlandı');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Prisma bağlantısı kapatıldı');
  }

  /**
   * Soft delete helper
   */
  softDelete(model: string) {
    return {
      delete: async (where: any) => {
        return (this as any)[model].update({
          where,
          data: { deletedAt: new Date() },
        });
      },
    };
  }
}
