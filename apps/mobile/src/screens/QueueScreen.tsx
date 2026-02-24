import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { showConfirm } from '../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { Easing } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import SocketService, { MatchFoundPayload } from '../services/socket';
import { getAuthToken } from '../services/api';
import { showAlert } from '../utils/alert';

const LUGGAGE_LABELS: Record<string, string> = {
    small: 'Küçük Bagaj',
    medium: 'Orta Bagaj',
    large: 'Büyük Bagaj',
};

const DEST_COLORS: Record<string, string> = {
    maslak: '#6366F1',
    levent: '#0EA5E9',
    atasehir: '#10B981',
    istanbul: '#F59E0B',
};

const TIPS = [
    'Eşleşme bulunduğunda bildirim alacaksınız.',
    'Ortalama bekleme süresi 2-3 dakika.',
    'Aynı havalimanından aynı yöne giden yolcular eşleştiriliyor.',
    'Profil puanınız eşleşme kalitesini artırır.',
];

export default function QueueScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { destination, time, luggage } = route.params || {};

    const [liveCount, setLiveCount] = useState<number | null>(null);
    const [isFinding, setIsFinding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const timerRef = useRef<any>(null);
    const tipRef = useRef<any>(null);

    const destColor = DEST_COLORS[destination?.toLowerCase()] || '#6366F1';

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        tipRef.current = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
        return () => {
            clearInterval(timerRef.current);
            clearInterval(tipRef.current);
        };
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    useEffect(() => {
        const startSearch = async () => {
            try {
                setIsFinding(true);
                setError(null);
                const token = getAuthToken();
                await SocketService.connect(token || undefined);
                await SocketService.joinQueue({ destination, time, luggage });

                SocketService.onMatchFound((payload: MatchFoundPayload) => {
                    navigation.replace('MatchFound', {
                        matchId: payload.matchId,
                        otherUser: payload.userData,
                        luggage,
                    });
                });

                SocketService.onQueueCount((count: number) => setLiveCount(count));
            } catch (err: any) {
                setIsFinding(false);
                setError(err.message || 'Sunucuya bağlanılamadı.');
                showAlert('Bağlantı Hatası', err.message || 'Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.');
                navigation.goBack();
            }
        };
        startSearch();

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
            () => { SocketService.leaveQueue(); navigation.goBack(); },
            'Evet, İptal Et',
            'Hayır',
            true
        );
    };

    return (
        <View style={styles.container}>
            {/* Background */}
            <LinearGradient colors={['#090818', '#13112A', colors.background]} style={StyleSheet.absoluteFillObject} />

            {/* Ambient orbs */}
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.35, scale: 1.3 }}
                transition={{ type: 'timing', duration: 4000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -120, right: -180, backgroundColor: destColor }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1.1 }}
                transition={{ type: 'timing', duration: 5500, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { bottom: -120, left: -180, backgroundColor: '#7C3AED' }]}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <MotiText
                        from={{ opacity: 0, translateY: -6 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 100 } as any}
                        style={styles.headerTitle}
                    >
                        Eşleşme Aranıyor
                    </MotiText>
                    {/* Timer */}
                    <BlurView intensity={20} tint="dark" style={styles.timerPill}>
                        <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                    </BlurView>
                </View>

                <View style={styles.content}>
                    {/* ── RADAR ── */}
                    <View style={styles.radarWrapper}>
                        {/* Outer pulsing rings (4 of them, staggered) */}
                        {[0, 1, 2, 3].map(i => (
                            <MotiView
                                key={i}
                                from={{ opacity: 0.6, scale: 0.9 }}
                                animate={{ opacity: 0, scale: 3.2 }}
                                transition={{
                                    type: 'timing', duration: 3000,
                                    loop: true, delay: i * 650,
                                    easing: Easing.out(Easing.exp),
                                } as any}
                                style={[styles.radarRing, { borderColor: `${destColor}60` }]}
                            />
                        ))}

                        {/* Static reference ring */}
                        <View style={[styles.staticRing, { borderColor: `${destColor}18` }]} />
                        <View style={[styles.staticRingMid, { borderColor: `${destColor}10` }]} />

                        {/* Center glass orb */}
                        <BlurView intensity={60} tint="dark" style={styles.radarCenter}>
                            <View style={styles.radarCenterShimmer} />
                            <LinearGradient
                                colors={[`${destColor}30`, `${destColor}10`]}
                                style={styles.radarGlow}
                            />
                            <MotiView
                                from={{ rotate: '0deg' }}
                                animate={{ rotate: '360deg' }}
                                transition={{ type: 'timing', duration: 3000, loop: true, easing: Easing.linear } as any}
                                style={styles.radarSweep}
                            >
                                <LinearGradient
                                    colors={[destColor, `${destColor}00`]}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={styles.sweepLine}
                                />
                            </MotiView>
                            <Ionicons name="search" size={36} color="#FFF" />
                        </BlurView>

                        {/* Floating "user found" dots */}
                        {liveCount !== null && liveCount > 0 && (
                            <View style={styles.floatingDots}>
                                {Array.from({ length: Math.min(liveCount, 4) }).map((_, i) => {
                                    const angle = (i / Math.max(liveCount, 1)) * 2 * Math.PI;
                                    const r = 90;
                                    const x = Math.cos(angle) * r;
                                    const y = Math.sin(angle) * r;
                                    return (
                                        <MotiView
                                            key={i}
                                            from={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 800 + i * 200, type: 'spring' } as any}
                                            style={[styles.floatDot, { transform: [{ translateX: x }, { translateY: y }] }]}
                                        >
                                            <LinearGradient colors={['#4F46E5', '#06B6D4']} style={styles.floatDotGrad} />
                                            <Ionicons name="person" size={12} color="#FFF" />
                                        </MotiView>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Status text */}
                    <MotiText
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600 } as any}
                        style={styles.statusText}
                    >
                        Yakınınızdaki yolcular taranıyor
                    </MotiText>

                    {/* Info card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 800, type: 'spring' } as any}
                        style={styles.infoCard}
                    >
                        <BlurView intensity={30} tint="dark" style={styles.infoCardInner}>
                            <View style={styles.infoCardShimmer} />
                            <View style={styles.infoRow}>
                                {/* Destination */}
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIcon, { backgroundColor: `${destColor}20` }]}>
                                        <Ionicons name="location" size={18} color={destColor} />
                                    </View>
                                    <Text style={styles.infoVal}>{destination?.toUpperCase() || 'HEDEF'}</Text>
                                    <Text style={styles.infoKey}>Varış</Text>
                                </View>

                                <View style={styles.infoDivider} />

                                {/* Luggage */}
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIcon, { backgroundColor: 'rgba(139,92,246,0.18)' }]}>
                                        <Ionicons name="briefcase" size={18} color="#A78BFA" />
                                    </View>
                                    <Text style={styles.infoVal}>{LUGGAGE_LABELS[luggage] || 'Orta'}</Text>
                                    <Text style={styles.infoKey}>Bagaj</Text>
                                </View>

                                <View style={styles.infoDivider} />

                                {/* Live count */}
                                <View style={styles.infoItem}>
                                    <View style={[styles.infoIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                                        <Ionicons name="people" size={18} color="#10B981" />
                                    </View>
                                    <Text style={styles.infoVal}>
                                        {liveCount !== null ? `${liveCount}` : '—'}
                                    </Text>
                                    <Text style={styles.infoKey}>Kişi</Text>
                                </View>
                            </View>
                        </BlurView>
                    </MotiView>

                    {/* Tip rotator */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1200 } as any}
                        style={styles.tipWrap}
                    >
                        <Ionicons name="information-circle" size={14} color="rgba(255,255,255,0.3)" />
                        <MotiText
                            key={tipIndex}
                            from={{ opacity: 0, translateY: 4 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 400 } as any}
                            style={styles.tipText}
                        >
                            {TIPS[tipIndex]}
                        </MotiText>
                    </MotiView>
                </View>

                {/* Cancel */}
                <MotiView
                    from={{ opacity: 0, translateY: 24 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 1000, type: 'spring' } as any}
                    style={styles.cancelWrap}
                >
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.85}>
                        <BlurView intensity={30} tint="dark" style={styles.cancelBlur}>
                            <View style={styles.cancelShimmer} />
                            <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
                            <Text style={styles.cancelText}>İptal Et</Text>
                        </BlurView>
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    orb: {
        position: 'absolute', width: 400, height: 400, borderRadius: 200,
        opacity: 0.35, transform: [{ scale: 1.5 }],
        ...(Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : {}),
    },
    safeArea: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.l, paddingTop: spacing.m, paddingBottom: spacing.l,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
    timerPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 100, overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
    },
    timerText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.5)', fontVariant: ['tabular-nums'] as any },

    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.l },

    // Radar
    radarWrapper: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
    radarRing: {
        position: 'absolute', width: 100, height: 100, borderRadius: 50,
        borderWidth: 1.5,
    },
    staticRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1 },
    staticRingMid: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1 },
    radarCenter: {
        width: 110, height: 110, borderRadius: 55, overflow: 'hidden',
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(13,14,28,0.7)',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    },
    radarCenterShimmer: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    radarGlow: { ...StyleSheet.absoluteFillObject as any },
    radarSweep: { position: 'absolute', width: 55, height: 1, left: 55, top: 54.5, transformOrigin: 'left center' as any },
    sweepLine: { flex: 1 },

    // User dots
    floatingDots: { position: 'absolute', width: 0, height: 0, alignItems: 'center', justifyContent: 'center' },
    floatDot: {
        position: 'absolute', width: 28, height: 28, borderRadius: 14, overflow: 'hidden',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#FFF',
        shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8,
    },
    floatDotGrad: { ...StyleSheet.absoluteFillObject as any },

    // Status
    statusText: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: spacing.l, letterSpacing: 0.2 },

    // Info card
    infoCard: {
        width: '100%', borderRadius: 24, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5,
        marginBottom: spacing.l,
    },
    infoCardInner: {
        padding: spacing.l, backgroundColor: 'rgba(16,18,38,0.5)',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24, overflow: 'hidden',
    },
    infoCardShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoItem: { flex: 1, alignItems: 'center', gap: 6 },
    infoIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    infoVal: { fontSize: 13, fontWeight: '800', color: '#FFF', textAlign: 'center' },
    infoKey: { fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.07)' },

    // Tip
    tipWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: spacing.m },
    tipText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 17, textAlign: 'center' },

    // Cancel
    cancelWrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    cancelBtn: { borderRadius: 100, overflow: 'hidden' },
    cancelBlur: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, paddingHorizontal: 28,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    cancelText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
});
