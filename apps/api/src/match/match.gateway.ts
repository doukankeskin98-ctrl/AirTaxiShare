import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    private activeQueues: Map<string, string[]> = new Map(); // destination -> [socketId]

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.removeFromQueues(client.id);
    }

    @SubscribeMessage('join_queue')
    handleJoinQueue(client: Socket, payload: { destination: string; time: string; luggage: string; userData?: any }) {
        const { destination, userData } = payload;
        console.log(`Client ${client.id} joining queue for ${destination}`);

        if (!this.activeQueues.has(destination)) {
            this.activeQueues.set(destination, []);
        }

        // Store socketId and userData together
        const queue = this.activeQueues.get(destination);
        if (queue) {
            // Since activeQueues is typed as string[], we'll store a serialized version of the data 
            // stringified so we don't break the existing Map type temporarily
            const entry = JSON.stringify({ socketId: client.id, userData: userData || { name: 'Anonim', rating: 4.5 } });
            queue.push(entry);

            if (queue.length >= 2) {
                const user1Str = queue.shift();
                const user2Str = queue.shift();

                if (user1Str && user2Str) {
                    const user1 = JSON.parse(user1Str);
                    const user2 = JSON.parse(user2Str);
                    const matchId = `match-${Date.now()}`;

                    this.server.to(user1.socketId).emit('match_found', { matchId, partnerId: user2.socketId, userData: user2.userData });
                    this.server.to(user2.socketId).emit('match_found', { matchId, partnerId: user1.socketId, userData: user1.userData });
                    console.log(`Matched ${user1.socketId} and ${user2.socketId}`);
                }
            }
        }
    }

    @SubscribeMessage('leave_queue')
    handleLeaveQueue(client: Socket) {
        this.removeFromQueues(client.id);
    }

    @SubscribeMessage('chat_message')
    handleChatMessage(client: Socket, payload: { matchId: string; message: string; to: string }) {
        // In a real app, 'to' would be derived from matchId room
        // For now, simpler direct p2p mock
        // client.to(payload.matchId).emit('chat_message', payload);
        console.log(`Chat from ${client.id}: ${payload.message}`);
    }

    private removeFromQueues(socketId: string) {
        this.activeQueues.forEach((users, dest) => {
            const index = users.indexOf(socketId);
            if (index !== -1) {
                users.splice(index, 1);
            }
        });
    }
}
