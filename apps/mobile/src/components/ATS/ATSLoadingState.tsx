import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface ATSLoadingStateProps {
    message?: string;
}

export const ATSLoadingState: React.FC<ATSLoadingStateProps> = ({ message }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message && <Text style={styles.text}>{message}</Text>}
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
    text: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.m,
        textAlign: 'center',
    },
});
