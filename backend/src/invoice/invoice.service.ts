import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entity/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Response } from 'express';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>
  ) { }
  create(dto: CreateInvoiceDto) {
    const inv = this.invoiceRepo.create(dto as any);
    return this.invoiceRepo.save(inv);
  }

  findAll() {
    return this.invoiceRepo.find({ relations: ['items'], order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const inv = await this.invoiceRepo.findOne({ where: { id }, relations: ['items'] });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    await this.invoiceRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const inv = await this.findOne(id);
    return this.invoiceRepo.remove(inv);
  }


  // Controller imports at top of file (if not already present)
  // import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
  // import { Response } from 'express';
  // import PDFDocument from 'pdfkit';
  async pdf(id: string, res: Response) {
    const inv = await this.findOne(Number(id));
    if (!inv) throw new NotFoundException('Invoice not found');

    // Helper: format numbers safely
    const fmt = (v: any) => {
      if (v === null || v === undefined || v === '') return '-';
      const n = Number(v);
      if (Number.isNaN(n)) return String(v);
      return n.toFixed(2);
    };

    // Create PDF doc with safe margins
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    try {
      // Prepare response headers BEFORE piping
      res.status(200);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice-${inv.invoice_number ?? inv.id}.pdf`,
      );
      // Make sure headers are sent early
      res.flushHeaders && res.flushHeaders();

      // Pipe PDF stream to response
      doc.pipe(res);

      // Basic layout metrics (dynamic)
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const left = doc.page.margins.left;
      const right = pageWidth - doc.page.margins.right;

      // --- Header (company left, invoice title right) ---
      doc.fontSize(16).fillColor('#000').text('Speedway Solutions Ltd.', left, 40);
      // Optional: add a small subtitle / address line
      doc.fontSize(9).fillColor('#333').text('Blue Moon Gram Tower, 167/24, ECB Chattar, Dhaka Cantonment, Dhaka-1206', left, 60);

      // Invoice title box on the right
      const titleBoxWidth = 180;
      const titleBoxX = right - titleBoxWidth;
      doc.fontSize(26).fillColor('#000').text('INVOICE', titleBoxX, 40, { width: titleBoxWidth, align: 'right' });

      doc.fontSize(9).fillColor('#000').text(`DATE: ${inv.date ?? '—'}`, titleBoxX, 80, { width: titleBoxWidth, align: 'right' });
      doc.text(`PO #: ${inv.invoice_number ?? '—'}`, { width: titleBoxWidth, align: 'right' });

      // --- Address blocks ---
      const topBlockY = 110;
      const leftBlockWidth = (pageWidth - doc.page.margins.left - doc.page.margins.right) * 0.52;
      const rightBlockX = left + leftBlockWidth + 20;
      const rightBlockWidth = pageWidth - doc.page.margins.right - rightBlockX;

      // Company block (left)
      doc.fontSize(9).fillColor('#000').text('Speedway Solutions Ltd.', left, topBlockY);
      doc.text('Phone: +880 1775 274090');
      doc.text('Website: https://speedway-solutions.com/');

      // Bill To box (right)
      doc.save();
      doc.rect(rightBlockX - 6, topBlockY - 6, rightBlockWidth + 12, 70).fillOpacity(0.06).fill('#f2f2f2');
      doc.restore();
      doc.fillColor('#000').fontSize(10).text('Bill To', rightBlockX, topBlockY);
      const billText = (inv.bill_to || '').replace(/\r/g, '').split('\n').join('\n');
      doc.fontSize(9).text(billText || '-', rightBlockX, topBlockY + 16, { width: rightBlockWidth });

      // --- Items table ---
      const tableTopY = topBlockY + 100;
      const tableLeft = left;
      const tableRight = right;
      // Define column widths (item | desc | qty | unit | total)
      const colItemW = 90;
      const colQtyW = 50;
      const colUnitW = 80;
      const colTotalW = 80;
      const colDescW = tableRight - tableLeft - (colItemW + colQtyW + colUnitW + colTotalW) - 12;

      // Draw table header and rows with auto-height per item (wrap descriptions)
      const headerHeight = 22;
      const headerGap = 4;
      const minRowHeight = 20;
      const items = Array.isArray(inv.items) ? inv.items : [];

      const drawTableHeader = (atY: number) => {
        // header background
        doc.rect(tableLeft, atY - 6, tableRight - tableLeft, headerHeight).fill('#f2a6a6');
        doc.fillColor('#000').fontSize(9).text('ITEM #', tableLeft + 6, atY);
        doc.text('DESCRIPTION', tableLeft + colItemW + 12, atY);
        doc.text('QTY', tableLeft + colItemW + 12 + colDescW + 6, atY);
        doc.text('UNIT PRICE', tableLeft + colItemW + 12 + colDescW + 6 + colQtyW + 6, atY);
        doc.text('TOTAL', tableRight - colTotalW + 6, atY);
        return atY + headerHeight + headerGap;
      };

      let y = drawTableHeader(tableTopY);

      const ensureNewPage = (spaceNeeded = minRowHeight) => {
        if (y + spaceNeeded > pageHeight - 120) {
          doc.addPage();
          // after adding a page, re-draw header at top
          y = drawTableHeader(60);
        }
      };

      if (items.length === 0) {
        ensureNewPage(minRowHeight);
        doc.rect(tableLeft, y - 4, tableRight - tableLeft, minRowHeight).stroke('#e0e0e0');
        doc.fontSize(9).fillColor('#666').text('No items', tableLeft + 6, y);
        y += minRowHeight;
      } else {
        for (const it of items) {
          // measure description height for wrapping
          const desc = (it.description || '-').toString();
          const descHeight = doc.heightOfString(desc, { width: colDescW - 6, align: 'left' });
          const itemCodeHeight = doc.heightOfString((it.item_code || '-').toString(), { width: colItemW - 10 });
          const qtyHeight = doc.heightOfString(String(it.qty ?? '-'), { width: colQtyW });
          const unitHeight = doc.heightOfString(fmt(it.unit_price), { width: colUnitW });
          const totalHeight = doc.heightOfString(fmt(it.total), { width: colTotalW - 10 });

          const contentHeight = Math.max(descHeight, itemCodeHeight, qtyHeight, unitHeight, totalHeight);
          const rowHeight = Math.max(minRowHeight, contentHeight + 6);

          ensureNewPage(rowHeight + 4);

          // light row border
          doc.lineWidth(0.3).strokeColor('#e6e6e6').rect(tableLeft, y - 4, tableRight - tableLeft, rowHeight).stroke();

          // item code
          doc.fontSize(9).fillColor('#000').text(it.item_code ?? '-', tableLeft + 6, y, { width: colItemW - 10 });

          // description (allow wrap)
          const descX = tableLeft + colItemW + 12;
          doc.fontSize(9).fillColor('#000').text(desc, descX, y, { width: colDescW - 6 });

          // qty centered
          const qtyX = descX + colDescW + 6;
          doc.text(String(it.qty ?? '-'), qtyX, y, { width: colQtyW, align: 'center' });

          // unit price right aligned
          const unitX = qtyX + colQtyW + 6;
          doc.text(fmt(it.unit_price), unitX, y, { width: colUnitW, align: 'right' });

          // total right aligned
          doc.text(fmt(it.total), tableRight - colTotalW + 6, y, { width: colTotalW - 10, align: 'right' });

          // advance y by rowHeight
          y += rowHeight;
        }
      }

      // --- Comments area (left) and Totals (right) ---
      const commentsY = Math.max(y + 12, tableTopY + 180);
      // Comments box
      doc.rect(left, commentsY, leftBlockWidth, 80).stroke('#d0d0d0');
      doc.fontSize(9).fillColor('#666').text('Comments / Special Instructions', left + 6, commentsY + 6);
      doc.fontSize(9).fillColor('#000').text(inv.notes ?? '-', left + 6, commentsY + 22, { width: leftBlockWidth - 12 });

      // Totals box (use consistent width and right-aligned value area)
      const totalsBoxWidth = 220;
      const totalsX = right - totalsBoxWidth;
      const totalsY = commentsY;
      const totalsInnerPadding = 8;
      const totalsValueWidth = totalsBoxWidth - totalsInnerPadding * 2;

      // compute totals with discount and tax
      const computedSubtotal = items.reduce((s: number, it: any) => s + (Number(it.total) || 0), 0);
      const subtotal = inv.subtotal !== undefined && inv.subtotal !== null ? Number(inv.subtotal) : computedSubtotal;
      const discountType = (inv.discount_type || 'percent').toString();
      const discountValue = Number(inv.discount_value || 0);
      let discountAmount = 0;
      if (discountType === 'percent') {
        discountAmount = Number((subtotal * (discountValue / 100)).toFixed(2));
      } else {
        discountAmount = Number(discountValue.toFixed ? discountValue.toFixed(2) : discountValue) || discountValue;
      }

      const taxableBase = Math.max(0, subtotal - discountAmount);

      const taxPercent = Number(inv.tax_percent || 0);
      const taxAmount = Number(((taxableBase * taxPercent) / 100).toFixed(2));

      const other = inv.other !== undefined && inv.other !== null ? Number(inv.other) : 0;
      const total = inv.total !== undefined && inv.total !== null ? Number(inv.total) : Number((taxableBase + taxAmount + other).toFixed(2));

      const labelX = totalsX + totalsInnerPadding;
      const valueBoxX = labelX;

      const lineHeight = 16;
      let lineY = totalsY;

      // draw a subtle background/border for totals area (optional)
      doc.lineWidth(0.5).strokeColor('#e6e6e6').rect(totalsX, totalsY - 6, totalsBoxWidth, 120).stroke();

      // SUBTOTAL
      doc.fontSize(10).fillColor('#000').text('SUBTOTAL', labelX, lineY, { width: totalsValueWidth });
      doc.text(fmt(subtotal), valueBoxX, lineY, { width: totalsValueWidth, align: 'right' });
      lineY += lineHeight;

      // Discount line (show percent or fixed)
      if (discountAmount && discountAmount > 0) {
        const discLabel = discountType === 'percent' ? `DISCOUNT (${discountValue}%)` : 'DISCOUNT';
        doc.text(discLabel, labelX, lineY, { width: totalsValueWidth });
        doc.text(`-${fmt(discountAmount)}`, valueBoxX, lineY, { width: totalsValueWidth, align: 'right' });
        lineY += lineHeight;
      }

      // Tax line shows percent and computed amount
      const taxLabel = taxPercent ? `TAX (${taxPercent}%)` : 'TAX';
      doc.text(taxLabel, labelX, lineY, { width: totalsValueWidth });
      doc.text(taxAmount ? fmt(taxAmount) : '-', valueBoxX, lineY, { width: totalsValueWidth, align: 'right' });
      lineY += lineHeight;

      // Other
      doc.text('OTHER', labelX, lineY, { width: totalsValueWidth });
      doc.text(other ? fmt(other) : '-', valueBoxX, lineY, { width: totalsValueWidth, align: 'right' });
      lineY += lineHeight + 6;

      // Total highlighted area
      const totalBoxHeight = 36;
      doc.save();
      doc.rect(totalsX + totalsInnerPadding - 6, lineY - 2, totalsBoxWidth - (totalsInnerPadding - 6) - totalsInnerPadding, totalBoxHeight);  //.fill('#dcdcdc');
      doc.restore();
      doc.fontSize(12).fillColor('#000').text('TOTAL', labelX, lineY + 6, { width: totalsValueWidth });
      doc.text(fmt(total), valueBoxX, lineY + 6, { width: totalsValueWidth, align: 'right' });

      // Footer line
      doc.fontSize(8).fillColor('#444').text(
        'If you have any query about this invoice, contact Shah Md. Rashidul Islam, QKA®, +880 1954 996679, rashidul@speedway-solutions.com',
        left,
        pageHeight - 50,
        { width: pageWidth - left - doc.page.margins.right, align: 'center' },
      );

      // Finalize the PDF (this ends the stream)
      doc.end();

      // Note: we DO NOT call res.end() here — the piping of doc to res will end the response when PDF finishes.
    } catch (err) {
      // Ensure PDF stream is destroyed and respond with error
      try {
        doc.destroy();
      } catch (e) {
        // ignore
      }
      console.error('PDF generation error', err);
      if (!res.headersSent) {
        res.status(500).send('PDF generation failed');
      } else {
        // If headers already sent, just end connection
        try {
          res.end();
        } catch (e) { }
      }
    }
  }

}
