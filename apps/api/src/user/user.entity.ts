import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BLOCKED = 'BLOCKED',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    phoneNumber: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ unique: true, nullable: true })
    googleId: string;

    @Column({ unique: true, nullable: true })
    appleId: string;

    @Column({ nullable: true })
    passwordHash: string;

    @Column()
    fullName: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column('float', { default: 5.0 })
    rating: number;

    @Column('int', { default: 0 })
    tripsCompleted: number;

    @Column({ default: false })
    trustBadge: boolean;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
