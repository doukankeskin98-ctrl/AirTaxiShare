import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on web, Android, and iOS.
 * On web, Alert.alert silently fails — this uses window.alert instead.
 */
export const showAlert = (title: string, message?: string) => {
    if (Platform.OS === 'web') {
        window.alert(message ? `${title}: ${message}` : title);
    } else {
        Alert.alert(title, message || '');
    }
};

/**
 * Cross-platform confirm dialog.
 * On web, falls back to window.confirm.
 */
export const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel',
    destructive = false
) => {
    if (Platform.OS === 'web') {
        if (window.confirm(`${title}\n${message}`)) {
            onConfirm();
        }
    } else {
        Alert.alert(title, message, [
            { text: cancelText, style: 'cancel' },
            { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
        ]);
    }
};
