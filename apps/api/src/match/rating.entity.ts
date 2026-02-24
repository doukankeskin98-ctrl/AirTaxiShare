import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('ratings')
export class Rating {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fromUserId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'fromUserId' })
    fromUser: User;

    @Column()
    toUserId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'toUserId' })
    toUser: User;

    @Column({ nullable: true })
    matchId: string;

    @Column('float')
    score: number;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @Column({ nullable: true })
    note: string;

    @CreateDateColumn()
    createdAt: Date;
}
