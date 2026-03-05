import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

/**
 * Initialize Sentry crash analytics & performance monitoring.
 * Call once at app startup (App.tsx).
 */
export function initSentry() {
    if (!SENTRY_DSN) {
        console.log('[Sentry] No DSN configured — crash reporting disabled');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: __DEV__ ? 'development' : 'production',
        release: Constants.expoConfig?.version || '1.0.0',
        tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of transactions in production
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        debug: __DEV__,
    });
}

/**
 * Attach user context after login so crashes are attributed to specific users.
 */
export function setSentryUser(user: { id: string; email?: string; name?: string }) {
    Sentry.setUser({ id: user.id, email: user.email, username: user.name });
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}

export function hasSentryDSN(): boolean {
    return !!SENTRY_DSN;
}

export { Sentry };
