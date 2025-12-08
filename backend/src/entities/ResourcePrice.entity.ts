import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { PlanType } from './PlanType.entity';
import { ExperienceTier } from './ExperienceTier.entity';

@Entity({ name: 'resource_price' })
@Unique(['planType', 'experienceTier'])
export class ResourcePrice {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PlanType, (p) => p.resourcePrices, { eager: true, onDelete: 'CASCADE' })
    planType: PlanType;

    @ManyToOne(() => ExperienceTier, (t) => t.resourcePrices, { eager: true, onDelete: 'CASCADE' })
    experienceTier: ExperienceTier;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 2000.0 })
    one_time_setup: number;

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    speedway_annual_fee: number;

    @Column({ type: 'text', nullable: true })
    industry_average?: string;
}
