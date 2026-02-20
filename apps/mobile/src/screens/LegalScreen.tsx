import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { ATSHeader } from '../components/ATS/ATSHeader';
import { ATSCard } from '../components/ATS/ATSCard';

export default function LegalScreen() {
    const { t } = useTranslation();
    const route = useRoute<any>();
    const { type } = route.params || { type: 'tos' };

    const title = type === 'tos' ? t('legal.tos.title') : t('legal.privacy.title');

    return (
        <View style={styles.container}>
            <ATSHeader title={title} />

            <ScrollView contentContainerStyle={styles.content}>
                <ATSCard>
                    <Text style={styles.text}>
                        {type === 'tos' ? t('legal.tos.body') : t('legal.privacy.body')}
                    </Text>
                </ATSCard>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.m,
    },
    text: {
        ...typography.body,
        color: colors.textSecondary,
    },
});
