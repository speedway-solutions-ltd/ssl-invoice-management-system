import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { Company } from '../../company/company.entity';
@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  invoice_number: string;
  @Column({ type: 'date', nullable: true })
  date: string;
  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'billing_to_id' })
  billing_to?: Company;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'billing_from_id' })
  billing_from?: Company;

  @Column({ type: 'varchar', length: 32, nullable: true, default: 'draft' })
  status: string;
  @Column({ type: 'numeric', nullable: true })
  subtotal: number;
  @Column({ type: 'numeric', nullable: true })
  tax_percent: number;
  @Column({ type: 'numeric', nullable: true })
  tax: number;
  @Column({ type: 'varchar', length: 20, nullable: true })
  discount_type: string;
  @Column({ type: 'numeric', nullable: true })
  discount_value: number;
  @Column({ type: 'numeric', nullable: true })
  other: number;
  @Column({ type: 'numeric', nullable: true })
  total: number;
  @Column({ type: 'text', nullable: true })
  notes: string;
  @OneToMany(() => InvoiceItem, (it) => it.invoice, { cascade: true })
  items: InvoiceItem[];
}
