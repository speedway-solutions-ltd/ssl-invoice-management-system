import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';
import { InvoiceItemDto } from './invoice-item.dto';

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({ description: 'ISO date string, e.g. 2025-12-05' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bill_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  other?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  @IsOptional()
  @IsArray()
  items?: InvoiceItemDto[];
}
