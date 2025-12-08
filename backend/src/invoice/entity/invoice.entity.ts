import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  invoice_number: string;
  @Column({ type: 'date', nullable: true })
  date: string;
  @Column({ type: 'text', nullable: true })
  bill_to: string;
  @Column({ type: 'numeric', nullable: true })
  subtotal: number;
  @Column({ type: 'numeric', nullable: true })
  tax: number;
  @Column({ type: 'numeric', nullable: true })
  other: number;
  @Column({ type: 'numeric', nullable: true })
  total: number;
  @Column({ type: 'text', nullable: true })
  notes: string;
  @OneToMany(() => InvoiceItem, (it) => it.invoice, { cascade: true })
  items: InvoiceItem[];
}
