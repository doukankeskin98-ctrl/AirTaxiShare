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
    userId: string;
    destination: string;
    time: string;
    luggage: string;
    userData: UserCacheEntry;
}

const isProd = process.env.NODE_ENV === 'production';

let corsOrigin: boolean | string[] = true;
if (isProd) {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        corsOrigin = envOrigins.split(',');
    } else {
        // Dynamic fallback mirroring to satisfy credentials: true if missing in prod
        corsOrigin = true;
    }
}

@WebSocketGateway({
    cors: {
        origin: corsOrigin,
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

    // State mapped by userId prevents ghost sessions
    private activeQueues: Map<string, QueuedUser[]> = new Map();

    // matchId -> [userId1, userId2]
    private activeMatches: Map<string, string[]> = new Map();

    // userId -> matchId
    private userMatchMap: Map<string, string> = new Map();

    // userId -> Set<socketId>
    private userSockets: Map<string, Set<string>> = new Map();
    // socketId -> userId
    private socketUserMap: Map<string, string> = new Map();

    // Meetup confirmation tracking: matchId → Set of user IDs that confirmed
    private meetupConfirmations: Map<string, Set<string>> = new Map();

    // Short-lived user data cache (5 min TTL) — reduces DB calls per queue join
    private userCache: Map<string, UserCacheEntry> = new Map();
    private readonly CACHE_TTL_MS = 5 * 60 * 1000;

    /** Helper to emit to all sockets of a user */
    private emitToUser(userId: string, event: string, payload?: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach(socketId => this.server.to(socketId).emit(event, payload));
        }
    }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        const token = client.handshake?.auth?.token;
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload?.sub) {
                    const userId = payload.sub;
                    this.socketUserMap.set(client.id, userId);

                    if (!this.userSockets.has(userId)) {
                        this.userSockets.set(userId, new Set());
                    }
                    this.userSockets.get(userId)!.add(client.id);

                    this.logger.debug(`[Auth] Socket ${client.id} → bound to user ${userId}`);

                    // Restore match session if returning
                    const matchId = this.userMatchMap.get(userId);
                    if (matchId) {
                        const participants = this.activeMatches.get(matchId);
                        if (participants) {
                            const partnerId = participants.find(id => id !== userId);
                            if (partnerId) {
                                // Notify partner user
                                this.emitToUser(partnerId, 'partner_online');
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
        const userId = this.socketUserMap.get(client.id);

        if (userId) {
            const sockets = this.userSockets.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                // If user has no more active sockets, consider them offline
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                    this.handleUserOffline(userId);
                }
            }
        }
        this.socketUserMap.delete(client.id);
    }

    private async handleUserOffline(userId: string) {
        // If they were in a queue, remove them from all queues (Queue Consistency - Section 3)
        this.removeUserFromAllQueues(userId);

        const matchId = this.userMatchMap.get(userId);
        if (matchId) {
            const participants = this.activeMatches.get(matchId);
            if (participants) {
                const partnerId = participants.find(id => id !== userId);
                if (partnerId) {
                    this.logger.log(`[Disconnect] Notifying partner ${partnerId} that ${userId} is offline`);
                    this.emitToUser(partnerId, 'partner_offline');

                    // Push notification for when partner's app goes background
                    this.sendDisconnectWarning(userId, partnerId);
                }
            }
        }
    }

    private async sendDisconnectWarning(offlineUserId: string, onlineUserId: string) {
        try {
            const [offlineUser, onlineUser] = await Promise.all([
                this.getOrFetchUser(offlineUserId),
                this.getOrFetchUser(onlineUserId),
            ]);
            if (onlineUser.pushToken) {
                const name = offlineUser.name || 'Yolcu';
                await this.notificationsService.sendToToken(
                    onlineUser.pushToken,
                    'Partnerin Koptu',
                    `${name} geçici olarak bağlantısını kaybetti veya uygulamayı arka plana aldı.`,
                    { type: 'partner_offline' },
                ).catch(e => this.logger.error('[Push] Disconnect warning failed:', e.message));
            }
        } catch (e: any) {
            this.logger.error('[Disconnect] Failed to send push warning:', e.message);
        }
    }

    private broadcastActiveQueues() {
        const queuesList: Array<{
            destination: string; count: number;
            firstUserId?: string; firstUserName?: string; firstUserPhoto?: string;
            firstUserRating?: number; firstUserTrips?: number;
            firstUserTrustBadge?: boolean; firstUserPhoneVerified?: boolean; firstUserEmailVerified?: boolean;
            firstUserLuggage?: string; firstUserTime?: string;
        }> = [];
        this.activeQueues.forEach((queue, destination) => {
            if (queue.length > 0) {
                queuesList.push({
                    destination,
                    count: queue.length,
                    firstUserId: queue[0].userData.id,
                    firstUserName: queue[0].userData.name,
                    firstUserPhoto: queue[0].userData.photoUrl,
                    firstUserRating: queue[0].userData.rating,
                    firstUserTrips: queue[0].userData.trips,
                    firstUserTrustBadge: queue[0].userData.trustBadge,
                    firstUserPhoneVerified: queue[0].userData.phoneVerified,
                    firstUserEmailVerified: queue[0].userData.emailVerified,
                    firstUserLuggage: queue[0].luggage,
                    firstUserTime: queue[0].time,
                });
            }
        });
        this.server.emit('active_queues_list', { queues: queuesList });
    }

    private removeUserFromAllQueues(userId: string) {
        let changed = false;
        this.activeQueues.forEach((queue, destination) => {
            const index = queue.findIndex(u => u.userId === userId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.logger.debug(`[Queue] Removed user ${userId} from ${destination}`);
                this.broadcastQueueCount(destination, queue);
                changed = true;
            }
        });
        if (changed) {
            this.broadcastActiveQueues();
        }
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

    /**
     * Strict Authorization Wrapper (Section 2)
     */
    private validateMatchAccess(client: Socket, matchId: string): string | null {
        const userId = this.socketUserMap.get(client.id);
        if (!userId) {
            this.logger.warn(`[Auth] Unauthenticated socket ${client.id} trying to access match ${matchId}`);
            return null;
        }
        const userMatch = this.userMatchMap.get(userId);
        if (userMatch !== matchId) {
            this.logger.warn(`[Auth] User ${userId} unauthorized access to match ${matchId}`);
            return null;
        }
        return userId;
    }

    @SubscribeMessage('join_queue')
    async handleJoinQueue(client: Socket, payload: { destination: string; time: string; luggage: string }) {
        try {
            if (!payload?.destination) {
                client.emit('error', { message: 'Invalid payload: destination is required' });
                return;
            }
            const { destination, time, luggage } = payload;
            const userId = this.socketUserMap.get(client.id);
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            this.logger.log(`[Queue] user=${userId} joining for ${destination}`);

            // Ensure user is not already in a match
            if (this.userMatchMap.has(userId)) {
                this.logger.warn(`[Queue] User ${userId} already in active match. Ignoring join.`);
                return;
            }

            // Remove from any other queues (Section 3: Queue Consistency)
            this.removeUserFromAllQueues(userId);

            const userData = await this.getOrFetchUser(userId);

            if (!this.activeQueues.has(destination)) {
                this.activeQueues.set(destination, []);
            }

            const queue = this.activeQueues.get(destination)!;

            const newUser: QueuedUser = {
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
                if (p.userId === userId) continue; // safety check

                const totalLuggage = this.getLuggageScore(newUser.luggage) + this.getLuggageScore(p.luggage);
                const timeOk = !newUser.time || !p.time || newUser.time === p.time;
                if (totalLuggage <= 4 && timeOk) {
                    partnerFoundIndex = i;
                    break;
                }
            }

            if (partnerFoundIndex !== -1) {
                const partner = queue.splice(partnerFoundIndex, 1)[0];
                const matchId = `match-${userId.substring(0, 5)}-${partner.userId.substring(0, 5)}-${Date.now()}`;

                this.activeMatches.set(matchId, [userId, partner.userId]);
                this.userMatchMap.set(userId, matchId);
                this.userMatchMap.set(partner.userId, matchId);

                this.logger.log(`[Match] ${userId} + ${partner.userId} → ${matchId}`);

                // Save to DB
                try {
                    await this.matchService.saveMatchHistory({
                        matchSocketId: matchId,
                        user1Id: userId,
                        user2Id: partner.userId,
                        destination,
                    });
                } catch (e) {
                    this.logger.error('[Match] Failed to save history:', e.message);
                }

                // Emit match events with full user data
                const newUserPayload = { matchId, partnerId: partner.userId, userData: { ...partner.userData } };
                const partnerPayload = { matchId, partnerId: userId, userData: { ...newUser.userData } };

                this.emitToUser(userId, 'match_found', newUserPayload);
                this.emitToUser(partner.userId, 'match_found', partnerPayload);

                // Push notifications
                if (partner.userData.pushToken) {
                    this.notificationsService
                        .sendMatchFoundNotification(partner.userData.pushToken, newUser.userData.name)
                        .catch(e => this.logger.error('[Push] error:', e.message));
                }
                if (newUser.userData.pushToken) {
                    this.notificationsService
                        .sendMatchFoundNotification(newUser.userData.pushToken, partner.userData.name)
                        .catch(e => this.logger.error('[Push] error:', e.message));
                }
            } else {
                this.logger.log(`[Queue] No partner found yet for ${userId}, queuing...`);
                queue.push(newUser);
                this.broadcastQueueCount(destination, queue);
                this.broadcastActiveQueues();
            }
        } catch (err: any) {
            this.logger.error(`[Queue] Unhandled error for ${client.id}: ${err.message}`, err.stack);
            client.emit('error', { message: 'Server error in queue handler' });
        }
    }

    private broadcastQueueCount(destination: string, queue: QueuedUser[]) {
        queue.forEach(u => {
            this.emitToUser(u.userId, 'queue_count', { count: queue.length });
        });
    }

    @SubscribeMessage('leave_queue')
    handleLeaveQueue(client: Socket) {
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            this.logger.log(`[Queue] User ${userId} voluntarily left`);
            this.removeUserFromAllQueues(userId);
        }
    }

    @SubscribeMessage('get_active_queues')
    handleGetActiveQueues(client: Socket) {
        const userId = this.socketUserMap.get(client.id);
        if (!userId) return;

        const queuesList: Array<{
            destination: string; count: number;
            firstUserId?: string; firstUserName?: string; firstUserPhoto?: string;
            firstUserRating?: number; firstUserTrips?: number;
            firstUserTrustBadge?: boolean; firstUserPhoneVerified?: boolean; firstUserEmailVerified?: boolean;
            firstUserLuggage?: string; firstUserTime?: string;
        }> = [];
        this.activeQueues.forEach((queue, destination) => {
            if (queue.length > 0) {
                queuesList.push({
                    destination,
                    count: queue.length,
                    firstUserId: queue[0].userData.id,
                    firstUserName: queue[0].userData.name,
                    firstUserPhoto: queue[0].userData.photoUrl,
                    firstUserRating: queue[0].userData.rating,
                    firstUserTrips: queue[0].userData.trips,
                    firstUserTrustBadge: queue[0].userData.trustBadge,
                    firstUserPhoneVerified: queue[0].userData.phoneVerified,
                    firstUserEmailVerified: queue[0].userData.emailVerified,
                    firstUserLuggage: queue[0].luggage,
                    firstUserTime: queue[0].time,
                });
            }
        });

        this.emitToUser(userId, 'active_queues_list', { queues: queuesList });
    }

    @SubscribeMessage('send_message')
    async handleChatMessage(client: Socket, payload: { matchId: string; text: string; time: string }) {
        try {
            if (!payload?.matchId || !payload?.text) return;

            const userId = this.validateMatchAccess(client, payload.matchId);
            if (!userId) return;

            // Optional: limit text length (Section 9)
            if (payload.text.length > 500) return;

            const { matchId, text, time } = payload;
            const participants = this.activeMatches.get(matchId);
            if (!participants) return;

            const partnerId = participants.find(id => id !== userId);
            if (!partnerId) return;

            this.emitToUser(partnerId, 'receive_message', {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                text,
                senderId: userId, // client sends their user ID instead of socketId
                time,
                matchId,
            });

            const partnerData = await this.getOrFetchUser(partnerId);
            const senderData = await this.getOrFetchUser(userId);

            if (partnerData.pushToken) {
                // If partner has no active sockets, send push notification immediately
                const partnerSockets = this.userSockets.get(partnerId);
                if (!partnerSockets || partnerSockets.size === 0) {
                    this.notificationsService
                        .sendMessageNotification(partnerData.pushToken, senderData.name, text, matchId)
                        .catch(e => this.logger.error('[Push] message notification error:', e.message));
                }
            }
        } catch (err: any) {
            this.logger.error(`[Chat] Error: ${err.message}`);
        }
    }

    @SubscribeMessage('end_match')
    async handleEndMatch(client: Socket, payload: { matchId: string }) {
        const userId = this.validateMatchAccess(client, payload.matchId);
        if (!userId) return;

        this.logger.log(`[Match] Ended by ${userId}: ${payload.matchId}`);
        const participants = this.activeMatches.get(payload.matchId);
        if (participants) {
            participants.forEach(pId => this.userMatchMap.delete(pId));
            this.activeMatches.delete(payload.matchId);
            this.meetupConfirmations.delete(payload.matchId);

            const partnerId = participants.find(id => id !== userId);
            if (partnerId) {
                this.emitToUser(partnerId, 'match_ended', { reason: 'partner_left' });
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
        const userId = this.validateMatchAccess(client, payload.matchId);
        if (!userId || !payload.point) return;

        const participants = this.activeMatches.get(payload.matchId);
        if (participants) {
            const partnerId = participants.find(id => id !== userId);
            if (partnerId) {
                this.emitToUser(partnerId, 'partner_meeting_point', { point: payload.point });
            }
        }
    }

    @SubscribeMessage('confirm_meetup')
    async handleConfirmMeetup(client: Socket, payload: { matchId: string }) {
        const userId = this.validateMatchAccess(client, payload.matchId);
        if (!userId) return;

        const matchId = payload.matchId;
        const participants = this.activeMatches.get(matchId);
        if (!participants) return;

        if (!this.meetupConfirmations.has(matchId)) {
            this.meetupConfirmations.set(matchId, new Set());
        }
        const confirmSet = this.meetupConfirmations.get(matchId)!;
        confirmSet.add(userId); // Confirm using userId now!

        this.logger.log(`[Meetup] user=${userId} confirmed meetup (${confirmSet.size}/2)`);

        if (confirmSet.size >= 2) {
            participants.forEach(pId => {
                this.emitToUser(pId, 'meetup_confirmed');
                this.userMatchMap.delete(pId);
            });
            this.activeMatches.delete(matchId);
            this.meetupConfirmations.delete(matchId);
            this.logger.log(`[Meetup] Both confirmed for match=${matchId} ✓`);

            try {
                await this.matchService.completeMatch(matchId);
                // Matched users are now cleared from active maps, allowing them to queue again.
            } catch (e) {
                this.logger.error('[Meetup] Failed to complete in DB:', e.message);
            }
        }
    }
}
