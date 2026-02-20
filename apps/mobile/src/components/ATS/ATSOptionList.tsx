import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, typography, spacing } from '../../theme';

interface ATSOptionListProps<T> {
    options: { label: string; value: T; subtitle?: string }[];
    selectedValue: T;
    onSelect: (value: T) => void;
    label?: string;
}

export const ATSOptionList = <T extends string | number>({
    options,
    selectedValue,
    onSelect,
    label,
}: ATSOptionListProps<T>) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.listContainer}>
                {options.map((option, index) => {
                    const isSelected = option.value === selectedValue;
                    const isLast = index === options.length - 1;
                    return (
                        <TouchableOpacity
                            key={String(option.value)}
                            style={[
                                styles.option,
                                !isLast && styles.borderBottom,
                                isSelected && styles.optionSelected,
                            ]}
                            onPress={() => onSelect(option.value)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.content}>
                                <Text style={[styles.optionLabel, isSelected && styles.textSelected]}>
                                    {option.label}
                                </Text>
                                {option.subtitle && (
                                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                                )}
                            </View>
                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
        marginBottom: spacing.s,
        marginLeft: spacing.xs,
    },
    listContainer: {
        backgroundColor: colors.surface,
        borderRadius: layout.radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: colors.surface,
    },
    optionSelected: {
        backgroundColor: colors.background, // light highlight
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    content: {
        flex: 1,
    },
    optionLabel: {
        ...typography.body,
        fontWeight: '500',
    },
    textSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    optionSubtitle: {
        ...typography.caption,
        marginTop: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
});
