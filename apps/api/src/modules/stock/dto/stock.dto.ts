import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateStockMovementDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  warehouseId: string;

  @ApiProperty({ enum: MovementType, example: MovementType.IN })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shelfId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice?: number;

  @ApiPropertyOptional({ description: 'Bu malzeme kime verildi? (OUT hareketlerinde)' })
  @IsOptional()
  @IsString()
  workerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class StockAdjustmentDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  warehouseId: string;

  @ApiProperty()
  @IsString()
  shelfId: string;

  @ApiProperty({ description: 'Sayım sonucu gerçek miktar' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  actualQuantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class StockTransferDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  fromShelfId: string;

  @ApiProperty()
  @IsString()
  toShelfId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
