import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform } from 'react-native';
import { showConfirm } from '../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native-reanimated';
import SocketService from '../services/socket';

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Status views ─────────────────────────────────────────────────────────────

function SuccessView({ partnerName }: { partnerName: string }) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120 } as any}
            style={sucStyles.wrap}
        >
            {/* Outer pulse rings */}
            {[0, 1].map(i => (
                <MotiView
                    key={i}
                    from={{ opacity: 0.6, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 2.4 }}
                    transition={{ type: 'timing', duration: 1800, loop: true, delay: i * 600, easing: Easing.out(Easing.ease) } as any}
                    style={sucStyles.ring}
                />
            ))}
            <LinearGradient colors={['#10B981', '#059669']} style={sucStyles.circle}>
                <Ionicons name="checkmark" size={60} color="#FFF" />
            </LinearGradient>
        </MotiView>
    );
}

const sucStyles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', width: 140, height: 140 },
    ring: {
        position: 'absolute', width: 140, height: 140, borderRadius: 70,
        borderWidth: 2, borderColor: '#10B981',
    },
    circle: {
        width: 140, height: 140, borderRadius: 70,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6, shadowRadius: 24, elevation: 12,
    },
});

function WaitingView() {
    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={waitStyles.wrap}
        >
            {/* Concentric rings */}
            {[0, 1, 2].map(i => (
                <MotiView
                    key={i}
                    from={{ opacity: 0.5, scale: 0.85 }}
                    animate={{ opacity: 0, scale: 2.8 }}
                    transition={{ type: 'timing', duration: 2200, loop: true, delay: i * 500, easing: Easing.out(Easing.ease) } as any}
                    style={[waitStyles.ring, { borderColor: colors.primary }]}
                />
            ))}
            <LinearGradient
                colors={['rgba(79,70,229,0.3)', 'rgba(79,70,229,0.1)']}
                style={waitStyles.center}
            >
                <View style={waitStyles.centerShimmer} />
                <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{ type: 'timing', duration: 2000, loop: true, easing: Easing.linear } as any}
                    style={waitStyles.spinner}
                >
                    <LinearGradient
                        colors={[colors.primary, `${colors.primary}00`]}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                        style={waitStyles.spinnerLine}
                    />
                </MotiView>
                <Ionicons name="hourglass" size={40} color={colors.primary} />
            </LinearGradient>
        </MotiView>
    );
}

const waitStyles = StyleSheet.create({
    wrap: { alignItems: 'center', justifyContent: 'center', width: 140, height: 140 },
    ring: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1.5 },
    center: {
        width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.3)',
    },
    centerShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 },
    spinner: { position: 'absolute', width: 70, height: 1, left: 70, top: 69, transformOrigin: 'left center' as any },
    spinnerLine: { flex: 1, height: 2, borderRadius: 1 },
});

// ─── MeetupConfirmScreen ──────────────────────────────────────────────────────

export default function MeetupConfirmScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { matchId, otherUser } = route.params || {};
    const partnerName = otherUser?.name || 'Yolcu';
    const firstName = partnerName.split(' ')[0];

    const [status, setStatus] = useState<'pending' | 'waiting_partner' | 'success'>('pending');

    useEffect(() => {
        SocketService.onMeetupConfirmed(() => {
            setStatus('success');
            setTimeout(() => {
                navigation.replace('Rating', { matchId: matchId || 'mock-id', otherUser });
            }, 2000);
        });
        return () => { SocketService.offMeetupConfirmed(); };
    }, [matchId, navigation, otherUser]);

    const handleConfirm = () => {
        setStatus('waiting_partner');
        if (matchId && matchId !== 'mock-id') {
            SocketService.confirmMeetup(matchId);
        } else {
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => navigation.replace('Rating', { matchId: matchId || 'mock-id', otherUser }), 2000);
            }, 2000);
        }
    };

    const handleDispute = () => {
        showConfirm(
            'Sorun Bildir',
            'Bu eşleşmeyle ilgili bir sorun mu yaşıyorsunuz?',
            () => {
                if (matchId && matchId !== 'mock-id') SocketService.endMatch(matchId);
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            },
            'Evet, Sorun Var',
            'İptal',
            true,
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0B0D17', '#161236', colors.background]} style={StyleSheet.absoluteFillObject} />

            {/* Ambient orb */}
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: status === 'success' ? 0.45 : 0.25 }}
                transition={{ type: 'timing', duration: 1000 } as any}
                style={[styles.ambientOrb, { backgroundColor: status === 'success' ? '#10B981' : colors.primary }]}
            />

            {/* Header */}
            <BlurView intensity={40} tint="dark" style={styles.header}>
                <View style={styles.headerShimmer} />
                <SafeAreaView>
                    <View style={styles.headerInner}>
                        {status !== 'success' && (
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => {
                                    showConfirm(
                                        'İptal Et', 'Buluşmayı iptal etmek istiyor musunuz?',
                                        () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
                                        'Evet, İptal Et', 'Hayır', true,
                                    );
                                }}
                            >
                                <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>Buluşma Onayı</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </BlurView>

            <View style={styles.content}>

                {/* ── CENTRAL ANIMATION ── */}
                <View style={styles.animArea}>
                    <AnimatePresence exitBeforeEnter>
                        {status === 'success' ? (
                            <SuccessView key="success" partnerName={firstName} />
                        ) : status === 'waiting_partner' ? (
                            <WaitingView key="waiting" />
                        ) : (
                            <MotiView
                                key="pending"
                                from={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', damping: 15 } as any}
                                style={styles.pendingArt}
                            >
                                {/* Partner avatar */}
                                <View style={styles.avatarRingOuter}>
                                    <LinearGradient
                                        colors={['#7C3AED', '#06B6D4', '#10B981']}
                                        style={styles.avatarRingGrad}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    >
                                        {otherUser?.photoUrl ? (
                                            <Image source={{ uri: otherUser.photoUrl }} style={styles.avatarImg} />
                                        ) : (
                                            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.avatarFallback}>
                                                <Text style={styles.avatarText}>{getInitials(partnerName)}</Text>
                                            </LinearGradient>
                                        )}
                                    </LinearGradient>
                                </View>

                                {/* Connection lines */}
                                <View style={styles.connLine} />

                                {/* Self icon */}
                                <View style={styles.selfBubble}>
                                    <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.selfGrad}>
                                        <Ionicons name="person" size={24} color="#FFF" />
                                    </LinearGradient>
                                    <View style={styles.selfCheck}>
                                        <Ionicons name="checkmark" size={10} color="#FFF" />
                                    </View>
                                </View>
                            </MotiView>
                        )}
                    </AnimatePresence>
                </View>

                {/* ── TEXT BLOCK ── */}
                <MotiView
                    key={status}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 200, type: 'timing', duration: 350 } as any}
                    style={styles.textBlock}
                >
                    <Text style={styles.title}>
                        {status === 'success'
                            ? '🎉 Buluşma Onaylandı!'
                            : status === 'waiting_partner'
                                ? `${firstName} bekleniyor...`
                                : `${firstName} ile buluşun`}
                    </Text>
                    <Text style={styles.subtitle}>
                        {status === 'success'
                            ? 'Harika bir yolculuk dileriz! Lütfen birbirinizi değerlendirin.'
                            : status === 'waiting_partner'
                                ? `${firstName} buluşmayı onaylaması bekleniyor. Lütfen bekleyin.`
                                : 'Buluşma noktasında karşılaştığınızda her iki taraf onaylamalıdır.'}
                    </Text>
                </MotiView>

                {/* ── SAFETY CARD ── (only for pending) */}
                {status === 'pending' && (
                    <MotiView
                        from={{ opacity: 0, translateY: 16 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400, type: 'spring' } as any}
                        style={styles.safetyCardWrap}
                    >
                        <BlurView intensity={25} tint="dark" style={styles.safetyCard}>
                            <View style={styles.safetyCardShimmer} />
                            <View style={styles.safetyRow}>
                                <View style={styles.safetyIconBox}>
                                    <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.safetyTitle}>Güvenlik Hatırlatması</Text>
                                    <Text style={styles.safetySub}>
                                        Sadece eşleşmenizin gerçek kişi olduğunu doğruladıktan sonra onaylayın.
                                        Onay kodu: <Text style={styles.safetyCode}>{matchId?.substring(matchId.length - 4) || 'DEMO'}</Text>
                                    </Text>
                                </View>
                            </View>
                        </BlurView>
                    </MotiView>
                )}

                <View style={{ flex: 1 }} />

                {/* ── ACTIONS ── */}
                {status === 'pending' && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 600, type: 'spring' } as any}
                        style={{ width: '100%' }}
                    >
                        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.9} style={styles.confirmBtn}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.confirmGrad}
                            >
                                <View style={styles.confirmShimmer} />
                                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                <Text style={styles.confirmText}>Evet, Buluştuk! ✓</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDispute} activeOpacity={0.8} style={styles.disputeBtn}>
                            <Ionicons name="warning-outline" size={16} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.disputeText}>Sorun Bildir</Text>
                        </TouchableOpacity>
                    </MotiView>
                )}

                {status === 'waiting_partner' && (
                    <TouchableOpacity onPress={handleDispute} activeOpacity={0.8} style={styles.disputeBtn}>
                        <Ionicons name="warning-outline" size={16} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.disputeText}>Sorun Bildir</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    ambientOrb: {
        position: 'absolute', width: 500, height: 500, borderRadius: 250,
        top: -200, alignSelf: 'center', opacity: 0.3,
        ...(Platform.OS === 'web' ? { filter: 'blur(120px)' } as any : {}),
    },

    // Header
    header: {
        backgroundColor: 'rgba(11,13,23,0.8)',
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerShimmer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerInner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.m, paddingVertical: 14,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },

    content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: 40, alignItems: 'center', paddingTop: 40 },

    // Animation area
    animArea: { height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },

    // Pending art
    pendingArt: { alignItems: 'center', gap: 12 },
    avatarRingOuter: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden' },
    avatarRingGrad: { width: 90, height: 90, borderRadius: 45, padding: 3, justifyContent: 'center', alignItems: 'center' },
    avatarImg: { width: 84, height: 84, borderRadius: 42 },
    avatarFallback: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 28, fontWeight: '800', color: '#FFF' },

    connLine: {
        width: 2, height: 28, borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderStyle: 'dashed',
    },
    selfBubble: { position: 'relative' },
    selfGrad: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
    },
    selfCheck: {
        position: 'absolute', bottom: -2, right: -2,
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#0B0D17',
    },

    // Text
    textBlock: { alignItems: 'center', marginBottom: spacing.l, paddingHorizontal: spacing.m },
    title: { fontSize: 24, fontWeight: '800', color: '#FFF', textAlign: 'center', letterSpacing: -0.5, marginBottom: 8 },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 21 },

    // Safety card
    safetyCardWrap: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: spacing.l },
    safetyCard: {
        padding: spacing.m, backgroundColor: 'rgba(16,185,129,0.05)',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', borderRadius: 20, overflow: 'hidden',
    },
    safetyCardShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(16,185,129,0.2)' },
    safetyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    safetyIconBox: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center',
    },
    safetyTitle: { fontSize: 14, fontWeight: '700', color: '#10B981', marginBottom: 4 },
    safetySub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
    safetyCode: { fontSize: 13, fontWeight: '800', color: '#10B981', letterSpacing: 2 },

    // Confirm
    confirmBtn: {
        borderRadius: 100, overflow: 'hidden', marginBottom: spacing.m,
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },
    confirmGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 18, paddingHorizontal: 28,
    },
    confirmShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },
    confirmText: { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },

    // Dispute
    disputeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 14,
    },
    disputeText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
});
