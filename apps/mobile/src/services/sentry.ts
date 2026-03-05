/**
 * Sentry Crash Analytics — Native only (iOS/Android)
 *
 * This file is used on native platforms. Web uses sentry.web.ts (auto-selected by Metro).
 */
import * as SentryNative from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
    if (!SENTRY_DSN) return;

    SentryNative.init({
        dsn: SENTRY_DSN,
        environment: __DEV__ ? 'development' : 'production',
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        debug: __DEV__,
    });
}

export function setSentryUser(user: { id: string; email?: string; name?: string }) {
    SentryNative.setUser({ id: user.id, email: user.email, username: user.name });
}

export function clearSentryUser() {
    SentryNative.setUser(null);
}

export function hasSentryDSN(): boolean {
    return !!SENTRY_DSN;
}

export const Sentry = {
    wrap: (component: any) => SentryNative.wrap(component),
    captureException: (error: any) => SentryNative.captureException(error),
    captureMessage: (message: string) => SentryNative.captureMessage(message),
};
