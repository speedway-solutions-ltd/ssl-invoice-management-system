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

  @ApiPropertyOptional()
  tax?: number;

  @ApiPropertyOptional()
  other?: number;

  @ApiPropertyOptional()
  total?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  items?: InvoiceItemDto[];
}
