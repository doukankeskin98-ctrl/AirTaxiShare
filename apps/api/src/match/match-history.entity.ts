import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';

export enum MatchStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('match_history')
@Index(['user1Id', 'matchedAt'])
@Index(['user2Id', 'matchedAt'])
export class MatchHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    matchSocketId: string;

    @Index()
    @Column()
    user1Id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user1Id' })
    user1: User;

    @Index()
    @Column()
    user2Id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user2Id' })
    user2: User;

    @Column()
    destination: string;

    @Column({
        type: 'varchar',
        default: MatchStatus.ACTIVE,
    })
    status: MatchStatus;

    @CreateDateColumn()
    matchedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;
}
