import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of matched user data
export interface MatchedUserData {
    id?: string;
    name: string;
    rating: number;
    trips?: number;
    photoUrl?: string;
}

export interface MatchFoundPayload {
    matchId: string;
    partnerId: string;
    userData: MatchedUserData;
}

class SocketService {
    private socket: Socket | null = null;

    // Use EXPO_PUBLIC_API_URL from environment variables for production readiness
    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    public async connect(token?: string) {
        if (!this.socket) {
            // If no token passed, try to get it from storage
            let authToken = token;
            if (!authToken) {
                try {
                    authToken = (await AsyncStorage.getItem('@auth_token')) || undefined;
                } catch (e) {
                    console.log('Could not get auth token for socket');
                }
            }

            this.socket = io(this.SERVER_URL, {
                auth: { token: authToken },
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
        if (!this.socket) {
            this.connect();
        }

        // No longer sending fake userData from client
        // Backend will resolve user data from JWT token
        this.socket?.emit('join_queue', {
            destination: payload.destination,
            time: payload.time || '',
            luggage: payload.luggage,
        });
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

    // --- CHAT METHODS ---
    public sendMessage(matchId: string, text: string) {
        if (!this.socket) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.socket.emit('send_message', { matchId, text, time });
    }

    public onReceiveMessage(callback: (message: any) => void) {
        this.socket?.on('receive_message', callback);
    }

    public offReceiveMessage() {
        this.socket?.off('receive_message');
    }

    public endMatch(matchId: string) {
        this.socket?.emit('end_match', { matchId });
    }
}

export default new SocketService();
