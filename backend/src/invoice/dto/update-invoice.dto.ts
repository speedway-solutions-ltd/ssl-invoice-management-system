import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceItemDto } from './invoice-item.dto';

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: 'Billing TO company id' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  billing_to_id?: number;

  @ApiPropertyOptional({ description: 'Billing FROM company id' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  billing_from_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Tax percent to apply to taxable base' })
  @IsOptional()
  @IsNumber()
  tax_percent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiPropertyOptional({ description: 'Discount type: percent or fixed' })
  @IsOptional()
  @IsString()
  discount_type?: string;

  @ApiPropertyOptional({ description: 'Discount value (percent or fixed amount depending on discount_type)' })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

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
