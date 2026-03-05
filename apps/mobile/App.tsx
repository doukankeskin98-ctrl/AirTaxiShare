import 'react-native-gesture-handler';
import './src/i18n'; // Init i18n
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { setupForegroundNotificationListener, setupNotificationResponseListener } from './src/services/notifications';
import { navigationRef } from './src/navigation/RootNavigation';
import { ChatProvider } from './src/context/ChatContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initSentry, Sentry, hasSentryDSN } from './src/services/sentry';
import { applyWebPerformanceOptimizations } from './src/utils/webPerformance';
import { OfflineBanner } from './src/components/OfflineBanner';

// Initialize Sentry before anything else
initSentry();
// Apply web-only CSS performance optimizations (no-op on native)
applyWebPerformanceOptimizations();

function App() {
    useEffect(() => {
        const unsubscribeForeground = setupForegroundNotificationListener();
        const unsubscribeResponse = setupNotificationResponseListener({ current: navigationRef });

        return () => {
            unsubscribeForeground();
            unsubscribeResponse();
        };
    }, []);

    return (
        <ErrorBoundary>
            <ChatProvider>
                <OfflineBanner />
                <AppNavigator />
            </ChatProvider>
        </ErrorBoundary>
    );
}

// Only wrap with Sentry when DSN is configured, otherwise export plain App
export default hasSentryDSN() ? Sentry.wrap(App) : App;
