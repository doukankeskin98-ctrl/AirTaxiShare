import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum ReportReason {
    INAPPROPRIATE_BEHAVIOR = 'INAPPROPRIATE_BEHAVIOR',
    NO_SHOW = 'NO_SHOW',
    HARASSMENT = 'HARASSMENT',
    FAKE_PROFILE = 'FAKE_PROFILE',
    OTHER = 'OTHER',
}

@Entity('reports')
@Index(['reportedUserId'])
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    reporterId: string;

    @Column()
    reportedUserId: string;

    @Column({ nullable: true })
    matchId: string;

    @Column({
        type: 'varchar',
        default: ReportReason.OTHER,
    })
    reason: ReportReason;

    @Column({ nullable: true, length: 500 })
    details: string;

    @CreateDateColumn()
    createdAt: Date;
}
