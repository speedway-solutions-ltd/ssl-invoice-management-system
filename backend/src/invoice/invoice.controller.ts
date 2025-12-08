import { Controller, Get, Post, Body, Param, Put, Delete, Res, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private svc: InvoiceService) { }
  @Get()
  @ApiOperation({ summary: 'List invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices', type: [InvoiceResponseDto] })
  list() {
    return this.svc.findAll();
  }
  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 201, description: 'Created invoice', type: InvoiceResponseDto })
  @ApiBody({ type: CreateInvoiceDto })
  create(@Body() body: CreateInvoiceDto) {
    return this.svc.create(body);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by id' })
  @ApiParam({ name: 'id', description: 'Invoice id' })
  @ApiResponse({ status: 200, description: 'Invoice', type: InvoiceResponseDto })
  get(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }
  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id', description: 'Invoice id' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ status: 200, description: 'Updated invoice', type: InvoiceResponseDto })
  update(@Param('id') id: string, @Body() body: UpdateInvoiceDto) {
    return this.svc.update(Number(id), body);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiParam({ name: 'id', description: 'Invoice id' })
  @ApiResponse({ status: 200, description: 'Deletion result' })
  delete(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
  // // Generate a simple PDF
  // @Get(':id/pdf')
  // async pdf(@Param('id') id: string, @Res() res: Response) {
  //   const inv = await this.svc.findOne(Number(id));
  //   if (!inv) throw new NotFoundException();
  //   const doc = new PDFDocument({ size: 'A4', margin: 50 });
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', `attachment; filename=invoice-${inv.invoice_number || inv.id}.pdf`);
  //   doc.fontSize(20).text('Invoice', { align: 'right' });
  //   doc.moveDown();
  //   doc.fontSize(10).text(`Invoice #: ${inv.invoice_number || inv.id}`);
  //   doc.text(`Date: ${inv.date}`);
  //   doc.moveDown();
  //   doc.text('Bill To:');
  //   doc.text(inv.bill_to || '');
  //   doc.moveDown();
  //   doc.text('Items:');
  //   inv.items?.forEach((it: any) => {
  //     doc.text(`${it.item_code || ''} - ${it.description || ''} | qty: ${it.qty || ''} | unit: ${it.unit_price || ''} | total: ${it.total || ''}`);
  //   });
  //   doc.moveDown();
  //   doc.text(`Subtotal: ${inv.subtotal || ''}`);
  //   doc.text(`Tax: ${inv.tax || ''}`);
  //   doc.text(`Other: ${inv.other || ''}`);
  //   doc.moveDown();
  //   doc.fontSize(14).text(`Total: ${inv.total || ''}`);
  //   doc.end();
  //   doc.pipe(res);
  // }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res() res: Response) {
    const inv = await this.svc.pdf(id, res);
    console.log('inv:::', inv);
    
    return inv;
  }
}
