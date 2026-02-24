import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

export enum TripStatus {
    PENDING = 'PENDING',
    MATCHED = 'MATCHED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
}

@Entity('trip_requests')
@Index(['cluster', 'status']) // Composite index for matching engine queries
export class TripRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    cluster: string; // e.g., 'MASLAK'

    @Column()
    timeWindowStart: Date;

    @Column()
    timeWindowEnd: Date;

    @Column('int')
    luggageCount: number;

    @Column({ nullable: true })
    baggageSize: string; // e.g., 'small', 'medium', 'large'

    @Column('int')
    groupSize: number;

    @Column({
        type: 'enum',
        enum: TripStatus,
        default: TripStatus.PENDING,
    })
    status: TripStatus;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
