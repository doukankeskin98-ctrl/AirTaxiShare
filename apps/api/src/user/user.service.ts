import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';

@Injectable()
export class UserService {
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

    async create(
        phoneNumber?: string,
        fullName: string = 'New User',
        email?: string,
        googleId?: string,
        appleId?: string,
    ): Promise<User> {
        // Generate a random temporary phone number if none provided (for initial social login)
        const tempPhone = phoneNumber || `temp_${Math.random().toString(36).substring(7)}`;

        const user = this.userRepository.create({
            phoneNumber: tempPhone,
            fullName,
            email,
            googleId,
            appleId,
            status: UserStatus.ACTIVE,
        });
        return this.userRepository.save(user);
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.userRepository.update(id, updateData);
        return this.userRepository.findOne({ where: { id } }) as Promise<User>;
    }
}
