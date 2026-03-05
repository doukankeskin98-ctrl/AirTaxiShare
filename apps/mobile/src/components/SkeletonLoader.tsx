/**
 * SkeletonLoader — Shimmer loading placeholders
 * 
 * Matches the app's glassmorphism dark theme.
 * Uses MotiView for smooth shimmer animation.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { colors, layout, spacing } from '../theme';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

/** Single animated skeleton bar */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    return (
        <MotiView
            from={{ opacity: 0.3 }}
            animate={{ opacity: 0.7 }}
            transition={{
                type: 'timing',
                duration: 800,
                loop: true,
            } as any}
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.surfaceLight,
                },
                style,
            ]}
        />
    );
}

/** Skeleton shaped like a user card (avatar + lines) */
export function SkeletonCard() {
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.row}>
                <Skeleton width={44} height={44} borderRadius={12} />
                <View style={skeletonStyles.lines}>
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="45%" height={12} style={{ marginTop: 8 }} />
                </View>
            </View>
            <View style={{ marginTop: 16 }}>
                <Skeleton width="100%" height={10} />
                <Skeleton width="60%" height={10} style={{ marginTop: 8 }} />
            </View>
        </View>
    );
}

/** Skeleton for a single row item (match history) */
export function SkeletonRow() {
    return (
        <View style={skeletonStyles.rowCard}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="55%" height={13} />
                <Skeleton width="35%" height={11} style={{ marginTop: 6 }} />
            </View>
            <Skeleton width={60} height={24} borderRadius={12} />
        </View>
    );
}

/** Skeleton for stat/metric display */
export function SkeletonStat() {
    return (
        <View style={skeletonStyles.stat}>
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width="50%" height={28} style={{ marginTop: 10 }} />
            <Skeleton width="70%" height={11} style={{ marginTop: 8 }} />
        </View>
    );
}

const skeletonStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.glass,
        borderRadius: layout.radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.l,
        marginBottom: spacing.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lines: {
        flex: 1,
        marginLeft: 12,
    },
    rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass,
        borderRadius: layout.radius.m,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.m,
        marginBottom: spacing.s,
    },
    stat: {
        backgroundColor: colors.glass,
        borderRadius: layout.radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.l,
        alignItems: 'flex-start',
    },
});
