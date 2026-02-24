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

    // Key prefix for AsyncStorage chat persistence
    private static chatKey(matchId: string) { return `@chat_${matchId}`; }

    /** Save a single message to AsyncStorage under its matchId */
    public async persistMessage(matchId: string, msg: { id: string; text: string; sender: 'me' | 'them'; time: string }) {
        try {
            const raw = await AsyncStorage.getItem(SocketService.chatKey(matchId));
            const existing: any[] = raw ? JSON.parse(raw) : [];
            existing.push(msg);
            // Keep last 200 messages max
            const trimmed = existing.slice(-200);
            await AsyncStorage.setItem(SocketService.chatKey(matchId), JSON.stringify(trimmed));
        } catch (e) {
            console.warn('[Socket] Failed to persist message:', e);
        }
    }

    /** Load all saved messages for a matchId */
    public async loadMessages(matchId: string): Promise<any[]> {
        try {
            const raw = await AsyncStorage.getItem(SocketService.chatKey(matchId));
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    public sendMessage(matchId: string, text: string) {
        if (!this.socket?.connected) {
            console.warn('[Socket] Cannot send message — not connected');
            return false;
        }
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.socket.emit('send_message', { matchId, text, time });
        return true;
    }

    /**
     * Global raw listener — used by ChatContext to persist messages app-wide.
     * Unlike onReceiveMessage, does NOT require matchId in scope.
     */
    public onRawReceiveMessage(callback: (message: any) => void) {
        this.socket?.on('receive_message', callback);
    }

    public offRawReceiveMessage() {
        this.socket?.off('receive_message');
    }

    /** Register receive_message listener. Also saves every incoming message to AsyncStorage. */
    public onReceiveMessage(matchId: string, callback: (message: any) => void) {
        this.socket?.on('receive_message', (message: any) => {
            // Always persist — even if ChatScreen re-mounts later
            this.persistMessage(matchId, {
                id: message.id,
                text: message.text,
                sender: 'them',
                time: message.time,
            });
            callback(message);
        });
    }

    public offReceiveMessage() {
        this.socket?.off('receive_message');
    }

    public endMatch(matchId: string) {
        this.socket?.emit('end_match', { matchId });
    }

    // --- MEETING POINT SYNC ---

    public selectMeetingPoint(matchId: string, point: string) {
        this.socket?.emit('select_meeting_point', { matchId, point });
    }

    public onPartnerMeetingPoint(callback: (point: string) => void) {
        this.socket?.on('partner_meeting_point', (payload: { point: string }) => callback(payload.point));
    }

    public offPartnerMeetingPoint() {
        this.socket?.off('partner_meeting_point');
    }

    // --- MEETUP CONFIRMATION ---

    public confirmMeetup(matchId: string) {
        this.socket?.emit('confirm_meetup', { matchId });
    }

    public onMeetupConfirmed(callback: () => void) {
        this.socket?.on('meetup_confirmed', callback);
    }

    public offMeetupConfirmed() {
        this.socket?.off('meetup_confirmed');
    }

    // --- PARTNER PRESENCE ---

    public onPartnerOnlineStatus(callback: (online: boolean) => void) {
        this.socket?.on('partner_online', () => callback(true));
        this.socket?.on('partner_offline', () => callback(false));
    }

    public offPartnerOnlineStatus() {
        this.socket?.off('partner_online');
        this.socket?.off('partner_offline');
    }
}

export default new SocketService();
