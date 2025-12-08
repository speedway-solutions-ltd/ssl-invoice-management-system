import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Invoice } from './invoice.entity';
@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Invoice, (inv) => inv.items, { onDelete: 'CASCADE' })
  invoice: Invoice;
  @Column({ nullable: true })
  item_code: string;
  @Column({ type: 'text', nullable: true })
  description: string;
  @Column({ type: 'int', nullable: true })
  qty: number;
  @Column({ type: 'numeric', nullable: true })
  unit_price: number;
  @Column({ type: 'numeric', nullable: true })
  total: number;
}
