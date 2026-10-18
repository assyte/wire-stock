import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Adet' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'ad' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  shortName: string;

  @ApiProperty({ enum: UnitType, example: UnitType.COUNT })
  @IsEnum(UnitType)
  type: UnitType;
}

export class UpdateUnitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;
}