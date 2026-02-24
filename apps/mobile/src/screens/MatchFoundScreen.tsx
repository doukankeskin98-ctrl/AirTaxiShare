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

                {/* User Card */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300 } as any}
                >
                    <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                        <View style={styles.cardHighlight} />
                        <View style={styles.userRow}>
                            <View style={styles.avatarContainer}>
                                {safeOtherUser.photoUrl ? (
                                    <Image source={{ uri: safeOtherUser.photoUrl }} style={styles.avatarPhoto} />
                                ) : (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{safeOtherUser.name?.[0] || '?'}</Text>
                                    </View>
                                )}
                                <View style={styles.badge}>
                                    <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                                </View>
                            </View>

                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{safeOtherUser.name}</Text>
                                <View style={styles.ratingRow}>
                                    <View style={styles.starPill}>
                                        <Ionicons name="star" size={12} color="#FFF" />
                                        <Text style={styles.ratingText}>{safeOtherUser.rating}</Text>
                                    </View>
                                    <View style={styles.luggagePill}>
                                        <Ionicons name="briefcase" size={12} color="#FFF" />
                                        <Text style={styles.ratingText}>{luggage === 'small' ? 'KÜÇÜK' : luggage === 'large' ? 'BÜYÜK' : 'ORTA'}</Text>
                                    </View>
                                    <Text style={styles.tripsText}>{safeOtherUser.trips} yolculuk</Text>
                                </View>

                                {/* Trust badges row */}
                                <View style={styles.trustRow}>
                                    {safeOtherUser.phoneVerified && (
                                        <View style={styles.trustBadge}>
                                            <Ionicons name="call" size={10} color={colors.success} />
                                            <Text style={styles.trustBadgeText}>Telefon</Text>
                                        </View>
                                    )}
                                    {safeOtherUser.emailVerified && (
                                        <View style={styles.trustBadge}>
                                            <Ionicons name="mail" size={10} color={colors.secondary} />
                                            <Text style={styles.trustBadgeText}>E-posta</Text>
                                        </View>
                                    )}
                                    {safeOtherUser.trustBadge && (
                                        <View style={[styles.trustBadge, styles.trustBadgeGold]}>
                                            <Ionicons name="shield-checkmark" size={10} color="#F59E0B" />
                                            <Text style={[styles.trustBadgeText, { color: '#F59E0B' }]}>ATS Güven</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Chat button with unread badge */}
                            <TouchableOpacity style={styles.chatBtn} onPress={handleOpenChat} activeOpacity={0.8}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="#FFF" />
                                {unreadCount > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
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
    glassCard: { marginBottom: spacing.xl, padding: spacing.l, borderRadius: 24, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(25, 28, 43, 0.3)' },
    cardHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
    userRow: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { position: 'relative', marginRight: spacing.l },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(79, 70, 229, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    avatarPhoto: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    avatarText: { ...typography.h1, color: '#FFF' },
    badge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: colors.success, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15142E' },
    userInfo: { flex: 1 },
    userName: { ...typography.h3, color: colors.textPrimary, marginBottom: 8, fontWeight: '700' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
    starPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
    luggagePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(79, 70, 229, 0.2)', borderWidth: 1, borderColor: 'rgba(79, 70, 229, 0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
    ratingText: { ...typography.caption, color: '#FFF', fontWeight: '700', fontSize: 12 },
    tripsText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
    chatBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(79, 70, 229, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79, 70, 229, 0.5)', position: 'relative' },
    unreadBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#15142E', paddingHorizontal: 3 },
    unreadText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
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
