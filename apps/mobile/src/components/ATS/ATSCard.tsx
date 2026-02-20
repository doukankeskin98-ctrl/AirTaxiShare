import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, layout, shadows, spacing, typography } from '../../theme';

interface ATSCardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    noPadding?: boolean;
}

export const ATSCard: React.FC<ATSCardProps> = ({
    title,
    subtitle,
    children,
    style,
    noPadding = false,
}) => {
    return (
        <View style={[styles.card, style]}>
            {(title || subtitle) && (
                <View style={styles.header}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            <View style={!noPadding && styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.card,
        ...shadows.card,
        marginBottom: spacing.m,
        overflow: 'hidden',
    },
    header: {
        padding: spacing.m,
        paddingBottom: spacing.s,
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.caption,
        fontSize: 14,
    },
    content: {
        padding: spacing.m,
        paddingTop: 0,
    },
});
