import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { loadUserProfile, MatchAPI } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const DESTINATION_META: Record<string, { label: string; icon: any; color: string }> = {
    maslak: { label: 'Maslak', icon: 'business', color: '#6366F1' },
    levent: { label: 'Levent', icon: 'city', color: '#0EA5E9' },
    atasehir: { label: 'Ataşehir', icon: 'map', color: '#10B981' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    COMPLETED: { label: 'Tamamlandı', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: 'checkmark-circle' },
    ACTIVE: { label: 'Aktif', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: 'radio-button-on' },
    CANCELLED: { label: 'İptal', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: 'close-circle' },
    PENDING: { label: 'Bekliyor', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: 'time' },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

function StarRow({ rating }: { rating: number }) {
    const full = Math.floor(rating);
    const partial = rating % 1 >= 0.5;
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Ionicons
                    key={i}
                    name={i <= full ? 'star' : (i === full + 1 && partial ? 'star-half' : 'star-outline')}
                    size={11}
                    color="#FBBF24"
                />
            ))}
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 4 }}>{rating.toFixed(1)}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MatchCard — premium rich card
// ─────────────────────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: any; index: number }) {
    const partner = match.otherUser || {};
    const statusMeta = STATUS_META[match.status] || STATUS_META.COMPLETED;
    const destMeta = DESTINATION_META[match.destination?.toLowerCase()] || {
        label: match.destination || '—',
        icon: 'location',
        color: '#6366F1',
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 + index * 80, type: 'spring', damping: 18 } as any}
        >
            <TouchableOpacity activeOpacity={0.92} style={styles.matchCardTouch}>
                <BlurView intensity={25} tint="dark" style={styles.matchCard}>
                    {/* Top shimmer line */}
                    <View style={styles.cardShimmer} />

                    {/* Header row: avatar + name/rating + status pill */}
                    <View style={styles.cardHeader}>
                        {/* Avatar */}
                        <View style={styles.avatarRing}>
                            <LinearGradient
                                colors={['#7C3AED', '#06B6D4']}
                                style={styles.avatarGradientRing}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {partner.photoUrl ? (
                                    <Image source={{ uri: partner.photoUrl }} style={styles.avatarImg} />
                                ) : (
                                    <LinearGradient
                                        colors={['#4F46E5', '#7C3AED']}
                                        style={styles.avatarInitials}
                                    >
                                        <Text style={styles.avatarInitialsText}>{getInitials(partner.fullName || 'Yolcu')}</Text>
                                    </LinearGradient>
                                )}
                            </LinearGradient>
                        </View>

                        {/* Name + rating */}
                        <View style={styles.cardUserInfo}>
                            <View style={styles.cardNameRow}>
                                <Text style={styles.cardPartnerName} numberOfLines={1}>
                                    {partner.fullName || 'Yolcu'}
                                </Text>
                                {partner.emailVerified && (
                                    <Ionicons name="shield-checkmark" size={14} color="#06B6D4" style={{ marginLeft: 4 }} />
                                )}
                            </View>
                            <StarRow rating={partner.rating ?? 5.0} />
                            <Text style={styles.cardTrips}>
                                {partner.tripsCompleted ?? 0} yolculuk
                            </Text>
                        </View>

                        {/* Status pill */}
                        <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                            <Ionicons name={statusMeta.icon} size={10} color={statusMeta.color} />
                            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.cardDivider} />

                    {/* Footer row: destination + date */}
                    <View style={styles.cardFooter}>
                        {/* Destination */}
                        <View style={styles.cardDestRow}>
                            <View style={[styles.cardDestIcon, { backgroundColor: `${destMeta.color}20` }]}>
                                <Ionicons name={destMeta.icon} size={14} color={destMeta.color} />
                            </View>
                            <View>
                                <Text style={styles.cardDestLabel}>Varış Noktası</Text>
                                <Text style={styles.cardDestName}>{destMeta.label}</Text>
                            </View>
                        </View>

                        {/* Date */}
                        <View style={styles.cardDateCol}>
                            <Text style={styles.cardDateLabel}>Tarih</Text>
                            <Text style={styles.cardDateValue}>
                                {match.matchedAt ? formatDate(match.matchedAt) : '—'}
                            </Text>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </MotiView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState — beautiful animated card
// ─────────────────────────────────────────────────────────────────────────────

function EmptyHistory({ onPress }: { onPress: () => void }) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 200 } as any}
        >
            <BlurView intensity={20} tint="dark" style={styles.emptyCard}>
                <View style={styles.emptyCardShimmer} />
                <MotiView
                    from={{ translateY: 0 }}
                    animate={{ translateY: -8 }}
                    transition={{ type: 'timing', duration: 2000, loop: true, repeatReverse: true } as any}
                    style={styles.emptyIconWrap}
                >
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        style={styles.emptyIconGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="airplane" size={40} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />
                    </LinearGradient>
                </MotiView>
                <Text style={styles.emptyTitle}>Henüz yolculuğun yok</Text>
                <Text style={styles.emptySubtitle}>
                    İlk eşleşmeni yap ve birlikte seyahat et.{'\n'}Tüm geçmişin burada görünecek.
                </Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={onPress} activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        style={styles.emptyBtnGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="add" size={18} color="#FFF" />
                        <Text style={styles.emptyBtnText}>İlk Eşleşmeni Bul</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </MotiView>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [user, setUser] = useState<any>({ fullName: '', photoUrl: null });
    const [matchHistory, setMatchHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const profile = await loadUserProfile();
                if (profile) setUser(profile);

                setLoadingHistory(true);
                try {
                    const response = await MatchAPI.getHistory();
                    setMatchHistory(response.data || []);
                } catch {
                    // Silently fail — history is not critical
                } finally {
                    setLoadingHistory(false);
                }
            };
            loadData();
        }, [])
    );

    const displayName = user.fullName || 'Yolcu';
    const firstName = displayName.split(' ')[0];

    const handleCreateMatch = () => navigation.navigate('CreateMatch');

    const timeGreeting = () => {
        const h = new Date().getHours();
        if (h < 6) return 'İyi Geceler';
        if (h < 12) return 'Günaydın';
        if (h < 18) return 'İyi Günler';
        return 'İyi Akşamlar';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Aurora */}
            <LinearGradient
                colors={['#12103A', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.55, scale: 1 }}
                transition={{ type: 'timing', duration: 2200, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -80, right: -120, backgroundColor: colors.primary }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.35, scale: 1.2 }}
                transition={{ type: 'timing', duration: 3200, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: 260, left: -160, backgroundColor: colors.secondary }]}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={{ flex: 1, paddingRight: spacing.m }}>
                        <MotiText
                            from={{ opacity: 0, translateY: -10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 60 } as any}
                            style={styles.greeting}
                        >
                            {timeGreeting()},{'\n'}{firstName} 👋
                        </MotiText>
                        <MotiText
                            from={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ delay: 160 } as any}
                            style={styles.subGreeting}
                        >
                            {t('app.tagline')}
                        </MotiText>
                    </View>

                    {/* Profile avatar */}
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
                        <View style={styles.profileRing}>
                            {user.photoUrl ? (
                                <Image source={{ uri: user.photoUrl }} style={styles.profilePhoto} />
                            ) : (
                                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.profileGrad}>
                                    <Text style={styles.profileInitial}>{firstName[0]?.toUpperCase() || '?'}</Text>
                                </LinearGradient>
                            )}
                            {/* Online indicator */}
                            <View style={styles.onlineDot} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── SECURITY PILL ── */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 80 } as any}
                        style={styles.pillWrapper}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.securityPill}>
                            <View style={styles.pillDot} />
                            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                            <Text style={styles.pillText}>Yolculuklar 7/24 Güvende</Text>
                        </BlurView>
                    </MotiView>

                    {/* ── HERO CARD ── */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        transition={{ delay: 160, type: 'spring' } as any}
                        style={styles.heroWrapper}
                    >
                        <TouchableOpacity activeOpacity={0.92} onPress={handleCreateMatch} style={styles.heroTouch}>
                            <LinearGradient
                                colors={['#4F46E5', '#7C3AED', '#06B6D4']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroGradient}
                            >
                                {/* Ghost icon */}
                                <Ionicons
                                    name="airplane"
                                    size={200}
                                    color="rgba(255,255,255,0.06)"
                                    style={styles.heroGhostIcon}
                                />
                                {/* Top shimmer */}
                                <View style={styles.heroShimmer} />

                                <View style={styles.heroContent}>
                                    <View style={styles.heroIconBox}>
                                        <Ionicons name="search" size={28} color="#4F46E5" />
                                    </View>
                                    <Text style={styles.heroTitle}>{t('home.createMatch')}</Text>
                                    <Text style={styles.heroSubtitle}>
                                        Aynı yöne gidenlerle masrafı paylaş
                                    </Text>
                                    <View style={styles.heroArrow}>
                                        <Text style={styles.heroArrowText}>Başla</Text>
                                        <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </MotiView>

                    {/* ── STATS ROW ── */}
                    <MotiView
                        from={{ opacity: 0, translateY: 16 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 240, type: 'spring' } as any}
                        style={styles.statsRow}
                    >
                        {[
                            { icon: 'star', color: '#FBBF24', label: 'Puanın', value: (user.rating ?? 5.0).toFixed(1) },
                            { icon: 'car', color: '#06B6D4', label: 'Yolculuk', value: String(user.tripsCompleted ?? 0) },
                            { icon: 'shield-checkmark', color: '#10B981', label: 'Güven', value: user.emailVerified ? 'Doğrulandı' : 'Bekliyor' },
                        ].map((s, i) => (
                            <BlurView key={i} intensity={20} tint="dark" style={styles.statCard}>
                                <View style={styles.statShimmer} />
                                <View style={[styles.statIconBox, { backgroundColor: `${s.color}1A` }]}>
                                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                                </View>
                                <Text style={styles.statValue}>{s.value}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </BlurView>
                        ))}
                    </MotiView>

                    {/* ── MATCH HISTORY ── */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 320 } as any}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
                            {matchHistory.length > 0 && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countBadgeText}>{matchHistory.length}</Text>
                                </View>
                            )}
                        </View>

                        {matchHistory.length > 0 ? (
                            <View style={styles.historyList}>
                                {matchHistory.slice(0, 8).map((match, i) => (
                                    <MatchCard key={match.id ?? i} match={match} index={i} />
                                ))}
                            </View>
                        ) : (
                            <EmptyHistory onPress={handleCreateMatch} />
                        )}
                    </MotiView>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    orb: {
        position: 'absolute', width: 340, height: 340, borderRadius: 170,
        opacity: 0.4, transform: [{ scale: 2 }],
        ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}),
    },
    safeArea: { flex: 1 },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: spacing.l, paddingTop: spacing.m, paddingBottom: spacing.l, zIndex: 10,
    },
    greeting: {
        fontSize: 30, fontWeight: '800', color: '#FFF',
        lineHeight: 38, letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 18,
    },
    profileRing: {
        width: 54, height: 54, borderRadius: 27,
        borderWidth: 2, borderColor: 'rgba(99,102,241,0.6)',
        overflow: 'visible',
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    profilePhoto: { width: 50, height: 50, borderRadius: 25 },
    profileGrad: {
        width: 50, height: 50, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
    },
    profileInitial: { color: '#FFF', fontSize: 20, fontWeight: '700' },
    onlineDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#10B981', borderWidth: 2, borderColor: '#0D0F1E',
    },

    content: { paddingHorizontal: spacing.l, paddingBottom: 120 },

    // Security pill
    pillWrapper: { marginBottom: spacing.l, borderRadius: 100, overflow: 'hidden', alignSelf: 'flex-start' },
    securityPill: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 8, paddingHorizontal: 14,
        backgroundColor: 'rgba(16,185,129,0.06)',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(16,185,129,0.25)',
    },
    pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
    pillText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

    // Hero card
    heroWrapper: {
        height: 230, marginBottom: spacing.l,
        borderRadius: 32, overflow: 'hidden',
        shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.5, shadowRadius: 24, elevation: 12,
    },
    heroTouch: { flex: 1 },
    heroGradient: { flex: 1, padding: spacing.xl, justifyContent: 'flex-end' },
    heroGhostIcon: { position: 'absolute', top: -30, right: -40, transform: [{ rotate: '-15deg' }] },
    heroShimmer: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroContent: {},
    heroIconBox: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing.m,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    },
    heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5, lineHeight: 32 },
    heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    heroArrow: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginTop: spacing.m,
    },
    heroArrowText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

    // Stats row
    statsRow: {
        flexDirection: 'row', gap: spacing.m, marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1, borderRadius: 20, overflow: 'hidden',
        padding: spacing.m, alignItems: 'center',
        backgroundColor: 'rgba(20,22,42,0.5)',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)',
        minHeight: 100, justifyContent: 'center',
    },
    statShimmer: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    statIconBox: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    statValue: { fontSize: 15, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, textAlign: 'center' },

    // Section header
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.s,
        marginBottom: spacing.m,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
    countBadge: {
        backgroundColor: 'rgba(99,102,241,0.25)',
        borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8,
        borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
    },
    countBadgeText: { fontSize: 12, fontWeight: '700', color: '#A5B4FC' },

    // History list
    historyList: { gap: spacing.m },

    // Match card
    matchCardTouch: {
        borderRadius: 28, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22, shadowRadius: 14, elevation: 6,
    },
    matchCard: {
        padding: spacing.l,
        backgroundColor: 'rgba(16,18,38,0.6)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 28,
        overflow: 'hidden',
    },
    cardShimmer: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

    // Avatar
    avatarRing: {
        width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
    },
    avatarGradientRing: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', padding: 2,
    },
    avatarImg: { width: 52, height: 52, borderRadius: 26 },
    avatarInitials: {
        width: 52, height: 52, borderRadius: 26,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitialsText: { fontSize: 20, fontWeight: '800', color: '#FFF' },

    // User info
    cardUserInfo: { flex: 1 },
    cardNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    cardPartnerName: { fontSize: 15, fontWeight: '700', color: '#FFF', flexShrink: 1 },
    cardTrips: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 },

    // Status
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: 4, paddingHorizontal: 8,
        borderRadius: 100, alignSelf: 'flex-start',
    },
    statusText: { fontSize: 11, fontWeight: '600' },

    // Divider
    cardDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.07)',
        marginVertical: spacing.m,
    },

    // Footer
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardDestRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    cardDestIcon: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: 'center', alignItems: 'center',
    },
    cardDestLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
    cardDestName: { fontSize: 14, fontWeight: '700', color: '#FFF' },
    cardDateCol: { alignItems: 'flex-end' },
    cardDateLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
    cardDateValue: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

    // Empty state
    emptyCard: {
        borderRadius: 32, overflow: 'hidden', padding: spacing.xxl,
        alignItems: 'center',
        backgroundColor: 'rgba(16,18,38,0.55)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    emptyCardShimmer: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    emptyIconWrap: { marginBottom: spacing.xl },
    emptyIconGrad: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6, shadowRadius: 20, elevation: 10,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: -0.4, marginBottom: spacing.s },
    emptySubtitle: {
        fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center',
        lineHeight: 20, marginBottom: spacing.xl,
    },
    emptyBtn: {
        borderRadius: 100, overflow: 'hidden',
        shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    emptyBtnGrad: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 14, paddingHorizontal: 28,
    },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
