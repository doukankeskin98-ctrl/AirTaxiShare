import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MatchService } from './match.service';

interface QueuedUser {
    socketId: string;
    userId: string; // Real user ID from JWT
    destination: string;
    time: string;
    luggage: string;
    userData: {
        id: string;
        name: string;
        rating: number;
        trips: number;
        photoUrl?: string;
    };
}

@WebSocketGateway({ cors: true })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private matchService: MatchService,
    ) { }

    // destination -> array of users
    private activeQueues: Map<string, QueuedUser[]> = new Map();
    // matchId -> [socketId1, socketId2]
    private activeMatches: Map<string, string[]> = new Map();
    // socketId -> matchId
    private userMatchMap: Map<string, string> = new Map();
    // socketId -> userId (for resolving real user IDs)
    private socketUserMap: Map<string, string> = new Map();

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Try to authenticate via token
        const token = client.handshake?.auth?.token;
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload?.sub) {
                    this.socketUserMap.set(client.id, payload.sub);
                    console.log(`[Auth] Socket ${client.id} authenticated as user ${payload.sub}`);
                }
            } catch (err) {
                console.log(`[Auth] Socket ${client.id} has invalid token, continuing without auth`);
            }
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.removeFromQueues(client.id);
        this.notifyPartnerOnDisconnect(client.id);
        this.socketUserMap.delete(client.id);
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
        const { destination, time, luggage } = payload;
        console.log(`[Queue] ${client.id} joining for ${destination} with ${luggage} luggage.`);

        // Get real user data from JWT auth
        const userId = this.socketUserMap.get(client.id);
        let userData = { id: '', name: 'Anonim', rating: 4.5, trips: 0, photoUrl: '' };

        if (userId) {
            const user = await this.userService.findById(userId);
            if (user) {
                userData = {
                    id: user.id,
                    name: user.fullName,
                    rating: user.rating,
                    trips: user.tripsCompleted,
                    photoUrl: user.photoUrl || '',
                };
            }
        }

        if (!this.activeQueues.has(destination)) {
            this.activeQueues.set(destination, []);
        }

        const queue = this.activeQueues.get(destination);
        if (!queue) return;

        if (queue.some(u => u.socketId === client.id)) return;

        if (this.userMatchMap.has(client.id)) {
            console.log(`[Queue] ${client.id} is already in an active match! Ignoring.`);
            return;
        }

        const newUser: QueuedUser = {
            socketId: client.id,
            userId: userId || '',
            destination,
            time,
            luggage: luggage || 'medium',
            userData,
        };

        // --- MATCHING ENGINE ---
        let partnerFoundIndex = -1;

        for (let i = 0; i < queue.length; i++) {
            const potentialPartner = queue[i];
            const totalLuggageScore = this.getLuggageScore(newUser.luggage) + this.getLuggageScore(potentialPartner.luggage);
            const isTimeCompatible = !newUser.time || !potentialPartner.time || newUser.time === potentialPartner.time;

            if (totalLuggageScore <= 4 && isTimeCompatible) {
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

            console.log(`[Match] SUCCESS: ${client.id} (${newUser.luggage}) + ${partner.socketId} (${partner.luggage}) = ${matchId}`);

            // Save match history to DB
            if (newUser.userId && partner.userId) {
                try {
                    await this.matchService.saveMatchHistory({
                        matchSocketId: matchId,
                        user1Id: newUser.userId,
                        user2Id: partner.userId,
                        destination,
                    });
                } catch (e) {
                    console.error('[Match] Failed to save match history:', e);
                }
            }

            // Notify both clients with real user data
            this.server.to(client.id).emit('match_found', { matchId, partnerId: partner.socketId, userData: partner.userData });
            this.server.to(partner.socketId).emit('match_found', { matchId, partnerId: client.id, userData: newUser.userData });
        } else {
            console.log(`[Queue] Added ${client.id}, no valid partner found yet.`);
            queue.push(newUser);
        }
    }

    @SubscribeMessage('leave_queue')
    handleLeaveQueue(client: Socket) {
        console.log(`[Queue] ${client.id} voluntarily left the queue.`);
        this.removeFromQueues(client.id);
    }

    // --- REAL-TIME CHAT ---
    @SubscribeMessage('send_message')
    handleChatMessage(client: Socket, payload: { matchId: string; text: string; time: string }) {
        const { matchId, text, time } = payload;

        const participants = this.activeMatches.get(matchId);
        if (participants) {
            const partnerId = participants.find(id => id !== client.id);
            if (partnerId) {
                console.log(`[Chat] ${client.id} -> ${partnerId}: ${text.substring(0, 10)}...`);
                this.server.to(partnerId).emit('receive_message', {
                    id: Date.now().toString(),
                    text: text,
                    senderId: client.id,
                    time: time
                });
            }
        }
    }

    @SubscribeMessage('end_match')
    async handleEndMatch(client: Socket, payload: { matchId: string }) {
        console.log(`[Match] Ended by ${client.id}: ${payload.matchId}`);
        const participants = this.activeMatches.get(payload.matchId);
        if (participants) {
            participants.forEach(p => this.userMatchMap.delete(p));
            this.activeMatches.delete(payload.matchId);
            const partnerId = participants.find(id => id !== client.id);
            if (partnerId) {
                this.server.to(partnerId).emit('match_ended', { reason: 'partner_left' });
            }

            // Mark match as completed in DB
            try {
                await this.matchService.completeMatch(payload.matchId);
            } catch (e) {
                console.error('[Match] Failed to complete match in DB:', e);
            }
        }
    }

    private removeFromQueues(socketId: string) {
        this.activeQueues.forEach((queue, destination) => {
            const index = queue.findIndex(u => u.socketId === socketId);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`[Queue] Removed ${socketId} from ${destination}`);
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
                    console.log(`[Disconnect] Notifying ${partnerId} that their partner disconnected.`);
                    this.server.to(partnerId).emit('partner_disconnected');
                }
            }
            this.userMatchMap.delete(socketId);
            this.activeMatches.delete(matchId);
        }
    }
}
