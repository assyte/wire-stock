import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

  // Güvenlik
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix (versioning MVP için kapalı — URL temiz, istemci uyumlu)
  app.setGlobalPrefix(apiPrefix);
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // query params allow extra keys (frontend may add future filters)
      transform: true,
      transformOptions: {
        enableImplicitConversion: false, // ❗ query string'leri otomatik number'a çevirmesin
      },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WireStock API')
    .setDescription('WireStock - Elektrik Sektörü SaaS API Dokümantasyonu')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Kimlik doğrulama')
    .addTag('users', 'Kullanıcı yönetimi')
    .addTag('warehouses', 'Depo yönetimi')
    .addTag('categories', 'Kategori yönetimi')
    .addTag('products', 'Ürün yönetimi')
    .addTag('stock', 'Stok yönetimi')
    .addTag('health', 'Sistem durumu')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  console.log(`
  ⚡ WireStock API çalışıyor
  🌐 URL:        http://localhost:${port}/${apiPrefix}
  📚 Swagger:    http://localhost:${port}/${apiPrefix}/docs
  🏥 Health:     http://localhost:${port}/${apiPrefix}/health
  🌍 Environment: ${configService.get<string>('NODE_ENV', 'development')}
  `);
}

bootstrap();
