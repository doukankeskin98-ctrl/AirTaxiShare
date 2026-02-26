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

    // Callbacks registered before the socket was created — replayed on connect
    private pendingCallbacks: Map<string, ((...args: any[]) => void)[]> = new Map();

    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    /** Queue or immediately register an event listener. Returns an unsubscribe function. */
    private on(event: string, cb: (...args: any[]) => void): () => void {
        if (this.socket) {
            this.socket.on(event, cb);
        } else {
            const list = this.pendingCallbacks.get(event) || [];
            list.push(cb);
            this.pendingCallbacks.set(event, list);
        }
        return () => this.off(event, cb);
    }

    /** Remove a specific event listener, or all if no cb provided */
    private off(event: string, cb?: (...args: any[]) => void) {
        if (this.socket) {
            if (cb) this.socket.off(event, cb);
            else this.socket.off(event);
        }

        if (cb && this.pendingCallbacks.has(event)) {
            const list = this.pendingCallbacks.get(event)!;
            this.pendingCallbacks.set(event, list.filter(fn => fn !== cb));
        } else if (!cb) {
            this.pendingCallbacks.delete(event);
        }
    }

    /** Apply any pending callbacks onto the freshly created socket */
    private flushPendingCallbacks() {
        this.pendingCallbacks.forEach((cbs, event) => {
            cbs.forEach(cb => this.socket?.on(event, cb));
        });
        this.pendingCallbacks.clear();
    }

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
                this.flushPendingCallbacks(); // Replay any listeners registered before connect
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

    public onActiveQueuesList(callback: (payload: { queues: any[] }) => void) {
        return this.on('active_queues_list', callback);
    }

    public onMatchFound(callback: (payload: MatchFoundPayload) => void) {
        return this.on('match_found', callback);
    }

    public onQueueCount(callback: (count: number) => void) {
        return this.on('queue_count', (payload: { count: number }) => callback(payload.count));
    }

    public onPartnerDisconnected(callback: () => void) {
        return this.on('partner_disconnected', callback);
    }

    public onMatchEnded(callback: (payload: { reason: string }) => void) {
        return this.on('match_ended', callback);
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
     * Safe to call before connect() — will be queued and applied on connection.
     */
    public onRawReceiveMessage(callback: (message: any) => void) {
        return this.on('receive_message', callback);
    }

    /** Register receive_message listener purely for the screen. ChatContext handles global persistence. */
    public onReceiveMessage(matchId: string, callback: (message: any) => void) {
        const wrapped = (message: any) => {
            // Only fire callback if message belongs to this active chat
            if (message.matchId && message.matchId !== matchId) return;
            callback(message);
        };
        return this.on('receive_message', wrapped);
    }

    public endMatch(matchId: string) {
        this.socket?.emit('end_match', { matchId });
    }

    // --- MEETING POINT SYNC ---

    public selectMeetingPoint(matchId: string, point: string) {
        this.socket?.emit('select_meeting_point', { matchId, point });
    }

    public onPartnerMeetingPoint(callback: (point: string) => void) {
        return this.on('partner_meeting_point', (payload: { point: string }) => callback(payload.point));
    }

    // --- MEETUP CONFIRMATION ---

    public confirmMeetup(matchId: string) {
        this.socket?.emit('confirm_meetup', { matchId });
    }

    public onMeetupConfirmed(callback: () => void) {
        return this.on('meetup_confirmed', callback);
    }

    // --- PARTNER PRESENCE ---

    public onPartnerOnlineStatus(callback: (online: boolean) => void) {
        const unsubOnline = this.on('partner_online', () => callback(true));
        const unsubOffline = this.on('partner_offline', () => callback(false));
        return () => {
            unsubOnline();
            unsubOffline();
        };
    }

    /** Helper to emit any ad-hoc event safely */
    public emit(event: string, payload?: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, payload);
        }
    }
}

export default new SocketService();
