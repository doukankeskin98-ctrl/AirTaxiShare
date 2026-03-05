/**
 * useNetworkStatus — Network connectivity hook
 * 
 * Returns current online/offline status.
 * Safely handles web and native platforms.
 */
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

let NetInfo: any = null;

// Only import on native
if (Platform.OS !== 'web') {
    try {
        NetInfo = require('@react-native-community/netinfo');
    } catch {
        // netinfo not available
    }
}

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        if (Platform.OS === 'web') {
            // Web: use navigator.onLine + events
            if (typeof window !== 'undefined') {
                setIsConnected(navigator.onLine);

                const handleOnline = () => setIsConnected(true);
                const handleOffline = () => setIsConnected(false);

                window.addEventListener('online', handleOnline);
                window.addEventListener('offline', handleOffline);

                return () => {
                    window.removeEventListener('online', handleOnline);
                    window.removeEventListener('offline', handleOffline);
                };
            }
            return;
        }

        // Native: use NetInfo
        if (NetInfo?.addEventListener) {
            const unsubscribe = NetInfo.addEventListener((state: any) => {
                setIsConnected(state.isConnected ?? true);
            });
            return () => unsubscribe();
        }
    }, []);

    return { isConnected };
}
