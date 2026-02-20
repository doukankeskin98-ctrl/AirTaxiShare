import { View, StyleSheet, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { colors, layout, shadows, spacing } from '../theme';

interface PremiumCardProps extends ViewProps {
    variant?: 'default' | 'elevated' | 'glass';
    style?: StyleProp<ViewStyle>;
    animate?: boolean;
    delay?: number;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
    children,
    variant = 'default',
    style,
    animate = false,
    delay = 0,
    ...props
}) => {
    const getCardStyle = () => {
        switch (variant) {
            case 'elevated':
                return [styles.card, styles.elevated];
            case 'glass':
                return [styles.card, styles.glass];
            default:
                return styles.card;
        }
    };

    if (animate) {
        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500, delay } as any}
                style={[getCardStyle(), style]}
                {...props}
            >
                {children}
            </MotiView>
        );
    }

    return (
        <View style={[getCardStyle(), style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.card,
        padding: spacing.m,
        ...shadows.card,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    elevated: {
        ...shadows.floating,
        backgroundColor: colors.surfaceLight,
    },
    glass: {
        backgroundColor: colors.glass,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: 'transparent',
        elevation: 0,
    },
});
