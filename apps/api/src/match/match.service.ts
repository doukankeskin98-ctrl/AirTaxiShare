import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripRequest, TripStatus } from './trip-request.entity';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(TripRequest)
        private tripRepository: Repository<TripRequest>,
    ) { }

    async createRequest(userId: string, data: any): Promise<TripRequest> {
        // 1. Save to DB for persistence
        const request = this.tripRepository.create({
            userId,
            cluster: data.cluster,
            timeWindowStart: new Date(data.timeWindowStart),
            timeWindowEnd: new Date(data.timeWindowEnd),
            luggageCount: data.luggageCount,
            baggageSize: data.baggageSize || 'medium',
            groupSize: data.groupSize,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
            status: TripStatus.PENDING,
        });
        await this.tripRepository.save(request);

        // 2. Add to Redis Logic (Mocked)
        // await this.redisQueue.add(request);

        // 3. Trigger Matching Engine
        // this.findMatch(request);

        return request;
    }

    async findMatch(currentRequest: TripRequest) {
        // Logic: Look for other PENDING requests in the same Cluster and Time Window overlap
        // Simple implementation via SQL for MVP
        const potentialMatch = await this.tripRepository.findOne({
            where: {
                cluster: currentRequest.cluster,
                status: TripStatus.PENDING,
                // In real app, check time overlap & user != currentRequest.userId
                // and groupSize + currentRequest.groupSize <= MAX_CAPACITY (e.g. 3 or 4)
            },
        });

        if (potentialMatch && potentialMatch.id !== currentRequest.id) {
            // Create Match!
            console.log(`Match found between ${currentRequest.id} and ${potentialMatch.id}`);
            return potentialMatch;
        }
        return null;
    }
}
