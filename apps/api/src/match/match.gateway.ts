import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MatchService } from './match.service';
import { NotificationsService } from '../notifications/notifications.service';

interface UserCacheEntry {
    id: string;
    name: string;
    rating: number;
    trips: number;
    photoUrl?: string;
    pushToken?: string;
    trustBadge?: boolean;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    fetchedAt: number; // timestamp for cache expiry
}

interface QueuedUser {
    socketId: string;
    userId: string;
    destination: string;
    time: string;
    luggage: string;
    userData: UserCacheEntry;
}

@WebSocketGateway({
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
        credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(MatchGateway.name);

    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private matchService: MatchService,
        private notificationsService: NotificationsService,
    ) { }

    // In-memory state (for production scale, move to Redis pub/sub)
    private activeQueues: Map<string, QueuedUser[]> = new Map();
    private activeMatches: Map<string, string[]> = new Map();
    private userMatchMap: Map<string, string> = new Map();
    private socketUserMap: Map<string, string> = new Map();

    // Meetup confirmation tracking: matchId → Set of socket IDs that confirmed
    private meetupConfirmations: Map<string, Set<string>> = new Map();

    // Short-lived user data cache (5 min TTL) — reduces DB calls per queue join
    private userCache: Map<string, UserCacheEntry> = new Map();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        const token = client.handshake?.auth?.token;
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload?.sub) {
                    this.socketUserMap.set(client.id, payload.sub);
                    this.logger.debug(`[Auth] Socket ${client.id} → user ${payload.sub}`);

                    // Notify partner (if in active match) that this user is online
                    const matchId = this.userMatchMap.get(client.id);
                    if (matchId) {
                        const participants = this.activeMatches.get(matchId);
                        if (participants) {
                            const partnerId = participants.find(id => id !== client.id);
                            if (partnerId) {
                                this.server.to(partnerId).emit('partner_online');
                            }
                        }
                    }
                }
            } catch (err) {
                this.logger.warn(`[Auth] Socket ${client.id} has invalid token`);
            }
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.removeFromQueues(client.id);
        this.notifyPartnerOnDisconnect(client.id);
        this.socketUserMap.delete(client.id);
    }

    private async getOrFetchUser(userId: string): Promise<UserCacheEntry> {
        const cached = this.userCache.get(userId);
        if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL_MS) {
            return cached;
        }

        const user = userId ? await this.userService.findById(userId) : null;
        const entry: UserCacheEntry = {
            id: userId,
            name: user?.fullName || 'Yolcu',
            rating: user?.rating || 4.5,
            trips: user?.tripsCompleted || 0,
            photoUrl: user?.photoUrl || '',
            pushToken: user?.pushToken || '',
            trustBadge: user?.trustBadge || false,
            phoneVerified: user?.phoneVerified || false,
            emailVerified: user?.emailVerified || false,
            fetchedAt: Date.now(),
        };
        if (userId) this.userCache.set(userId, entry);
        return entry;
    }

    private getLuggageScore(size: string): number {
        switch (size) {
            case 'small': return 1;
            case 'medium': return 2;
            case 'large': return 3;
            default: return 1;
        }
    }

    @SubscribeMessage('join_queue')
    async handleJoinQueue(client: Socket, payload: { destination: string; time: string; luggage: string }) {
        try {
            if (!payload?.destination) {
                this.logger.warn(`[Queue] ${client.id} sent invalid payload`);
                client.emit('error', { message: 'Invalid payload: destination is required' });
                return;
            }
            const { destination, time, luggage } = payload;
            const userId = this.socketUserMap.get(client.id) || '';
            this.logger.log(`[Queue] user=${userId || 'anon'} socket=${client.id} joining for ${destination}`);

            const userData = await this.getOrFetchUser(userId);

            if (!this.activeQueues.has(destination)) {
                this.activeQueues.set(destination, []);
            }

            const queue = this.activeQueues.get(destination)!;

            if (queue.some(u => u.socketId === client.id)) return;
            if (this.userMatchMap.has(client.id)) {
                this.logger.warn(`[Queue] ${client.id} already in active match`);
                return;
            }

            const newUser: QueuedUser = {
                socketId: client.id,
                userId,
                destination,
                time,
                luggage: luggage || 'medium',
                userData,
            };

            // --- MATCHING ENGINE ---
            let partnerFoundIndex = -1;
            for (let i = 0; i < queue.length; i++) {
                const p = queue[i];
                const totalLuggage = this.getLuggageScore(newUser.luggage) + this.getLuggageScore(p.luggage);
                const timeOk = !newUser.time || !p.time || newUser.time === p.time;
                if (totalLuggage <= 4 && timeOk) {
                    partnerFoundIndex = i;
                    break;
                }
            }

            if (partnerFoundIndex !== -1) {
                const partner = queue.splice(partnerFoundIndex, 1)[0];
                const matchId = `match-${client.id.substring(0, 5)}-${partner.socketId.substring(0, 5)}-${Date.now()}`;

                this.activeMatches.set(matchId, [client.id, partner.socketId]);
                this.userMatchMap.set(client.id, matchId);
                this.userMatchMap.set(partner.socketId, matchId);

                this.logger.log(`[Match] ${client.id} + ${partner.socketId} → ${matchId}`);

                // Save to DB
                if (newUser.userId && partner.userId) {
                    try {
                        await this.matchService.saveMatchHistory({
                            matchSocketId: matchId,
                            user1Id: newUser.userId,
                            user2Id: partner.userId,
                            destination,
                        });
                    } catch (e) {
                        this.logger.error('[Match] Failed to save history:', e.message);
                    }
                }

                // Emit match events with full user data (including trust fields)
                const newUserPayload = { matchId, partnerId: partner.socketId, userData: { ...partner.userData } };
                const partnerPayload = { matchId, partnerId: client.id, userData: { ...newUser.userData } };

                this.server.to(client.id).emit('match_found', newUserPayload);
                this.server.to(partner.socketId).emit('match_found', partnerPayload);

                // Push notifications (non-blocking)
                if (partner.userData.pushToken) {
                    this.notificationsService
                        .sendMatchFoundNotification(partner.userData.pushToken, newUser.userData.name)
                        .catch(e => this.logger.error('[Push] match notification error:', e.message));
                }
                if (newUser.userData.pushToken) {
                    this.notificationsService
                        .sendMatchFoundNotification(newUser.userData.pushToken, partner.userData.name)
                        .catch(e => this.logger.error('[Push] match notification error:', e.message));
                }
            } else {
                this.logger.log(`[Queue] No partner found yet for ${client.id}, queuing...`);
                queue.push(newUser);
            }
        } catch (err: any) {
            this.logger.error(`[Queue] Unhandled error for ${client.id}: ${err.message}`, err.stack);
            client.emit('error', { message: 'Server error in queue handler' });
        }
    }

    @SubscribeMessage('leave_queue')
    handleLeaveQueue(client: Socket) {
        this.logger.log(`[Queue] ${client.id} voluntarily left`);
        this.removeFromQueues(client.id);
    }

    @SubscribeMessage('send_message')
    async handleChatMessage(client: Socket, payload: { matchId: string; text: string; time: string }) {
        try {
            if (!payload?.matchId || !payload?.text) {
                client.emit('error', { message: 'Invalid payload' });
                return;
            }
            const { matchId, text, time } = payload;

            const participants = this.activeMatches.get(matchId);
            if (!participants) return;

            const partnerId = participants.find(id => id !== client.id);
            if (!partnerId) return;

            const userId = this.socketUserMap.get(client.id) || 'anon';
            this.logger.debug(`[Chat] user=${userId} → matchId=${matchId}`);

            this.server.to(partnerId).emit('receive_message', {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                text,
                senderId: client.id,
                time,
            });

            const partnerUserId = this.socketUserMap.get(partnerId);
            if (partnerUserId) {
                const partnerData = await this.getOrFetchUser(partnerUserId);
                const senderData = await this.getOrFetchUser(this.socketUserMap.get(client.id) || '');
                if (partnerData.pushToken) {
                    this.notificationsService
                        .sendMessageNotification(partnerData.pushToken, senderData.name, text, matchId)
                        .catch(e => this.logger.error('[Push] message notification error:', e.message));
                }
            }
        } catch (err: any) {
            this.logger.error(`[Chat] Unhandled error for ${client.id}: ${err.message}`, err.stack);
        }
    }

    @SubscribeMessage('end_match')
    async handleEndMatch(client: Socket, payload: { matchId: string }) {
        this.logger.log(`[Match] Ended by ${client.id}: ${payload.matchId}`);
        const participants = this.activeMatches.get(payload.matchId);
        if (participants) {
            participants.forEach(p => this.userMatchMap.delete(p));
            this.activeMatches.delete(payload.matchId);
            this.meetupConfirmations.delete(payload.matchId);
            const partnerId = participants.find(id => id !== client.id);
            if (partnerId) {
                this.server.to(partnerId).emit('match_ended', { reason: 'partner_left' });
            }
            try {
                await this.matchService.completeMatch(payload.matchId);
            } catch (e) {
                this.logger.error('[Match] Failed to complete in DB:', e.message);
            }
        }
    }

    @SubscribeMessage('select_meeting_point')
    handleSelectMeetingPoint(client: Socket, payload: { matchId: string; point: string }) {
        try {
            const { matchId, point } = payload;
            if (!matchId || !point) return;

            const participants = this.activeMatches.get(matchId);
            if (!participants) return;

            const partnerId = participants.find(id => id !== client.id);
            if (partnerId) {
                this.server.to(partnerId).emit('partner_meeting_point', { point });
                this.logger.debug(`[Meetup] Meeting point "${point}" forwarded to partner ${partnerId}`);
            }
        } catch (err: any) {
            this.logger.error(`[MeetingPoint] Error: ${err.message}`);
        }
    }

    @SubscribeMessage('confirm_meetup')
    async handleConfirmMeetup(client: Socket, payload: { matchId: string }) {
        try {
            const { matchId } = payload;
            if (!matchId) return;

            const participants = this.activeMatches.get(matchId);
            if (!participants) {
                this.logger.warn(`[Meetup] confirm_meetup for unknown matchId=${matchId}`);
                return;
            }

            if (!this.meetupConfirmations.has(matchId)) {
                this.meetupConfirmations.set(matchId, new Set());
            }
            const confirmSet = this.meetupConfirmations.get(matchId)!;
            confirmSet.add(client.id);

            const userId = this.socketUserMap.get(client.id) || 'anon';
            this.logger.log(`[Meetup] user=${userId} confirmed meetup for match=${matchId} (${confirmSet.size}/2)`);

            if (confirmSet.size >= 2) {
                // Both confirmed — notify both sides
                participants.forEach(socketId => {
                    this.server.to(socketId).emit('meetup_confirmed');
                });
                this.meetupConfirmations.delete(matchId);
                this.logger.log(`[Meetup] Both confirmed for match=${matchId} ✓`);

                // Complete match in DB
                try {
                    await this.matchService.completeMatch(matchId);
                } catch (e) {
                    this.logger.error('[Meetup] Failed to complete match in DB:', e.message);
                }
            }
        } catch (err: any) {
            this.logger.error(`[Meetup] Error: ${err.message}`, err.stack);
        }
    }

    private removeFromQueues(socketId: string) {
        this.activeQueues.forEach((queue, destination) => {
            const index = queue.findIndex(u => u.socketId === socketId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.logger.debug(`[Queue] Removed ${socketId} from ${destination}`);
            }
        });
    }

    private notifyPartnerOnDisconnect(socketId: string) {
        const matchId = this.userMatchMap.get(socketId);
        if (matchId) {
            const participants = this.activeMatches.get(matchId);
            if (participants) {
                const partnerId = participants.find(id => id !== socketId);
                if (partnerId) {
                    this.logger.log(`[Disconnect] Notifying partner ${partnerId} of offline status`);
                    this.server.to(partnerId).emit('partner_disconnected');
                    this.server.to(partnerId).emit('partner_offline');
                }
            }
            this.userMatchMap.delete(socketId);
            this.activeMatches.delete(matchId);
        }
    }
}
