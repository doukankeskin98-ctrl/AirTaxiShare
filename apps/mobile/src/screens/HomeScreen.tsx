import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, StatusBar, Image, RefreshControl, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, layout } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { loadUserProfile, MatchAPI } from '../services/api';

// ─── Design Constants ─────────────────────────────────────────────────────────
const CARD_RADIUS = 14;
const SECTION_PADDING = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DESTINATION_META: Record<string, { label: string; color: string }> = {
    maslak: { label: 'Maslak', color: '#818CF8' },
    levent: { label: 'Levent', color: '#38BDF8' },
    atasehir: { label: 'Ataşehir', color: '#34D399' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    COMPLETED: { label: 'Tamamlandı', color: colors.success },
    ACTIVE: { label: 'Aktif', color: colors.warning },
    CANCELLED: { label: 'İptal', color: colors.error },
    PENDING: { label: 'Bekliyor', color: '#A78BFA' },
};

function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, photoUrl, size = 44, fontSize = 16 }: {
    name: string; photoUrl?: string; size?: number; fontSize?: number;
}) {
    const initials = getInitials(name);
    // Pick a consistent color from the name
    const hue = ((name || 'A').charCodeAt(0) * 37) % 360;
    const bg = `hsl(${hue}, 50%, 30%)`;
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
            {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={{ width: size, height: size }} />
            ) : (
                <Text style={{ fontSize, fontWeight: '700', color: '#FFF' }}>{initials}</Text>
            )}
        </View>
    );
}

// ─── RatingDots ───────────────────────────────────────────────────────────────
function RatingDots({ rating }: { rating: number }) {
    const full = Math.round(rating);
    return (
        <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={{
                    width: 6, height: 6, borderRadius: 3,
                    backgroundColor: i <= full ? colors.warning : 'rgba(255,255,255,0.15)',
                }} />
            ))}
        </View>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, onSeeAll }: { title: string; count?: number; onSeeAll?: () => void }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.2 }}>
                    {title}
                </Text>
                {count !== undefined && count > 0 && (
                    <View style={{ backgroundColor: colors.primaryMuted, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>{count}</Text>
                    </View>
                )}
            </View>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>Tümü</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── Match History Card ───────────────────────────────────────────────────────
function MatchCard({ match, index }: { match: any; index: number }) {
    const partner = match.otherUser || {};
    const statusCfg = STATUS_CONFIG[match.status] || STATUS_CONFIG.COMPLETED;
    const destCfg = DESTINATION_META[match.destination?.toLowerCase()] || { label: match.destination || '—', color: colors.primary };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 60, type: 'timing', duration: 250 } as any}
        >
            <TouchableOpacity style={styles.matchCard} activeOpacity={0.75}>
                {/* Left: Avatar */}
                <Avatar name={partner.fullName || 'Yolcu'} photoUrl={partner.photoUrl} size={46} fontSize={15} />

                {/* Middle: Info */}
                <View style={styles.matchCardMid}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Text style={styles.matchPartnerName} numberOfLines={1}>
                            {partner.fullName || 'Yolcu'}
                        </Text>
                        {(partner.emailVerified || partner.phoneVerified) && (
                            <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.destTag, { backgroundColor: `${destCfg.color}18` }]}>
                            <Ionicons name="location-sharp" size={10} color={destCfg.color} />
                            <Text style={[styles.destTagText, { color: destCfg.color }]}>{destCfg.label}</Text>
                        </View>
                        {partner.rating && (
                            <Text style={styles.matchMeta}>★ {Number(partner.rating).toFixed(1)}</Text>
                        )}
                    </View>
                </View>

                {/* Right: Date + Status */}
                <View style={styles.matchCardRight}>
                    <Text style={styles.matchDate}>{formatDate(match.matchedAt || new Date().toISOString())}</Text>
                    <View style={[styles.statusPill, { backgroundColor: `${statusCfg.color}18` }]}>
                        <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </MotiView>
    );
}

// ─── Empty History ────────────────────────────────────────────────────────────
function EmptyHistory({ onPress }: { onPress: () => void }) {
    return (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
                <Ionicons name="airplane-outline" size={32} color={colors.textDisabled} />
            </View>
            <Text style={styles.emptyTitle}>Henüz yolculuk yok</Text>
            <Text style={styles.emptySubtitle}>İlk eşleşmeni bul ve yolculuk paylaş</Text>
        </View>
    );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [matchHistory, setMatchHistory] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [profileRes, historyRes] = await Promise.all([
                loadUserProfile(),
                MatchAPI.getHistory().catch(() => ({ data: { matches: [] } })),
            ]);
            if (profileRes?.data) setUser(profileRes.data);
            if (historyRes?.data?.matches) setMatchHistory(historyRes.data.matches);
        } catch (e) {
            // Silent — show whatever we have
        }
    };

    useFocusEffect(useCallback(() => {
        loadData();
        registerForPushNotificationsAsync().catch(() => { });
    }, []));

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const displayName = user?.fullName || user?.email?.split('@')[0] || 'Hoş geldin';
    const firstName = displayName.split(' ')[0];
    const userRating = user?.rating ?? 5.0;
    const tripCount = user?.tripCount ?? matchHistory.length;
    const isVerified = user?.emailVerified || user?.phoneVerified;

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* ── FIXED HEADER ── */}
            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>{firstName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        style={styles.profileBtn}
                        activeOpacity={0.8}
                    >
                        <Avatar name={displayName} photoUrl={user?.photoUrl} size={40} fontSize={14} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* ── SCROLLABLE CONTENT ── */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* ── STATS ROW ── */}
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 50, duration: 300 } as any}
                    style={styles.statsRow}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>★ {userRating.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>Puanım</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{tripCount}</Text>
                        <Text style={styles.statLabel}>Yolculuk</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        {isVerified ? (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                                    <Text style={[styles.statValue, { color: colors.success }]}>Doğrulandı</Text>
                                </View>
                                <Text style={styles.statLabel}>Hesap</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.statValue, { color: colors.warning }]}>Doğrula</Text>
                                <Text style={styles.statLabel}>Hesap</Text>
                            </>
                        )}
                    </View>
                </MotiView>

                {/* ── PRIMARY ACTION: CREATE MATCH ── */}
                <MotiView
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 80, type: 'spring', damping: 20 } as any}
                    style={{ marginHorizontal: SECTION_PADDING, marginBottom: 12 }}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateMatch')}
                        activeOpacity={0.9}
                        style={styles.createMatchBtn}
                    >
                        <LinearGradient
                            colors={['#5B5EF4', '#4338CA']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.createMatchGrad}
                        >
                            <View style={styles.createMatchLeft}>
                                <View style={styles.createMatchIconBox}>
                                    <Ionicons name="airplane" size={20} color="#FFF" />
                                </View>
                                <View>
                                    <Text style={styles.createMatchTitle}>Eşleşme Bul</Text>
                                    <Text style={styles.createMatchSub}>Varış noktası seç, yolcu bul</Text>
                                </View>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
                        </LinearGradient>
                    </TouchableOpacity>
                </MotiView>

                {/* ── QUICK STATS: LIVE DESTINATIONS ── */}
                <MotiView
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 120, type: 'timing', duration: 250 } as any}
                    style={{ marginHorizontal: SECTION_PADDING, marginBottom: 28 }}
                >
                    <View style={styles.destGrid}>
                        {Object.entries(DESTINATION_META).map(([key, meta]) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => navigation.navigate('CreateMatch', { preselectedDest: key })}
                                activeOpacity={0.75}
                                style={styles.destCard}
                            >
                                <View style={[styles.destIconBox, { backgroundColor: `${meta.color}18` }]}>
                                    <Ionicons name="location-sharp" size={16} color={meta.color} />
                                </View>
                                <Text style={styles.destCardLabel}>{meta.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </MotiView>

                {/* ── MATCH HISTORY ── */}
                <View style={{ paddingHorizontal: SECTION_PADDING }}>
                    <SectionHeader
                        title="Geçmiş Yolculuklar"
                        count={matchHistory.length}
                    />
                    {matchHistory.length > 0 ? (
                        <View style={styles.matchList}>
                            {matchHistory.slice(0, 8).map((match, i) => (
                                <MatchCard key={match.id || i} match={match} index={i} />
                            ))}
                        </View>
                    ) : (
                        <EmptyHistory onPress={() => navigation.navigate('CreateMatch')} />
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },

    // Header
    headerSafeArea: { backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SECTION_PADDING, paddingTop: 8, paddingBottom: 16,
    },
    greeting: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 2 },
    userName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
    profileBtn: { borderRadius: 20, overflow: 'hidden' },

    // Scroll
    scrollContent: { paddingTop: 4 },

    // Stats row
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: SECTION_PADDING, marginBottom: 16,
        backgroundColor: colors.surface,
        borderRadius: CARD_RADIUS, paddingVertical: 14,
        borderWidth: 1, borderColor: colors.border,
    },
    statItem: { flex: 1, alignItems: 'center', gap: 3 },
    statValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    statLabel: { fontSize: 11, fontWeight: '500', color: colors.textTertiary },
    statDivider: { width: 1, height: 28, backgroundColor: colors.border },

    // Create match
    createMatchBtn: {
        borderRadius: CARD_RADIUS, overflow: 'hidden',
        shadowColor: '#5B5EF4', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },
    createMatchGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 16, paddingHorizontal: 18,
    },
    createMatchLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    createMatchIconBox: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    createMatchTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: -0.2 },
    createMatchSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

    // Destination grid
    destGrid: { flexDirection: 'row', gap: 10 },
    destCard: {
        flex: 1, backgroundColor: colors.surface,
        borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12,
        alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: colors.border,
    },
    destIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    destCardLabel: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },

    // Match list
    matchList: { gap: 2 },
    matchCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 13, paddingHorizontal: 0,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    matchCardMid: { flex: 1 },
    matchPartnerName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.1, flex: 1 },
    matchMeta: { fontSize: 12, color: colors.textTertiary },
    destTag: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
    },
    destTagText: { fontSize: 11, fontWeight: '600' },
    matchCardRight: { alignItems: 'flex-end', gap: 5 },
    matchDate: { fontSize: 12, color: colors.textTertiary },
    statusPill: {
        paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    },
    statusText: { fontSize: 11, fontWeight: '600' },

    // Empty state
    emptyWrap: {
        alignItems: 'center', paddingVertical: 36, gap: 8,
        backgroundColor: colors.surface, borderRadius: CARD_RADIUS,
        borderWidth: 1, borderColor: colors.border,
    },
    emptyIconWrap: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.surfaceElevated,
        justifyContent: 'center', alignItems: 'center', marginBottom: 4,
    },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    emptySubtitle: { fontSize: 13, color: colors.textTertiary, textAlign: 'center', paddingHorizontal: 24 },
});
