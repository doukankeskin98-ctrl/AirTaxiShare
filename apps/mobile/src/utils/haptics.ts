/**
 * Haptic Feedback Utility
 * 
 * Platform-safe wrapper around expo-haptics.
 * No-op on web (haptics only work on native devices).
 */
import { Platform } from 'react-native';

let Haptics: any = null;

// Only import on native — avoids web bundler issues
if (Platform.OS !== 'web') {
    try {
        Haptics = require('expo-haptics');
    } catch {
        // expo-haptics not installed or not available
    }
}

/**
 * Light impact — for button presses, selections
 */
export function hapticLight() {
    if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    }
}

/**
 * Medium impact — for toggles, swipes
 */
export function hapticMedium() {
    if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
    }
}

/**
 * Heavy impact — for important actions
 */
export function hapticHeavy() {
    if (Haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
    }
}

/**
 * Success notification — for match found, ride completed, rating submitted
 */
export function hapticSuccess() {
    if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    }
}

/**
 * Warning notification — for errors, leave match confirmations
 */
export function hapticWarning() {
    if (Haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
    }
}

/**
 * Selection changed — for picker changes, tab switches
 */
export function hapticSelection() {
    if (Haptics) {
        Haptics.selectionAsync().catch(() => { });
    }
}
