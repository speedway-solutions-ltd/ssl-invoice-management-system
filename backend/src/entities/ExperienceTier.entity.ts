import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ResourcePrice } from './ResourcePrice.entity';

@Entity({ name: 'experience_tier' })
export class ExperienceTier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    label: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @OneToMany(() => ResourcePrice, (rp) => rp.experienceTier)
    resourcePrices: ResourcePrice[];
}
