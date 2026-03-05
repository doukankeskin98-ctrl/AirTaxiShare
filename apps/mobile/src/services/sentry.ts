/**
 * Sentry Crash Analytics — Web-Safe Wrapper
 *
 * @sentry/react-native includes native modules that break the web bundler.
 * This module provides a no-op fallback on web and only loads Sentry on native.
 */
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

// Lazy-loaded Sentry reference (native only)
let SentryModule: any = null;

/**
 * Initialize Sentry crash analytics & performance monitoring.
 * No-op on web. Call once at app startup (App.tsx).
 */
export function initSentry() {
    if (!SENTRY_DSN || Platform.OS === 'web') {
        return;
    }

    try {
        // Dynamic require to avoid breaking web bundler
        SentryModule = require('@sentry/react-native');
        SentryModule.init({
            dsn: SENTRY_DSN,
            environment: __DEV__ ? 'development' : 'production',
            tracesSampleRate: __DEV__ ? 1.0 : 0.2,
            enableAutoSessionTracking: true,
            sessionTrackingIntervalMillis: 30000,
            debug: __DEV__,
        });
    } catch (e) {
        // Sentry not available — silently continue
    }
}

/**
 * Attach user context after login so crashes are attributed to specific users.
 */
export function setSentryUser(user: { id: string; email?: string; name?: string }) {
    SentryModule?.setUser({ id: user.id, email: user.email, username: user.name });
}

/**
 * Clear user context on logout.
 */
export function clearSentryUser() {
    SentryModule?.setUser(null);
}

export function hasSentryDSN(): boolean {
    return !!SENTRY_DSN && Platform.OS !== 'web';
}

/**
 * Sentry proxy — provides wrap() and ErrorBoundary on native, no-ops on web.
 */
export const Sentry = {
    wrap: (component: any) => {
        if (SentryModule?.wrap) return SentryModule.wrap(component);
        return component;
    },
    captureException: (error: any) => {
        SentryModule?.captureException(error);
    },
    captureMessage: (message: string) => {
        SentryModule?.captureMessage(message);
    },
};
