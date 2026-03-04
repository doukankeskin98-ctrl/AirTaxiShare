import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserService } from './api';

// Configure how notifications appear while app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Registers for push notifications, requests permission, and uploads
 * the Expo push token to the backend. Call once after login.
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    const token = tokenData.data;

    // Upload to backend (non-blocking — don't fail if this fails)
    try {
        await UserService.updatePushToken(token);
    } catch (e) {
    }

    // Android: create a default notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6D28D9',
            sound: 'default',
        });
    }

    return token;
};

/**
 * Sets up a listener for notification taps. When the user taps a notification,
 * this navigates to the appropriate screen.
 */
export const setupNotificationResponseListener = (
    navigationRef: any,
): (() => void) => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data as any;
        if (!data || !navigationRef.current) return;

        if (data.type === 'match_found') {
            navigationRef.current.navigate('Home');
        } else if (data.type === 'new_message' && data.matchId) {
            navigationRef.current.navigate('Chat', { matchId: data.matchId });
        }
    });
    return () => subscription.remove();
};

/**
 * Sets up a listener for notifications received while the app is in the foreground.
 */
export const setupForegroundNotificationListener = (): (() => void) => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
    });
    return () => subscription.remove();
};
