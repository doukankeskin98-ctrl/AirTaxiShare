import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MatchedUserData {
    id?: string;
    name: string;
    rating: number;
    trips?: number;
    photoUrl?: string;
    trustBadge?: boolean;
    phoneVerified?: boolean;
    emailVerified?: boolean;
}

export interface MatchFoundPayload {
    matchId: string;
    partnerId: string;
    userData: MatchedUserData;
}

class SocketService {
    private socket: Socket | null = null;
    private connectPromise: Promise<void> | null = null;

    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    public async connect(token?: string): Promise<void> {
        if (this.socket?.connected) return;
        if (this.connectPromise) return this.connectPromise;

        this.connectPromise = new Promise<void>(async (resolve, reject) => {
            let authToken = token;
            if (!authToken) {
                try {
                    authToken = (await AsyncStorage.getItem('@auth_token')) || undefined;
                } catch (e) {
                    console.warn('[Socket] Could not read auth token');
                }
            }

            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }

            this.socket = io(this.SERVER_URL, {
                auth: { token: authToken },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 8,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 8000,
                timeout: 10000,
            });

            const cleanup = () => {
                this.connectPromise = null;
            };

            this.socket.on('connect', () => {
                console.log('[Socket] Connected:', this.socket?.id);
                cleanup();
                resolve();
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('[Socket] Disconnected:', reason);
            });

            this.socket.on('connect_error', (err) => {
                console.error('[Socket] Connection error:', err.message);
                cleanup();
                // Reject with meaningful error — callers can display it to user
                reject(new Error(`Sunucuya bağlanılamadı: ${err.message}`));
            });
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

    public isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    public async joinQueue(payload: { destination: string; time?: string; luggage: string }) {
        await this.connect();
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

    public onPartnerDisconnected(callback: () => void) {
        this.socket?.on('partner_disconnected', callback);
    }

    public offPartnerDisconnected() {
        this.socket?.off('partner_disconnected');
    }

    public onMatchEnded(callback: (payload: { reason: string }) => void) {
        this.socket?.on('match_ended', callback);
    }

    public offMatchEnded() {
        this.socket?.off('match_ended');
    }

    // --- CHAT ---
    public sendMessage(matchId: string, text: string) {
        if (!this.socket?.connected) {
            console.warn('[Socket] Cannot send message — not connected');
            return false;
        }
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.socket.emit('send_message', { matchId, text, time });
        return true;
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
