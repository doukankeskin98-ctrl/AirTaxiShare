import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView,
    TouchableOpacity, Platform, StatusBar
} from 'react-native';
import { showConfirm } from '../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, layout } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import SocketService, { MatchFoundPayload } from '../services/socket';
import { getAuthToken } from '../services/api';
import { showAlert } from '../utils/alert';

const LUGGAGE_LABELS: Record<string, string> = {
    small: 'Küçük bagaj',
    medium: 'Orta bagaj',
    large: 'Büyük bagaj',
};

const TIPS = [
    'Eşleşme bulunduğunda bildirim alacaksınız.',
    'Ortalama bekleme süresi 2-3 dakika.',
    'Aynı yöne giden yolcular eşleştiriliyor.',
    'Profil puanınız eşleşme kalitesini artırır.',
];

export default function QueueScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { destination, time, luggage } = route.params || {};

    const [liveCount, setLiveCount] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    const timerRef = useRef<any>(null);
    const tipRef = useRef<any>(null);

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

    // Socket
    useEffect(() => {
        const startSearch = async () => {
            try {
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
                showAlert('Bağlantı Hatası', err.message || 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
                navigation.goBack();
            }
        };
        startSearch();
        return () => {
            SocketService.leaveQueue();
            SocketService.offMatchFound();
            SocketService.offQueueCount();
        };
    }, [navigation, destination, time, luggage]);

    const handleCancel = () => {
        showConfirm(
            'Aramayı İptal Et',
            'Eşleşme aramasını iptal etmek istiyor musunuz?',
            () => { SocketService.leaveQueue(); navigation.goBack(); },
            'İptal Et', 'Devam Et', true
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ── */}
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.closeBtn} activeOpacity={0.75} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.timerWrap}>
                        <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
                        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* ── CENTER CONTENT ── */}
            <View style={styles.center}>
                {/* Radar animation — clean concentric rings */}
                <View style={styles.radarCon}>
                    {[0, 1, 2].map(i => (
                        <MotiView
                            key={i}
                            from={{ opacity: 0.8, scale: 0.95 }}
                            animate={{ opacity: 0, scale: 2.6 }}
                            transition={{
                                type: 'timing', duration: 2800,
                                loop: true, delay: i * 700,
                                easing: Easing.out(Easing.cubic),
                            } as any}
                            style={styles.radarRing}
                        />
                    ))}
                    {/* Center circle */}
                    <View style={styles.radarCenter}>
                        <Ionicons name="airplane" size={30} color={colors.primary} />
                    </View>
                </View>

                {/* Headline */}
                <Text style={styles.headline}>Yolcu aranıyor</Text>
                <Text style={styles.subheadline}>
                    Sizin için en uygun yolcuyu buluyoruz
                </Text>

                {/* ── TRIP DETAILS CARD ── */}
                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Varış</Text>
                            <Text style={styles.detailValue}>
                                {destination ? destination.charAt(0).toUpperCase() + destination.slice(1) : '—'}
                            </Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Bagaj</Text>
                            <Text style={styles.detailValue}>{LUGGAGE_LABELS[luggage] || 'Orta bagaj'}</Text>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Sıradaki</Text>
                            <Text style={[styles.detailValue, { color: colors.success }]}>
                                {liveCount !== null ? `${liveCount} kişi` : '...'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tip */}
                <MotiView
                    key={tipIndex}
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 400 } as any}
                    style={styles.tipWrap}
                >
                    <Ionicons name="information-circle-outline" size={14} color={colors.textDisabled} style={{ marginTop: 1 }} />
                    <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
                </MotiView>
            </View>

            {/* ── CANCEL BUTTON ── */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.8}>
                    <Text style={styles.cancelText}>Aramayı İptal Et</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 12,
    },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border,
    },
    timerWrap: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: colors.surface, borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: colors.border,
    },
    timerText: {
        fontSize: 13, fontWeight: '700', color: colors.textSecondary,
        fontVariant: ['tabular-nums'] as any,
    },

    // Center
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

    // Radar
    radarCon: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
    radarRing: {
        position: 'absolute',
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 1.5, borderColor: colors.primary,
    },
    radarCenter: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.primaryMuted,
        borderWidth: 1.5, borderColor: colors.primaryBorder,
        justifyContent: 'center', alignItems: 'center',
    },

    // Text
    headline: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4, marginBottom: 8 },
    subheadline: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 },

    // Detail card
    detailCard: {
        width: '100%', backgroundColor: colors.surface,
        borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        overflow: 'hidden', marginBottom: 24,
    },
    detailRow: { flexDirection: 'row', paddingVertical: 18 },
    detailItem: { flex: 1, alignItems: 'center', gap: 4 },
    detailDivider: { width: 1, backgroundColor: colors.border },
    detailLabel: { fontSize: 11, fontWeight: '500', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    detailValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },

    // Tip
    tipWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 8 },
    tipText: { flex: 1, fontSize: 12, color: colors.textDisabled, textAlign: 'center', lineHeight: 17 },

    // Footer
    footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    cancelBtn: {
        borderRadius: 12, paddingVertical: 16,
        backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
        alignItems: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
