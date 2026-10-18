import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Ana Depo' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ANA' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateShelfDto {
  @ApiProperty({ example: 'A-1' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @ApiPropertyOptional({ example: 'Sol üst raf' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Depo ID' })
  @IsString()
  warehouseId: string;
}
