import 'react-native-gesture-handler';
import './src/i18n'; // Init i18n
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { setupForegroundNotificationListener, setupNotificationResponseListener } from './src/services/notifications';
import { navigationRef } from './src/navigation/RootNavigation';
import { ChatProvider } from './src/context/ChatContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initSentry, Sentry } from './src/services/sentry';

// Initialize Sentry before anything else
initSentry();

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
                <AppNavigator />
            </ChatProvider>
        </ErrorBoundary>
    );
}

// Wrap with Sentry for automatic crash reporting & performance monitoring
export default Sentry.wrap(App);
