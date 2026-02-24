import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    BLOCKED = 'BLOCKED',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ nullable: true })
    phoneNumber: string;

    @Index()
    @Column({ unique: true, nullable: true })
    email: string;

    @Index()
    @Column({ unique: true, nullable: true })
    googleId: string;

    @Index()
    @Column({ unique: true, nullable: true })
    appleId: string;

    @Column({ nullable: true })
    passwordHash: string;

    @Column()
    fullName: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column({ nullable: true })
    pushToken: string;

    @Column('float', { default: 5.0 })
    rating: number;

    @Column('int', { default: 0 })
    tripsCompleted: number;

    @Column({ default: false })
    trustBadge: boolean;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ default: false })
    phoneVerified: boolean;

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
