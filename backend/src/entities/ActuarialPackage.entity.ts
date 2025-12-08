import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'actuarial_package' })
export class ActuarialPackage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int', nullable: true })
    turnaround_min_days?: number;

    @Column({ type: 'int', nullable: true })
    turnaround_max_days?: number;

    @Column({ type: 'numeric', precision: 12, scale: 2 })
    speedway_fee: number;
}
