import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { showConfirm, showAlert } from '../utils/alert';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Easing } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import SocketService, { MatchFoundPayload } from '../services/socket';
import { getAuthToken } from '../services/api';

export default function QueueScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { destination, time, luggage } = route.params || {};

    const [liveCount, setLiveCount] = useState<number | null>(null);
    const [isFinding, setIsFinding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startSearch = async () => {
            try {
                setIsFinding(true);
                setError(null);

                // Connect with auth token first, then join queue
                const token = getAuthToken();
                await SocketService.connect(token || undefined);
                await SocketService.joinQueue({ destination, time, luggage });

                // Listen for match events (after socket is connected)
                SocketService.onMatchFound((payload: MatchFoundPayload) => {
                    navigation.replace('MatchFound', {
                        matchId: payload.matchId,
                        otherUser: payload.userData,
                        luggage: luggage,
                    });
                });

                // Listen for real queue count updates
                SocketService.onQueueCount((count: number) => {
                    setLiveCount(count);
                });
            } catch (err: any) {
                console.error('[Queue] Search start failed:', err);
                setIsFinding(false);
                setError(err.message || 'Sunucuya bağlanılamadı.');
                showAlert(
                    'Bağlantı Hatası',
                    err.message || 'Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.',
                );
                navigation.goBack();
            }
        };

        startSearch();

        // Cleanup on unmount
        return () => {
            SocketService.leaveQueue();
            SocketService.offMatchFound();
            SocketService.offQueueCount();
            setIsFinding(false);
        };
    }, [navigation, destination, time, luggage]);

    const handleCancel = () => {
        showConfirm(
            'Aramayı İptal Et',
            'Eşleşme aramasını iptal etmek istediğinize emin misiniz?',
            () => {
                SocketService.leaveQueue();
                navigation.goBack();
            },
            'Evet, İptal Et',
            'Hayır',
            true
        );
    };

    return (
        <View style={styles.container}>
            {/* Dark Aurora Background */}
            <LinearGradient
                colors={['#09090B', '#15142E', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Animated Orbs */}
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1.2 }}
                transition={{ type: 'timing', duration: 4000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -100, right: -150, backgroundColor: colors.primary }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1.1 }}
                transition={{ type: 'timing', duration: 5000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { bottom: -100, left: -150, backgroundColor: colors.secondary }]}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Eşleşme Aranıyor</Text>
                </View>

                <View style={styles.content}>
                    {/* Pulsing Radar Animation */}
                    <View style={styles.radarContainer}>
                        {[...Array(3).keys()].map((index) => (
                            <MotiView
                                key={index}
                                from={{ opacity: 0.5, scale: 1 }}
                                animate={{ opacity: 0, scale: 3.5 }}
                                transition={{
                                    type: 'timing',
                                    duration: 2500,
                                    loop: true,
                                    delay: index * 400,
                                    easing: Easing.out(Easing.ease),
                                } as any}
                                style={[styles.radarCircle, { borderColor: colors.primaryLight }]}
                            />
                        ))}
                        <View style={styles.centerIconBox}>
                            <Ionicons name="search" size={32} color={colors.textPrimary} />
                        </View>
                    </View>

                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 500 } as any}
                        style={styles.statusText}
                    >
                        Yakınınızdaki yolcular taranıyor...
                    </MotiText>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 700 } as any}
                        style={styles.cardContainer}
                    >
                        <BlurView intensity={30} tint="dark" style={styles.infoCard}>
                            <View style={styles.cardHighlight} />
                            <View style={styles.row}>
                                <View style={styles.infoItem}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="location" size={20} color={colors.primaryLight} />
                                    </View>
                                    <Text style={styles.infoLabel}>{destination ? destination.toUpperCase() : 'HEDEF'}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoItem}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="briefcase" size={20} color={colors.primaryLight} />
                                    </View>
                                    <Text style={styles.infoLabel}>{luggage === 'small' ? 'KÜÇÜK' : luggage === 'large' ? 'BÜYÜK' : 'ORTA'}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoItem}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="people" size={20} color={colors.secondaryLight} />
                                    </View>
                                    <Text style={styles.infoLabel}>{liveCount !== null ? `${liveCount} YAKINDA` : 'YÜKLENIYOR'}</Text>
                                </View>
                            </View>
                        </BlurView>
                    </MotiView>
                </View>

                {/* Cancel Button */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 1000 } as any}
                    style={styles.footer}
                >
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelButton} activeOpacity={0.8}>
                        <BlurView intensity={20} tint="light" style={styles.cancelBlur}>
                            <Ionicons name="close" size={20} color="#FF6B6B" style={{ marginRight: 8 }} />
                            <Text style={styles.cancelText}>Aramayı İptal Et</Text>
                        </BlurView>
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    orb: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingTop: spacing.m,
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        zIndex: 10,
    },
    radarContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
    },
    radarCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1.5,
    },
    centerIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(79, 70, 229, 0.4)',
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...shadows.glow,
    },
    statusText: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        fontSize: 28,
        lineHeight: 34,
    },
    cardContainer: {
        width: '100%',
    },
    infoCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(25, 28, 43, 0.3)',
    },
    cardHighlight: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: spacing.l,
    },
    infoItem: {
        alignItems: 'center',
        gap: spacing.s,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: spacing.xxl,
    },
    cancelButton: {
        borderRadius: 100,
        overflow: 'hidden',
    },
    cancelBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 28,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    cancelText: {
        ...typography.button,
        color: '#FF6B6B',
        fontSize: 16,
    },
});
