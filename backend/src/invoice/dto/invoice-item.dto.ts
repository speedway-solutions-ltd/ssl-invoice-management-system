import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class InvoiceItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  item_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  qty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  unit_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  total?: number;
}
