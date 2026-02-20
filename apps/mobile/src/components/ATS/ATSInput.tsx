import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, layout, typography, spacing } from '../../theme';

interface ATSInputProps extends TextInputProps {
    label?: string;
    error?: string;
    helper?: string;
    containerStyle?: ViewStyle;
}

export const ATSInput: React.FC<ATSInputProps> = ({
    label,
    error,
    helper,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor={colors.textSecondary}
                selectionColor={colors.primary}
                {...props}
            />
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : helper ? (
                <Text style={styles.helperText}>{helper}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
        width: '100%',
    },
    label: {
        ...typography.caption,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    input: {
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: layout.radius.m,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.m,
        fontSize: 16,
        color: colors.textPrimary,
    },
    inputError: {
        borderColor: colors.error,
    },
    helperText: {
        ...typography.caption,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    errorText: {
        ...typography.caption,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
