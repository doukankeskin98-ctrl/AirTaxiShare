import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { colors, shadows, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface InputCardProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon?: keyof typeof Ionicons.glyphMap;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    secureTextEntry?: boolean;
}

export const InputCard: React.FC<InputCardProps> = ({
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType = 'default',
    secureTextEntry
}) => {
    return (
        <View style={styles.container}>
            {icon && (
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
            )}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12, // Soft rounded
        height: 56,
        marginVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.subtle,
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        ...typography.body,
        fontSize: 16,
    }
});
