import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('chat_messages')
@Index(['matchId', 'createdAt'])
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    matchId: string;

    @Column()
    senderId: string;

    @Column({ length: 500 })
    text: string;

    @CreateDateColumn()
    createdAt: Date;
}
