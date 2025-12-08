import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'project_service' })
export class ProjectService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    code?: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'int', nullable: true })
    turnaround_min_days?: number;

    @Column({ type: 'int', nullable: true })
    turnaround_max_days?: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    speedway_billing_min?: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    speedway_billing_max?: number;

    @Column({ type: 'text', nullable: true })
    industry_average?: string;
}
