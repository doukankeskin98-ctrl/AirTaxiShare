import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { showConfirm } from '../utils/alert';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';
import SocketService from '../services/socket';
import { useChatContext } from '../context/ChatContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_MATCH_KEY = '@active_match';

export default function MatchFoundScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { otherUser, luggage, matchId } = route.params || {};
    const safeOtherUser = otherUser || { name: 'Yolcu', rating: 5.0, trips: 10, trustBadge: false, phoneVerified: false, emailVerified: false };

    const { getUnread } = useChatContext();
    const unreadCount = getUnread(matchId);

    const [meetingPoint, setMeetingPoint] = React.useState('exitA');
    const [partnerMeetingPoint, setPartnerMeetingPoint] = React.useState<string | null>(null);

    // Persist active match so app can restore on restart
    useEffect(() => {
        if (matchId) {
            AsyncStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify({ matchId, otherUser, luggage }))
                .catch(() => { });
        }
        return () => {
            // Clear active match when leaving this screen intentionally
            AsyncStorage.removeItem(ACTIVE_MATCH_KEY).catch(() => { });
        };
    }, [matchId]);

    // Handle partner disconnecting/leaving
    useEffect(() => {
        SocketService.onMatchEnded((payload) => {
            const reason = payload?.reason;
            const msg = reason === 'partner_left'
                ? `${safeOtherUser.name.split(' ')[0]} uygulamayı kapattı veya eşleşmeyi iptal etti.`
                : 'Eşleşme sona erdi.';

            showConfirm(
                'Eşleşme Sona Erdi',
                msg,
                () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
                'Ana Sayfaya Dön',
                undefined,   // no cancel option — they must go home
                false,
            );
        });

        return () => SocketService.offMatchEnded();
    }, [safeOtherUser.name, navigation]);

    const meetupCode = React.useMemo(() => {
        if (!matchId || matchId === 'mock-id') return '8492';
        let hash = 0;
        for (let i = 0; i < matchId.length; i++) hash = (hash << 5) - hash + matchId.charCodeAt(i);
        return Math.abs(hash).toString().substring(0, 4).padEnd(4, '0');
    }, [matchId]);

    const meetingPoints = [
        { label: 'Çıkış A — Metro', value: 'exitA', icon: 'subway', description: 'Metro çıkışı, kuzey girişi' },
        { label: 'Çıkış B — Meydan', value: 'exitB', icon: 'walk', description: 'Taksi durağı yanı, güney' },
        { label: 'Taksi Sırası', value: 'taxiQueue', icon: 'car', description: 'Terminal taksici bölgesi' },
    ];

    // Listen for partner's meeting point selection
    useEffect(() => {
        SocketService.onPartnerMeetingPoint((point) => {
            setPartnerMeetingPoint(point);
        });

        return () => {
            SocketService.offPartnerMeetingPoint();
        };
    }, []);

    const handleSelectMeetingPoint = (point: string) => {
        setMeetingPoint(point);
        // Sync to partner in real-time
        if (matchId && matchId !== 'mock-id') {
            SocketService.selectMeetingPoint(matchId, point);
        }
    };

    const handleOpenChat = () => {
        navigation.navigate('Chat', { otherUser, matchId });
    };

    const handleMet = () => {
        navigation.replace('MeetupConfirm', { matchId, otherUser: safeOtherUser });
    };

    return (
        <View style={styles.container}>
            {/* Dark Aurora Background */}
            <LinearGradient
                colors={['#0B0D17', '#1E1436', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Animated Orbs */}
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1.2 }}
                transition={{ type: 'timing', duration: 4000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -50, right: -100, backgroundColor: colors.success }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1.1 }}
                transition={{ type: 'timing', duration: 5000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { bottom: 100, left: -150, backgroundColor: colors.primary }]}
            />

            {/* Header with Cancel Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        showConfirm(
                            'Eşleşmeyi İptal Et',
                            'Eşleşmeyi iptal etmek istediğinize emin misiniz? Diğer yolcuya bildirilecek.',
                            () => {
                                if (matchId && matchId !== 'mock-id') {
                                    SocketService.endMatch(matchId);
                                }
                                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                            },
                            'İptal Et',
                            'Vazgeç',
                            true,
                        );
                    }}
                >
                    <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </BlurView>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Success Animation Header */}
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 15 } as any}
                    style={styles.successHeader}
                >
                    <View style={styles.successIconWrapper}>
                        <LinearGradient
                            colors={[colors.success, '#059669']}
                            style={styles.successIcon}
                        >
                            <Ionicons name="checkmark" size={44} color="#FFF" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.successTitle}>Eşleşme Bulundu!</Text>
                    <Text style={styles.successSubtitle}>
                        Yolculuğunuzu {safeOtherUser.name.split(' ')[0] || 'birisi'} ile paylaşıyorsunuz.
                    </Text>
                </MotiView>

                {/* ── PARTNER HERO CARD ── */}
                <MotiView
                    from={{ opacity: 0, translateY: 24, scale: 0.96 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ delay: 280, type: 'spring', damping: 16 } as any}
                >
                    <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                        <View style={styles.cardHighlight} />

                        {/* Header row: avatar + name + chat button */}
                        <View style={styles.userRow}>
                            {/* Large avatar with gradient ring */}
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarRingOuter}>
                                    <LinearGradient
                                        colors={['#7C3AED', '#06B6D4', '#10B981']}
                                        style={styles.avatarRingGrad}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        {safeOtherUser.photoUrl ? (
                                            <Image source={{ uri: safeOtherUser.photoUrl }} style={styles.avatarPhoto} />
                                        ) : (
                                            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.avatarFallback}>
                                                <Text style={styles.avatarText}>
                                                    {(safeOtherUser.name || 'Y').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                                                </Text>
                                            </LinearGradient>
                                        )}
                                    </LinearGradient>
                                </View>
                                {/* Verified badge */}
                                {(safeOtherUser.emailVerified || safeOtherUser.phoneVerified) && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                                    </View>
                                )}
                            </View>

                            {/* Name and quick info */}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{safeOtherUser.name}</Text>

                                {/* Star row */}
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Ionicons
                                            key={i}
                                            name={i <= Math.floor(safeOtherUser.rating ?? 5) ? 'star' : 'star-outline'}
                                            size={13}
                                            color="#FBBF24"
                                        />
                                    ))}
                                    <Text style={styles.starsLabel}>{(safeOtherUser.rating ?? 5.0).toFixed(1)}</Text>
                                </View>

                                {/* Luggage pill */}
                                <View style={styles.luggagePill}>
                                    <Ionicons name="briefcase" size={11} color={colors.primary} />
                                    <Text style={styles.luggageText}>
                                        {luggage === 'small' ? 'Küçük Bagaj' : luggage === 'large' ? 'Büyük Bagaj' : 'Orta Bagaj'}
                                    </Text>
                                </View>
                            </View>

                            {/* Chat button */}
                            <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat} activeOpacity={0.8}>
                                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.chatBtnGrad}>
                                    <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
                                </LinearGradient>
                                {unreadCount > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Stats row */}
                        <View style={styles.statsGrid}>
                            {[
                                { label: 'Puan', value: (safeOtherUser.rating ?? 5.0).toFixed(1), icon: 'star', color: '#FBBF24' },
                                { label: 'Yolculuk', value: String(safeOtherUser.trips ?? 0), icon: 'car', color: '#06B6D4' },
                                { label: 'Durum', value: 'Aktif', icon: 'radio-button-on', color: '#10B981' },
                            ].map((s, i) => (
                                <View key={i} style={styles.statItem}>
                                    <View style={[styles.statIconBox, { backgroundColor: `${s.color}18` }]}>
                                        <Ionicons name={s.icon as any} size={14} color={s.color} />
                                    </View>
                                    <Text style={styles.statValue}>{s.value}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Trust badges */}
                        <View style={styles.trustRow}>
                            {safeOtherUser.emailVerified && (
                                <View style={styles.trustBadge}>
                                    <Ionicons name="mail" size={10} color="#06B6D4" />
                                    <Text style={[styles.trustBadgeText, { color: '#06B6D4' }]}>E-posta</Text>
                                </View>
                            )}
                            {safeOtherUser.phoneVerified && (
                                <View style={styles.trustBadge}>
                                    <Ionicons name="call" size={10} color={colors.success} />
                                    <Text style={styles.trustBadgeText}>Telefon</Text>
                                </View>
                            )}
                            {safeOtherUser.trustBadge && (
                                <View style={[styles.trustBadge, styles.trustBadgeGold]}>
                                    <Ionicons name="shield-checkmark" size={10} color="#F59E0B" />
                                    <Text style={[styles.trustBadgeText, { color: '#F59E0B' }]}>ATS Güven</Text>
                                </View>
                            )}
                            {!safeOtherUser.emailVerified && !safeOtherUser.phoneVerified && !safeOtherUser.trustBadge && (
                                <View style={[styles.trustBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Ionicons name="person" size={10} color="rgba(255,255,255,0.4)" />
                                    <Text style={[styles.trustBadgeText, { color: 'rgba(255,255,255,0.4)' }]}>Standart Üye</Text>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </MotiView>

                {/* Meeting Point Selection — real-time synced */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 500 } as any}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Buluşma Noktası</Text>
                        {partnerMeetingPoint && partnerMeetingPoint !== meetingPoint && (
                            <View style={styles.partnerBadge}>
                                <Ionicons name="person" size={11} color={colors.primary} />
                                <Text style={styles.partnerBadgeText}>
                                    Yolcu: {meetingPoints.find(p => p.value === partnerMeetingPoint)?.label?.split('—')[0].trim() || partnerMeetingPoint}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.meetingPointsContainer}>
                        {meetingPoints.map((point) => {
                            const isSelected = meetingPoint === point.value;
                            const partnerSelected = partnerMeetingPoint === point.value;
                            return (
                                <TouchableOpacity
                                    key={point.value}
                                    onPress={() => handleSelectMeetingPoint(point.value)}
                                    activeOpacity={0.8}
                                >
                                    <BlurView
                                        intensity={isSelected ? 40 : 20}
                                        tint={isSelected ? 'light' : 'dark'}
                                        style={[
                                            styles.meetingPointCard,
                                            isSelected && styles.meetingPointCardSelected,
                                            partnerSelected && !isSelected && styles.meetingPointCardPartner,
                                        ]}
                                    >
                                        {isSelected && <View style={styles.meetingHighlight} />}
                                        <View style={styles.meetingPointRow}>
                                            <View style={[styles.iconBox, isSelected && { backgroundColor: colors.primary }]}>
                                                <Ionicons
                                                    name={point.icon as any}
                                                    size={20}
                                                    color={isSelected ? '#FFF' : colors.textSecondary}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.meetingPointLabel, isSelected && styles.meetingPointLabelSelected]}>
                                                    {point.label}
                                                </Text>
                                                <Text style={styles.meetingPointDescription}>{point.description}</Text>
                                            </View>
                                            {isSelected && <Ionicons name="checkmark-circle" size={26} color={colors.primary} />}
                                            {partnerSelected && !isSelected && (
                                                <View style={styles.partnerIndicator}>
                                                    <Ionicons name="person" size={12} color={colors.primary} />
                                                </View>
                                            )}
                                        </View>
                                    </BlurView>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {partnerMeetingPoint && partnerMeetingPoint !== meetingPoint && (
                        <MotiView
                            from={{ opacity: 0, translateY: -4 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            style={styles.warningBox}
                        >
                            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                            <Text style={styles.warningText}>
                                Yol arkadaşınızla farklı noktayı işaretlediniz. Aynı noktayı seçmeniz önerilir.
                            </Text>
                        </MotiView>
                    )}
                </MotiView>

                {/* Match Code */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 700 } as any}
                >
                    <BlurView intensity={30} tint="dark" style={styles.codeCard}>
                        <View style={styles.cardHighlight} />
                        <Text style={styles.codeLabel}>ONAY KODU</Text>
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>{meetupCode}</Text>
                        </View>
                        <Text style={styles.codeHint}>Bu kodu yol arkadaşınıza gösterin</Text>
                    </BlurView>
                </MotiView>

                <View style={{ height: 140 }} />
            </ScrollView>

            <MotiView
                style={styles.footer}
                from={{ translateY: 150 }}
                animate={{ translateY: 0 }}
                transition={{ delay: 900, type: 'spring' } as any}
            >
                <BlurView intensity={60} tint="dark" style={styles.footerBlur}>
                    <PremiumButton
                        title="Buluştuk"
                        onPress={handleMet}
                        variant="primary"
                        icon={<Ionicons name="people" size={24} color="#FFF" />}
                        style={{ width: '100%' }}
                    />
                </BlurView>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    orb: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
        ...(Platform.OS === 'web' ? { filter: 'blur(90px)' } as any : {}),
    },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.m, paddingTop: 60, zIndex: 10 },
    backButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    backBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)' },
    content: { padding: spacing.xl, paddingTop: 20 },
    successHeader: { alignItems: 'center', marginBottom: spacing.xxl },
    successIconWrapper: { padding: 8, borderRadius: 60, backgroundColor: 'rgba(16, 185, 129, 0.2)', marginBottom: spacing.l },
    successIcon: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', shadowColor: colors.success, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 15, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.4)' },
    successTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.s, fontWeight: '800', fontSize: 34 },
    successSubtitle: { ...typography.body, color: colors.textSecondary, fontSize: 16 },
    glassCard: { marginBottom: spacing.xl, padding: spacing.l, borderRadius: 28, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(25, 28, 43, 0.3)' },
    cardHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
    userRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    avatarContainer: { position: 'relative' },

    // New premium avatar styles
    avatarRingOuter: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden' },
    avatarRingGrad: { width: 80, height: 80, borderRadius: 40, padding: 2.5, justifyContent: 'center', alignItems: 'center' },
    avatarPhoto: { width: 75, height: 75, borderRadius: 37.5 },
    avatarFallback: { width: 75, height: 75, borderRadius: 37.5, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 26, fontWeight: '800', color: '#FFF' },
    verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.success, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15142E' },

    // Stars
    starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 6 },
    starsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4 },

    // Luggage
    luggagePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(79,70,229,0.15)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.35)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, alignSelf: 'flex-start' },
    luggageText: { fontSize: 11, color: colors.primary, fontWeight: '600' },

    // Chat button
    chatBtn: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', position: 'relative', marginLeft: 'auto' },
    chatBtnGrad: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
    unreadBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15142E', paddingHorizontal: 3 },
    unreadText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

    // Stats grid
    statsGrid: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.l, marginBottom: spacing.m },
    statItem: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, paddingVertical: spacing.m, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.06)' },
    statIconBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '800', color: '#FFF' },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

    userInfo: { flex: 1 },
    userName: { ...typography.h3, color: colors.textPrimary, marginBottom: 6, fontWeight: '700', fontSize: 17 },
    trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
    trustBadgeGold: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' },
    trustBadgeText: { fontSize: 10, fontWeight: '600', color: colors.success },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.l, marginLeft: spacing.xs },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: '700' },
    partnerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(79,70,229,0.15)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    partnerBadgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
    meetingPointsContainer: { gap: spacing.m, marginBottom: spacing.l },
    meetingPointCard: { padding: spacing.l, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    meetingPointCardSelected: { borderColor: colors.primary, backgroundColor: 'rgba(79, 70, 229, 0.15)' },
    meetingPointCardPartner: { borderColor: 'rgba(79,70,229,0.3)', backgroundColor: 'rgba(79,70,229,0.05)' },
    meetingHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
    meetingPointRow: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
    meetingPointLabel: { ...typography.body, color: colors.textPrimary, flex: 1, fontSize: 16, fontWeight: '600' },
    meetingPointLabelSelected: { fontWeight: '700', color: '#FFF' },
    meetingPointDescription: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    partnerIndicator: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(79,70,229,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,70,229,0.4)' },
    warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: spacing.m, marginBottom: spacing.l },
    warningText: { flex: 1, fontSize: 13, color: '#F59E0B', lineHeight: 18 },
    codeCard: { alignItems: 'center', backgroundColor: 'rgba(25, 28, 43, 0.4)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: StyleSheet.hairlineWidth, borderRadius: 24, padding: spacing.xl, overflow: 'hidden' },
    codeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.l, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '700' },
    codeBox: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: spacing.xxl, paddingVertical: spacing.m, borderRadius: 20, marginBottom: spacing.l, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    codeText: { fontSize: 40, fontWeight: '900', color: colors.primaryLight, letterSpacing: 10 },
    codeHint: { ...typography.caption, color: colors.textSecondary, fontSize: 14 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    footerBlur: { padding: spacing.xl, paddingBottom: 40, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' },
});
