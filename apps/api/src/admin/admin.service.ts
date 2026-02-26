import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { MatchHistory } from '../match/match-history.entity';
import { TripRequest } from '../match/trip-request.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(MatchHistory) private matchHistoryRepository: Repository<MatchHistory>,
        @InjectRepository(TripRequest) private tripRequestRepository: Repository<TripRequest>,
    ) { }

    async getDashboardStats() {
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({ where: { status: 'ACTIVE' as any } });
        const totalMatches = await this.matchHistoryRepository.count();
        const completedRides = await this.matchHistoryRepository.count({ where: { status: 'COMPLETED' as any } });

        return {
            totalUsers,
            activeUsers,
            totalMatches,
            completedRides,
            revenue: completedRides * 39.99 // mock revenue base calculation (39.99 TL per ride)
        };
    }

    async getAllUsers() {
        return this.userRepository.find({
            select: ['id', 'fullName', 'email', 'role', 'status', 'createdAt', 'rating', 'emailVerified', 'phoneVerified'],
            order: { createdAt: 'DESC' }
        });
    }

    async getRideLogs() {
        return this.matchHistoryRepository.find({
            relations: ['user1', 'user2'],
            select: {
                id: true,
                destination: true,
                status: true,
                matchedAt: true,
                completedAt: true,
                user1: { id: true, fullName: true, email: true },
                user2: { id: true, fullName: true, email: true }
            },
            order: { completedAt: 'DESC', matchedAt: 'DESC' },
            take: 100 // Limit for MVP dashboard
        });
    }
}
