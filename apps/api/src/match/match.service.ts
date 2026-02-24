import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripRequest, TripStatus } from './trip-request.entity';
import { Rating } from './rating.entity';
import { MatchHistory, MatchStatus } from './match-history.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(TripRequest)
        private tripRepository: Repository<TripRequest>,
        @InjectRepository(Rating)
        private ratingRepository: Repository<Rating>,
        @InjectRepository(MatchHistory)
        private matchHistoryRepository: Repository<MatchHistory>,
        private userService: UserService,
    ) { }

    async createRequest(userId: string, data: any): Promise<TripRequest> {
        const request = this.tripRepository.create({
            userId,
            cluster: data.cluster,
            timeWindowStart: new Date(data.timeWindowStart),
            timeWindowEnd: new Date(data.timeWindowEnd),
            luggageCount: data.luggageCount,
            baggageSize: data.baggageSize || 'medium',
            groupSize: data.groupSize,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            status: TripStatus.PENDING,
        });
        await this.tripRepository.save(request);
        return request;
    }

    async findMatch(currentRequest: TripRequest) {
        const potentialMatch = await this.tripRepository.findOne({
            where: {
                cluster: currentRequest.cluster,
                status: TripStatus.PENDING,
            },
        });

        if (potentialMatch && potentialMatch.id !== currentRequest.id) {
            console.log(`Match found between ${currentRequest.id} and ${potentialMatch.id}`);
            return potentialMatch;
        }
        return null;
    }

    // --- RATING ---
    async saveRating(fromUserId: string, data: { toUserId: string; matchId: string; score: number; tags?: string[]; note?: string }): Promise<Rating> {
        const rating = this.ratingRepository.create({
            fromUserId,
            toUserId: data.toUserId,
            matchId: data.matchId,
            score: data.score,
            tags: data.tags || [],
            note: data.note,
        });
        const saved = await this.ratingRepository.save(rating);

        // Update the target user's average rating
        await this.userService.updateRating(data.toUserId, data.score);

        return saved;
    }

    // --- MATCH HISTORY ---
    async saveMatchHistory(data: {
        matchSocketId: string;
        user1Id: string;
        user2Id: string;
        destination: string;
    }): Promise<MatchHistory> {
        const history = this.matchHistoryRepository.create({
            matchSocketId: data.matchSocketId,
            user1Id: data.user1Id,
            user2Id: data.user2Id,
            destination: data.destination,
            status: MatchStatus.ACTIVE,
        });
        return this.matchHistoryRepository.save(history);
    }

    async completeMatch(matchSocketId: string): Promise<void> {
        await this.matchHistoryRepository.update(
            { matchSocketId },
            { status: MatchStatus.COMPLETED, completedAt: new Date() },
        );
    }

    async getHistory(userId: string): Promise<any[]> {
        const matches = await this.matchHistoryRepository.find({
            where: [
                { user1Id: userId },
                { user2Id: userId },
            ],
            order: { matchedAt: 'DESC' },
            take: 20,
        });

        // Enrich with user info
        const enriched = await Promise.all(matches.map(async (match) => {
            const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
            const otherUser = await this.userService.findById(otherUserId);
            return {
                id: match.id,
                matchSocketId: match.matchSocketId,
                destination: match.destination,
                status: match.status,
                matchedAt: match.matchedAt,
                completedAt: match.completedAt,
                otherUser: otherUser ? {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    photoUrl: otherUser.photoUrl,
                    rating: otherUser.rating,
                } : null,
            };
        }));

        return enriched;
    }
}
