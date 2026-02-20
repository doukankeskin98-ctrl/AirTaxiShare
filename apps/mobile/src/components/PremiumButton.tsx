import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, typography, layout, shadows } from '../theme';

interface PremiumButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
}) => {
    const getTextColor = () => {
        if (disabled) return colors.textDisabled;
        if (variant === 'glass' || variant === 'outline') return colors.textPrimary;
        return colors.textPrimary; // In modern trend, mostly always white on buttons
    };

    const renderButtonContent = (pressed: boolean) => {
        const contentStyle = [
            styles.content,
            pressed && { opacity: 0.7 },
        ];

        const innerContent = (
            <>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            </>
        );

        if (loading) {
            return (
                <View style={contentStyle}>
                    <ActivityIndicator color={getTextColor()} />
                </View>
            );
        }

        // VIBRANT GRADIENT (Primary)
        if (variant === 'primary' && !disabled) {
            return (
                <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={contentStyle}
                >
                    {/* Inner highlight (simulates 3D gloss) */}
                    <View style={styles.topHighlight} />
                    {innerContent}
                </LinearGradient>
            );
        }

        // FROSTED GLASS (Glass / Secondary)
        if ((variant === 'glass' || variant === 'secondary') && !disabled) {
            return (
                <View style={[contentStyle, styles.glassContainer]}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    {/* The 1px modern inner border */}
                    <View style={styles.glassBorder} />
                    {innerContent}
                </View>
            );
        }

        // DISABLED or OUTLINE or DANGER fallbacks
        const fallbackBackgroundColor =
            disabled ? colors.surfaceLight :
                variant === 'danger' ? colors.error :
                    'transparent';

        return (
            <View style={[
                contentStyle,
                { backgroundColor: fallbackBackgroundColor },
                variant === 'outline' && styles.outlineBorder
            ]}>
                {innerContent}
            </View>
        );
    };

    return (
        <MotiView
            animate={{ scale: 1, opacity: 1 }}
            from={{ scale: 0.96, opacity: 0.8 }}
            transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300
            } as any}
            style={[styles.container, style]}
        >
            <Pressable
                onPress={onPress}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.pressable,
                    (variant === 'primary' && !disabled) && shadows.glow, // Subtle glowing aura
                    pressed && !disabled && styles.pressed,
                ]}
            >
                {({ pressed }) => renderButtonContent(pressed)}
            </Pressable>
        </MotiView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    pressable: {
        borderRadius: layout.radius.button, // Fully rounded Pill
        overflow: 'hidden',
    },
    pressed: {
        transform: [{ scale: 0.96 }],
    },
    content: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    },
    topHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // The modern 2024 inner shine
    },
    glassContainer: {
        backgroundColor: 'rgba(25, 28, 43, 0.4)', // Deep translucent backing
    },
    glassBorder: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: layout.radius.button,
    },
    outlineBorder: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: layout.radius.button,
    },
    iconContainer: {
        marginRight: 10,
    },
    text: {
        ...typography.button,
        textAlign: 'center',
    },
});
