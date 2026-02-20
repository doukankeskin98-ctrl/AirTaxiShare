import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, layout, typography, spacing } from '../../theme';

interface ATSChipSelectorProps<T> {
    options: { label: string; value: T; icon?: React.ReactNode }[];
    selectedValue: T;
    onSelect: (value: T) => void;
    label?: string;
}

export const ATSChipSelector = <T extends string | number>({
    options,
    selectedValue,
    onSelect,
    label,
}: ATSChipSelectorProps<T>) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {options.map((option) => {
                    const isSelected = option.value === selectedValue;
                    return (
                        <TouchableOpacity
                            key={String(option.value)}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                            ]}
                            onPress={() => onSelect(option.value)}
                            activeOpacity={0.8}
                        >
                            {option.icon && <View style={styles.iconContainer}>{option.icon}</View>}
                            <Text
                                style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.m,
    },
    label: {
        ...typography.caption,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.s,
        marginLeft: spacing.xs,
    },
    scrollContent: {
        paddingRight: spacing.m,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        marginRight: spacing.s,
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    iconContainer: {
        marginRight: spacing.xs,
    },
    chipText: {
        ...typography.body,
        fontSize: 14,
        color: colors.textPrimary,
    },
    chipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
