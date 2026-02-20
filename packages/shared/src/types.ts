import { Cluster, TripStatus } from './constants';

export interface User {
    id: string;
    phoneNumber: string;
    email?: string;
    fullName: string;
    photoUrl?: string;
    rating: number;
    tripsCompleted: number;
    trustBadge: boolean;
    status: 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
}

export interface TripRequest {
    id: string;
    userId: string;
    cluster: Cluster;
    timeWindowStart: string; // ISO Date
    timeWindowEnd: string; // ISO Date
    luggageCount: number;
    groupSize: number;
    status: TripStatus;
    expiresAt: string; // ISO Date
}

export interface MatchGroup {
    id: string;
    cluster: Cluster;
    timeWindow: string;
    members: User[];
    status: 'FORMING' | 'CONFIRMED' | 'COMPLETED';
}
