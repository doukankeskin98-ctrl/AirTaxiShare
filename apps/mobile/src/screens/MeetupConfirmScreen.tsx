import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumCard } from '../components/PremiumCard';
import { ATSLoadingState } from '../components/ATS/ATSLoadingState'; // Keep for now or replace if PremiumLoading exists? Use ATS for now or build inline
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';

export default function MeetupConfirmScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    // State: 'pending', 'confirmed_by_me', 'success'
    const [status, setStatus] = useState('pending');

    const handleConfirm = () => {
        setStatus('confirmed_by_me');

        // Mock waiting for other user
        setTimeout(() => {
            setStatus('success');
            // Navigate to Rating after short delay
            setTimeout(() => {
                navigation.replace('Rating', { matchId: 'mock-123' });
            }, 1500);
        }, 2000);
    };

    const handleDispute = () => {
        alert('Dispute reported');
    };

    return (
        <View style={styles.container}>
            {/* Header with Cancel Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        Alert.alert(
                            'İptal Et',
                            'Buluşmayı iptal etmek istiyor musunuz?',
                            [
                                { text: 'Hayır', style: 'cancel' },
                                {
                                    text: 'Evet, İptal Et',
                                    style: 'destructive',
                                    onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
                                }
                            ]
                        );
                    }}
                >
                    <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </BlurView>
                </TouchableOpacity>
                <MotiText
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={styles.headerTitle}
                >
                    {t('meetup.title')}
                </MotiText>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring' } as any}
                >
                    <PremiumCard style={styles.card}>
                        <View style={styles.center}>
                            <MotiView
                                from={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 200 } as any}
                            >
                                <Ionicons name="people-circle" size={100} color={colors.primary} />
                            </MotiView>
                            <Text style={styles.subtitle}>{t('meetup.subtitle')}</Text>
                        </View>
                    </PremiumCard>
                </MotiView>

                {status === 'pending' && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={300}
                        style={styles.actionContainer}
                    >
                        <PremiumButton
                            title={t('meetup.cta.met')}
                            onPress={handleConfirm}
                            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />}
                            style={styles.confirmButton}
                        />
                    </MotiView>
                )}

                {status === 'confirmed_by_me' && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.statusContainer}
                    >
                        <ATSLoadingState message={t('meetup.waitingOther')} />
                    </MotiView>
                )}

                {status === 'success' && (
                    <MotiView
                        from={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={styles.successContainer}
                    >
                        <View style={styles.successCircle}>
                            <Ionicons name="checkmark" size={60} color="#FFF" />
                        </View>
                        <Text style={styles.successText}>Meetup Confirmed!</Text>
                    </MotiView>
                )}

                <View style={styles.spacer} />

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    delay={600}
                >
                    <PremiumButton
                        title={t('meetup.dispute.title')}
                        onPress={handleDispute}
                        variant="secondary"
                        style={styles.disputeButton}
                        textStyle={{ color: colors.textSecondary }}
                    />
                </MotiView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.m,
        paddingTop: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    backBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        ...typography.h2,
        textAlign: 'center',
        color: colors.textPrimary,
        fontSize: 20,
    },
    content: {
        padding: spacing.l,
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        marginBottom: spacing.xl,
        padding: spacing.xl,
        borderRadius: 24,
    },
    center: {
        alignItems: 'center',
    },
    subtitle: {
        ...typography.body,
        textAlign: 'center',
        marginTop: spacing.m,
        color: colors.textSecondary,
    },
    actionContainer: {
        width: '100%',
        alignItems: 'center',
    },
    confirmButton: {
        width: '100%',
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    successText: {
        ...typography.h3,
        color: colors.success,
    },
    spacer: {
        flex: 1,
    },
    disputeButton: {
        backgroundColor: 'transparent',
    },
});
