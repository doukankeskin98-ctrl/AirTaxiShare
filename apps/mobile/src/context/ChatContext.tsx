/**
 * ChatContext — Global message persistence layer
 *
 * Lives above the navigator. Maintains a single socket receive_message listener
 * that never unmounts, so messages are persisted to AsyncStorage even when
 * ChatScreen is not active. Also tracks unread count per matchId.
 */
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from '../services/socket';

interface ChatContextValue {
    /** Unread count for a given matchId */
    getUnread: (matchId: string) => number;
    /** Mark all messages for this matchId as read */
    markRead: (matchId: string) => void;
    /** Set the currently active matchId (ChatScreen open) */
    setActiveChatId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextValue>({
    getUnread: () => 0,
    markRead: () => { },
    setActiveChatId: () => { },
});

export function useChatContext() {
    return useContext(ChatContext);
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    // unreadCounts: matchId → count
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const activeChatId = useRef<string | null>(null);

    const getUnread = useCallback((matchId: string) => unreadCounts[matchId] || 0, [unreadCounts]);

    const markRead = useCallback((matchId: string) => {
        setUnreadCounts(prev => ({ ...prev, [matchId]: 0 }));
    }, []);

    const setActiveChatId = useCallback((id: string | null) => {
        activeChatId.current = id;
        if (id) {
            // Auto-clear unread when chat opens
            setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
        }
    }, []);

    // Global background listener — persists messages even when ChatScreen is not mounted.
    // This listener is registered once and never removed during the app lifecycle.
    useEffect(() => {
        const handleIncomingMessage = async (message: any) => {
            const matchId = message.matchId as string | undefined;
            if (!matchId) return;

            const msg = {
                id: message.id || `${Date.now()}`,
                text: message.text,
                sender: 'them' as const,
                time: message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            // Always persist to AsyncStorage
            await SocketService.persistMessage(matchId, msg);

            // Increment unread only if ChatScreen for this match is NOT active
            if (activeChatId.current !== matchId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [matchId]: (prev[matchId] || 0) + 1,
                }));
            }
        };

        // Register a raw receive_message listener (no matchId required since this is global)
        const unsub = SocketService.onRawReceiveMessage(handleIncomingMessage);

        return () => {
            // This cleanup only runs on full app unmount, which is fine
            if (unsub) unsub();
        };
    }, []);

    return (
        <ChatContext.Provider value={{ getUnread, markRead, setActiveChatId }}>
            {children}
        </ChatContext.Provider>
    );
}
