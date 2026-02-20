import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface ATSStatusBadgeProps {
    status: 'success' | 'warning' | 'danger' | 'info';
    label: string;
}

export const ATSStatusBadge: React.FC<ATSStatusBadgeProps> = ({ status, label }) => {
    const getColors = () => {
        switch (status) {
            case 'success':
                return { bg: colors.success + '20', text: colors.success }; // 20% opacity
            case 'warning':
                return { bg: colors.warning + '20', text: colors.warning };
            case 'danger':
                return { bg: colors.error + '20', text: colors.error };
            default:
                return { bg: colors.primary + '20', text: colors.primary };
        }
    };

    const style = getColors();

    return (
        <View style={[styles.container, { backgroundColor: style.bg }]}>
            <Text style={[styles.text, { color: style.text }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.s,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    text: {
        ...typography.caption,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 10,
    },
});
