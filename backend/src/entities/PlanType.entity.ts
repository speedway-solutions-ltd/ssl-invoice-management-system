import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ResourcePrice } from './ResourcePrice.entity';

@Entity({ name: 'plan_type' })
export class PlanType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @OneToMany(() => ResourcePrice, (rp) => rp.planType)
    resourcePrices: ResourcePrice[];
}
