import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, typography } from '../theme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ title, onPress, isLoading, disabled, style }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            style={[styles.container, style, disabled && styles.disabled]}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={disabled ? ['#ccc', '#ccc'] : colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 56,
        borderRadius: 28, // Fully rounded
        ...shadows.card,
        marginVertical: 10,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 28,
    },
    text: {
        ...typography.button,
        fontSize: 18,
        letterSpacing: 1,
    },
    disabled: {
        opacity: 0.7,
        ...shadows.subtle,
    }
});
