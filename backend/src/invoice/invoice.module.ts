import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entity/invoice.entity';
import { InvoiceItem } from './entity/invoice-item.entity';
import { Company } from '../company/company.entity';
import { CompanyModule } from '../company/company.module';
@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Company]), CompanyModule],
  providers: [InvoiceService],
  controllers: [InvoiceController]
})
export class InvoiceModule { }
