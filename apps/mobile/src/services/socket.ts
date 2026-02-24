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
    private connectPromise: Promise<void> | null = null;

    // Use EXPO_PUBLIC_API_URL from environment variables for production readiness
    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    public async connect(token?: string): Promise<void> {
        // If already connected, skip
        if (this.socket?.connected) return;

        // If connection is in progress, wait for it
        if (this.connectPromise) return this.connectPromise;

        this.connectPromise = new Promise<void>(async (resolve) => {
            // If no token passed, try to get it from storage
            let authToken = token;
            if (!authToken) {
                try {
                    authToken = (await AsyncStorage.getItem('@auth_token')) || undefined;
                } catch (e) {
                    console.log('Could not get auth token for socket');
                }
            }

            // Disconnect existing socket if any
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
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
                this.connectPromise = null;
                resolve();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            this.socket.on('connect_error', (err) => {
                console.log('Socket connection error:', err.message);
                this.connectPromise = null;
                resolve(); // Resolve anyway to not block, even on error
            });

            // Safety timeout - resolve after 5 seconds even if no connect event
            setTimeout(() => {
                this.connectPromise = null;
                resolve();
            }, 5000);
        });

        return this.connectPromise;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connectPromise = null;
        }
    }

    public async joinQueue(payload: { destination: string; time?: string; luggage: string }) {
        // Ensure socket is connected before emitting
        await this.connect();

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
