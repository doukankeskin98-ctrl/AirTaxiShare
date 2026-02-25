import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { showConfirm } from '../utils/alert';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import SocketService from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MeetupConfirmScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { matchId, otherUser } = route.params || {};

    // 'pending' | 'waiting_partner' | 'success'
    const [status, setStatus] = useState<'pending' | 'waiting_partner' | 'success'>('pending');

    useEffect(() => {
        SocketService.connect().catch(() => { });

        // Listen for the server to confirm both sides have confirmed
        const unsubConfirm = SocketService.onMeetupConfirmed(() => {
            setStatus('success');
            setTimeout(() => {
                AsyncStorage.removeItem('@active_match').catch(() => { });
                navigation.replace('Rating', { matchId: matchId || 'mock-id', otherUser });
            }, 1500);
        });

        return () => {
            if (unsubConfirm) unsubConfirm();
        };
    }, [matchId, navigation, otherUser]);

    const handleConfirm = () => {
        setStatus('waiting_partner');
        // Emit real socket event — gateway tracks confirmations per matchId
        if (matchId && matchId !== 'mock-id') {
            SocketService.confirmMeetup(matchId);
        } else {
            // Demo mode: auto-complete after 2 seconds
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    AsyncStorage.removeItem('@active_match').catch(() => { });
                    navigation.replace('Rating', { matchId: matchId || 'mock-id', otherUser });
                }, 1500);
            }, 2000);
        }
    };

    const handleDispute = () => {
        showConfirm(
            'Sorun Bildir',
            'Bu eşleşmeyle ilgili bir sorun mu yaşıyorsunuz?',
            () => {
                if (matchId && matchId !== 'mock-id') {
                    SocketService.endMatch(matchId);
                }
                AsyncStorage.removeItem('@active_match').catch(() => { });
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            },
            'Evet, Sorun Var',
            'İptal',
            true,
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0B0D17', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        showConfirm(
                            'İptal Et',
                            'Buluşmayı iptal etmek istiyor musunuz?',
                            () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
                            'Evet, İptal Et',
                            'Hayır',
                            true,
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

                {/* Central icon animation */}
                <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 14 } as any}
                    style={styles.iconWrapper}
                >
                    {status === 'success' ? (
                        <View style={[styles.iconCircle, { backgroundColor: colors.success }]}>
                            <Ionicons name="checkmark" size={64} color="#FFF" />
                        </View>
                    ) : (
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20', borderWidth: 2, borderColor: colors.primary + '40' }]}>
                            <Ionicons name="people-circle" size={72} color={colors.primary} />
                        </View>
                    )}
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 200 } as any}
                    style={styles.textBlock}
                >
                    <Text style={styles.title}>
                        {status === 'success'
                            ? 'Buluşma Onaylandı! 🎉'
                            : status === 'waiting_partner'
                                ? 'Diğer yolcu bekleniyor...'
                                : t('meetup.subtitle')}
                    </Text>
                    <Text style={styles.subtitle}>
                        {status === 'success'
                            ? 'Harika bir yolculuk dileriz!'
                            : status === 'waiting_partner'
                                ? `${otherUser?.name || 'Yolcu'} buluşmayı onaylaması bekleniyor.`
                                : 'Buluşma noktasında karşılaştığınızda her iki taraf da onaylamalıdır.'}
                    </Text>
                </MotiView>

                {status === 'waiting_partner' && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.waitingRow}
                    >
                        {[0, 1, 2].map(i => (
                            <MotiView
                                key={i}
                                from={{ opacity: 0.2, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'timing', duration: 700, delay: i * 200, loop: true, repeatReverse: true } as any}
                                style={styles.waitingDot}
                            />
                        ))}
                    </MotiView>
                )}

                <View style={styles.spacer} />

                {status === 'pending' && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 } as any}
                    >
                        <PremiumButton
                            title={t('meetup.cta.met')}
                            onPress={handleConfirm}
                            icon={<Ionicons name="checkmark-circle-outline" size={22} color="#FFF" />}
                            style={styles.confirmButton}
                        />
                    </MotiView>
                )}

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: status === 'success' ? 0 : 1 }}
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
        paddingBottom: spacing.m,
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
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    textBlock: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.s,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.m,
    },
    waitingRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: spacing.xl,
    },
    waitingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    spacer: {
        flex: 1,
    },
    confirmButton: {
        width: '100%',
        marginBottom: spacing.m,
    },
    disputeButton: {
        backgroundColor: 'transparent',
        width: '100%',
    },
});
