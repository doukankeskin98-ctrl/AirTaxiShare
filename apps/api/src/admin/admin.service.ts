import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const recentMatchesForChart = await this.matchHistoryRepository.find({
            where: { matchedAt: MoreThan(sevenDaysAgo) }
        });

        const chartData: any[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('tr-TR', { weekday: 'short' });

            const matchesThatDay = recentMatchesForChart.filter(m =>
                new Date(m.matchedAt).getDate() === d.getDate()
            );

            const completedThatDay = matchesThatDay.filter((m: any) => m.status === 'COMPLETED').length;

            chartData.push({
                name: dateStr,
                matches: matchesThatDay.length,
                revenue: completedThatDay * 39.99
            });
        }

        const newestUsers = await this.userRepository.find({ order: { createdAt: 'DESC' }, take: 4, select: ['id', 'fullName', 'createdAt'] });
        const newestMatches = await this.matchHistoryRepository.find({
            order: { matchedAt: 'DESC' }, take: 4, relations: ['user1', 'user2'],
            select: { id: true, status: true, matchedAt: true, destination: true, user1: { fullName: true }, user2: { fullName: true } }
        });

        const activities: any[] = [];
        newestUsers.forEach(u => activities.push({ id: `u-${u.id}`, type: 'signup', text: `Yeni kayıt: ${u.fullName || 'İsimsiz Üye'}`, time: u.createdAt }));
        newestMatches.forEach(m => activities.push({
            id: `m-${m.id}`, type: (m.status as any) === 'COMPLETED' ? 'complete' : 'match',
            text: (m.status as any) === 'COMPLETED' ? `${m.destination || 'Belirsiz'} sürüşü tamamlandı` : `${m.user1?.fullName || 'Üye'} ve ${m.user2?.fullName || 'Üye'} eşleşti`,
            time: m.matchedAt
        }));

        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const recentActivity = activities.slice(0, 5);

        return {
            totalUsers,
            activeUsers,
            totalMatches,
            completedRides,
            revenue: completedRides * 39.99,
            chartData,
            recentActivity
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

    async updateUserStatus(userId: string, status: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        user.status = status as any;
        await this.userRepository.save(user);
        return { success: true, userId, status };
    }
}
