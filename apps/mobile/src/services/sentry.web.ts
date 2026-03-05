/**
 * Sentry — Web stub (no-op)
 *
 * @sentry/react-native contains native modules that crash the web bundler.
 * This file is automatically picked by Metro for web builds (*.web.ts convention).
 * All exports are no-ops so the rest of the app works without any code changes.
 */

export function initSentry() { }
export function setSentryUser(_user: { id: string; email?: string; name?: string }) { }
export function clearSentryUser() { }
export function hasSentryDSN(): boolean { return false; }

export const Sentry = {
    wrap: (component: any) => component,
    captureException: (_error: any) => { },
    captureMessage: (_message: string) => { },
};
