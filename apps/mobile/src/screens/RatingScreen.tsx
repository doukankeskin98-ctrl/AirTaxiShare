import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';

import { MatchAPI } from '../services/api';

export default function RatingScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { matchId, otherUser } = route.params || {};

    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tags = [
        { id: 'polite', label: t('rating.tags.polite') },
        { id: 'ontime', label: t('rating.tags.ontime') },
        { id: 'communication', label: t('rating.tags.communication') },
        { id: 'clean', label: 'Clean' },
        { id: 'driver', label: 'Good Driving' },
    ];

    const toggleTag = (id: string) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(t => t !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Submit rating to backend
            await MatchAPI.submitRating({
                matchId: matchId || '',
                toUserId: otherUser?.id || '',
                score: rating,
                tags: selectedTags,
                note: note,
            });
        } catch (error: any) {
            console.log('Rating submit error (non-critical):', error.message);
            // Don't block navigation on rating failure
        } finally {
            setIsSubmitting(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Minimal Header */}
            <View style={styles.headerSpacer} />
            <MotiText
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.headerTitle}
            >
                {t('rating.title')}
            </MotiText>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 100 } as any}
                >
                    <PremiumCard style={styles.card}>
                        <View style={styles.starContainer}>
                            <Text style={styles.subtitle}>{t('rating.subtitle')}</Text>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        activeOpacity={0.7}
                                    >
                                        <MotiView
                                            animate={{ scale: star <= rating ? 1.2 : 1 }}
                                            transition={{ type: 'spring' } as any}
                                        >
                                            <Ionicons
                                                name={star <= rating ? "star" : "star-outline"}
                                                size={40}
                                                color={star <= rating ? colors.warning : colors.textDisabled}
                                            />
                                        </MotiView>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </PremiumCard>
                </MotiView>

                {rating > 0 && (
                    <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ type: 'spring' } as any}
                    >
                        <PremiumCard style={styles.card}>
                            <Text style={styles.sectionLabel}>What went well?</Text>
                            <View style={styles.tagContainer}>
                                {tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    return (
                                        <TouchableOpacity
                                            key={tag.id}
                                            style={[
                                                styles.tag,
                                                isSelected && styles.tagSelected
                                            ]}
                                            onPress={() => toggleTag(tag.id)}
                                        >
                                            <Text style={[
                                                styles.tagText,
                                                isSelected && styles.tagTextSelected
                                            ]}>{tag.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </PremiumCard>

                        <PremiumCard style={styles.card}>
                            <Text style={styles.sectionLabel}>Add a note (optional)</Text>
                            <TextInput
                                placeholder="How was your experience?"
                                placeholderTextColor={colors.textDisabled}
                                value={note}
                                onChangeText={setNote}
                                multiline
                                style={styles.input}
                            />
                        </PremiumCard>
                    </MotiView>
                )}
            </ScrollView>

            <MotiView
                style={styles.footer}
                animate={{
                    opacity: rating > 0 ? 1 : 0.5,
                    translateY: rating > 0 ? 0 : 20
                }}
            >
                <PremiumButton
                    title={t('rating.cta.submit')}
                    onPress={handleSubmit}
                    disabled={rating === 0}
                    loading={isSubmitting}
                    icon={<Ionicons name="checkmark" size={20} color="#FFF" />}
                    style={styles.submitButton}
                />
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerSpacer: {
        height: 60,
    },
    headerTitle: {
        ...typography.h3,
        textAlign: 'center',
        marginVertical: spacing.m,
        color: colors.textPrimary,
    },
    content: {
        padding: spacing.m,
        paddingBottom: 100,
    },
    card: {
        marginBottom: spacing.m,
        padding: spacing.l,
        borderRadius: 20,
    },
    starContainer: {
        alignItems: 'center',
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.l,
        textAlign: 'center',
    },
    stars: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    sectionLabel: {
        ...typography.h3,
        fontSize: 16,
        marginBottom: spacing.m,
        color: colors.textPrimary,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.s,
    },
    tag: {
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    tagSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.surface,
    },
    tagText: {
        ...typography.caption,
        fontSize: 14,
        color: colors.textSecondary,
    },
    tagTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    input: {
        ...typography.body,
        minHeight: 80,
        textAlignVertical: 'top',
        color: colors.textPrimary,
        backgroundColor: colors.background,
        padding: spacing.m,
        borderRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.l,
        paddingBottom: 40,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    submitButton: {
        width: '100%',
    },
});
