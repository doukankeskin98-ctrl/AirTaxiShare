import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum MatchStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('match_history')
export class MatchHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    matchSocketId: string; // The socket-level match ID for reference

    @Column()
    user1Id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user1Id' })
    user1: User;

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
