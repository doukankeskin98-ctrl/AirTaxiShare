import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { MotiView, MotiText } from 'moti';
import { colors, typography, layout, shadows } from '../theme';

interface PremiumInputProps extends TextInputProps {
    label: string;
    error?: string;
    helper?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
    label,
    error,
    helper,
    containerStyle,
    leftIcon,
    rightIcon,
    onFocus,
    onBlur,
    value,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focusedInput,
                    !!error && styles.errorInput,
                ]}
            >
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

                <View style={styles.flex}>
                    <MotiText
                        animate={{
                            translateY: isFocused || hasValue ? -10 : 0,
                            scale: isFocused || hasValue ? 0.85 : 1,
                            color: isFocused ? colors.primary : colors.textSecondary,
                        } as any}
                        transition={{ type: 'timing', duration: 200 } as any}
                        style={styles.label}
                    >
                        {label}
                    </MotiText>

                    <TextInput
                        style={styles.input}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderTextColor="transparent" // Placeholder handled by animated label
                        value={value}
                        cursorColor={colors.primary}
                        {...props}
                    />
                </View>

                {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </View>

            {error && (
                <MotiView
                    from={{ opacity: 0, translateY: -5 }}
                    animate={{ opacity: 1, translateY: 0 } as any}
                >
                    <Text style={styles.errorText}>{error}</Text>
                </MotiView>
            )}
            {!error && helper && (
                <Text style={styles.helperText}>{helper}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: layout.radius.m,
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: 16,
        height: 60, // Taller touch target
        ...shadows.subtle,
    },
    focusedInput: {
        borderColor: colors.primary,
        backgroundColor: colors.surfaceLight,
    },
    errorInput: {
        borderColor: colors.error,
    },
    flex: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        top: 20, // Centered vertically initially
        left: 0,
        ...typography.body,
        zIndex: 1,
    },
    input: {
        ...typography.body,
        color: colors.textPrimary,
        height: '100%',
        paddingTop: 16, // Push text down to make room for label
        paddingBottom: 4,
    },
    iconLeft: {
        marginRight: 12,
    },
    iconRight: {
        marginLeft: 12,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
    helperText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 4,
        marginLeft: 4,
    },
});
