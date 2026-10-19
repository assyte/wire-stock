import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  IsBoolean,
  IsIn,
} from 'class-validator';

// Çalışan unvanları — sabit enum
export const WORKER_TITLES = ['Usta Elektrikçi', 'Çırak', 'İşveren'] as const;
export type WorkerTitle = typeof WORKER_TITLES[number];

export class CreateWorkerDto {
  @ApiProperty({ example: 'Faruk' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Yıldırım' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ enum: WORKER_TITLES, example: 'Usta Elektrikçi' })
  @IsString()
  @IsIn(WORKER_TITLES)
  title: WorkerTitle;

  @ApiPropertyOptional({ example: '+90 532 111 22 33' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'faruk@firma.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '10 yıllık tecrübeli' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWorkerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({ enum: WORKER_TITLES })
  @IsOptional()
  @IsString()
  @IsIn(WORKER_TITLES)
  title?: WorkerTitle;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}