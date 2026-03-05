/**
 * OfflineBanner — Shows a subtle animated banner when network is unavailable
 */
import React from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { colors, spacing, layout } from '../theme';

export function OfflineBanner() {
    const { isConnected } = useNetworkStatus();
    const { t } = useTranslation();

    if (isConnected) return null;

    return (
        <MotiView
            from={{ translateY: -60, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: -60, opacity: 0 }}
            transition={{ type: 'timing', duration: 300 } as any}
            style={styles.container}
        >
            <Ionicons name="cloud-offline-outline" size={16} color="#FBBF24" />
            <Text style={styles.text}>
                {t('common.offline', { defaultValue: 'Çevrimdışısınız · Veriler önbellekten gösteriliyor' })}
            </Text>
        </MotiView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 158, 11, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: spacing.m,
    },
    text: {
        color: '#FBBF24',
        fontSize: 13,
        fontWeight: '500',
    },
});
