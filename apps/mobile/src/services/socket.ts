import { io, Socket } from 'socket.io-client';

// Define the shape of matched user data
export interface MatchedUserData {
    name: string;
    rating: number;
    id?: string;
}

export interface MatchFoundPayload {
    matchId: string;
    partnerId: string;
    userData: MatchedUserData;
}

class SocketService {
    private socket: Socket | null = null;

    // Use EXPO_PUBLIC_API_URL from environment variables for production readiness
    // Fallback to localhost if not set
    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    public connect(token?: string) {
        if (!this.socket) {
            this.socket = io(this.SERVER_URL, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            this.socket.on('connect_error', (err) => {
                console.log('Socket connection error:', err.message);
            });
        }
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinQueue(payload: { destination: string; time?: string; luggage: string }) {
        if (!this.socket) this.connect();

        // Include mock user data for now since we bypass real auth to get the MVP working fast
        // In reality, backend decodes the token and gets the user profile
        const fullPayload = {
            ...payload,
            userData: {
                name: 'Kullanıcı ' + Math.floor(Math.random() * 100),
                rating: 4.8,
                trips: Math.floor(Math.random() * 50) + 1
            }
        };

        this.socket?.emit('join_queue', fullPayload);
    }

    public leaveQueue() {
        this.socket?.emit('leave_queue');
    }

    public onMatchFound(callback: (payload: MatchFoundPayload) => void) {
        this.socket?.on('match_found', callback);
    }

    public offMatchFound() {
        this.socket?.off('match_found');
    }
}

export default new SocketService();
