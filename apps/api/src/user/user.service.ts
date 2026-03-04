import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserStatus } from './user.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { phoneNumber } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    async findByAppleId(appleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { appleId } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByIds(ids: string[]): Promise<User[]> {
        if (!ids.length) return [];
        return this.userRepository.find({ where: { id: In(ids) } });
    }

    async createWithPhone(phoneNumber: string): Promise<User> {
        const user = this.userRepository.create({
            phoneNumber,
            fullName: 'New User',
            phoneVerified: true,
            status: UserStatus.ACTIVE,
        });
        return this.userRepository.save(user);
    }

    async createWithEmail(email: string, passwordHash: string, fullName: string): Promise<User> {
        const user = this.userRepository.create({
            email,
            passwordHash,
            fullName,
            emailVerified: false, // requires email verification flow
            status: UserStatus.ACTIVE,
        });
        return this.userRepository.save(user);
    }

    async createSocial(data: {
        googleId?: string;
        appleId?: string;
        email?: string;
        fullName: string;
    }): Promise<User> {
        const user = this.userRepository.create({
            googleId: data.googleId,
            appleId: data.appleId,
            email: data.email,
            fullName: data.fullName,
            emailVerified: !!data.email, // Social logins have verified emails
            status: UserStatus.ACTIVE,
        });
        return this.userRepository.save(user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.userRepository.update(id, updateData);
        return this.userRepository.findOne({ where: { id } }) as Promise<User>;
    }

    async updatePushToken(userId: string, pushToken: string): Promise<void> {
        await this.userRepository.update(userId, { pushToken });
        this.logger.log(`Push token updated for user ${userId}`);
    }

    async updateRating(userId: string, newRating: number): Promise<void> {
        const user = await this.findById(userId);
        if (!user) return;

        const totalTrips = user.tripsCompleted || 0;
        const currentRating = user.rating || 5.0;
        const updatedRating = totalTrips === 0
            ? newRating
            : (currentRating * totalTrips + newRating) / (totalTrips + 1);

        await this.userRepository.update(userId, {
            rating: Math.round(updatedRating * 10) / 10,
            tripsCompleted: totalTrips + 1,
        });
    }

    // App Store / Play Store compliance: Full account deletion
    async deleteUser(userId: string): Promise<void> {
        this.logger.log(`Deleting user account: ${userId}`);
        await this.userRepository.delete(userId);
    }

    async findAll(): Promise<Partial<User>[]> {
        const users = await this.userRepository.find({
            order: { createdAt: 'DESC' },
            take: 200,
        });
        // Strip sensitive fields
        return users.map(({ passwordHash, pushToken, ...safe }: any) => safe);
    }

    async getStats(): Promise<{ totalUsers: number; activeUsers: number }> {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { status: 'ACTIVE' as any } });
        return { totalUsers, activeUsers };
    }
}
