import 'react-native-gesture-handler';
import './src/i18n'; // Init i18n
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { setupForegroundNotificationListener, setupNotificationResponseListener } from './src/services/notifications';
import { navigationRef } from './src/navigation/RootNavigation';

export default function App() {
    useEffect(() => {
        const unsubscribeForeground = setupForegroundNotificationListener();
        const unsubscribeResponse = setupNotificationResponseListener({ current: navigationRef });

        return () => {
            unsubscribeForeground();
            unsubscribeResponse();
        };
    }, []);

    return <AppNavigator />;
}
