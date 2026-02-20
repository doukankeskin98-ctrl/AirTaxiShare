import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { ATSButton } from './ATSButton';

interface ATSEmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const ATSEmptyState: React.FC<ATSEmptyStateProps> = ({
    icon = 'alert-circle-outline',
    title,
    message,
    actionLabel,
    onAction,
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={colors.textSecondary} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
            {actionLabel && onAction && (
                <ATSButton
                    title={actionLabel}
                    onPress={onAction}
                    variant="secondary"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    icon: {
        marginBottom: spacing.m,
        opacity: 0.5,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.l,
    },
    button: {
        marginTop: spacing.s,
        width: 'auto',
        minWidth: 150,
    },
});
