import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

export class InvoiceResponseDto {
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  invoice_number?: string;

  @ApiPropertyOptional()
  date?: string;

  @ApiPropertyOptional()
  bill_to?: string;

  @ApiPropertyOptional()
  subtotal?: number;

  @ApiPropertyOptional({ description: 'Tax percent applied' })
  tax_percent?: number;

  @ApiPropertyOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Discount type: percent | fixed' })
  discount_type?: string;

  @ApiPropertyOptional({ description: 'Discount value (percent or fixed amount depending on discount_type)' })
  discount_value?: number;

  @ApiPropertyOptional()
  other?: number;

  @ApiPropertyOptional()
  total?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  items?: InvoiceItemDto[];
}
