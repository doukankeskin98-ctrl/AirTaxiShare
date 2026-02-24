import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, SafeAreaView, StatusBar, Platform
} from 'react-native';
import { showConfirm } from '../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Easing } from 'react-native-reanimated';
import SocketService from '../services/socket';

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Animated States ──────────────────────────────────────────────────────────

function PendingArt({ partnerName, photoUrl }: { partnerName: string; photoUrl?: string }) {
    const hue = (partnerName.charCodeAt(0) * 37) % 360;
    const bg = `hsl(${hue}, 45%, 28%)`;
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 18 } as any}
            style={art.wrap}
        >
            {/* Partner avatar */}
            <View style={[art.avatarOuter, { backgroundColor: bg }]}>
                {photoUrl
                    ? <Image source={{ uri: photoUrl }} style={art.img} />
                    : <Text style={art.initials}>{getInitials(partnerName)}</Text>
                }
            </View>
            {/* Connection indicator */}
            <View style={art.connWrap}>
                {[0, 1, 2, 3, 4].map(i => (
                    <MotiView
                        key={i}
                        from={{ opacity: 0 }}
                        animate={{ opacity: i % 2 === 0 ? 1 : 0.3 }}
                        transition={{ type: 'timing', duration: 600, loop: true, delay: i * 100, repeatReverse: true } as any}
                        style={art.connDot}
                    />
                ))}
            </View>
            {/* Self avatar */}
            <LinearGradient colors={['#5B5EF4', '#4338CA']} style={art.selfAvatar}>
                <Ionicons name="person" size={20} color="#FFF" />
            </LinearGradient>
        </MotiView>
    );
}

function WaitingArt() {
    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={art.wrap}
        >
            {[0, 1].map(i => (
                <MotiView
                    key={i}
                    from={{ opacity: 0.6, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 2.4 }}
                    transition={{ type: 'timing', duration: 2000, loop: true, delay: i * 600, easing: Easing.out(Easing.ease) } as any}
                    style={art.pulsing}
                />
            ))}
            <View style={art.waitCenter}>
                <Ionicons name="hourglass-outline" size={34} color={colors.primary} />
            </View>
        </MotiView>
    );
}

function SuccessArt() {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14 } as any}
            style={art.wrap}
        >
            {[0, 1].map(i => (
                <MotiView
                    key={i}
                    from={{ opacity: 0.5, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ type: 'timing', duration: 1500, loop: true, delay: i * 500, easing: Easing.out(Easing.ease) } as any}
                    style={[art.pulsing, { borderColor: colors.success }]}
                />
            ))}
            <LinearGradient colors={['#22C55E', '#16A34A']} style={art.successCircle}>
                <Ionicons name="checkmark" size={44} color="#FFF" />
            </LinearGradient>
        </MotiView>
    );
}

const art = StyleSheet.create({
    wrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
    avatarOuter: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0 },
    img: { width: 68, height: 68, borderRadius: 34 },
    initials: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    connWrap: { position: 'absolute', top: 64, left: 58, flexDirection: 'column', gap: 5, alignItems: 'center' },
    connDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
    selfAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 0 },

    pulsing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1.5, borderColor: colors.primary },
    waitCenter: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: colors.primaryMuted, borderWidth: 1.5, borderColor: colors.primaryBorder,
        justifyContent: 'center', alignItems: 'center',
    },
    successCircle: {
        width: 110, height: 110, borderRadius: 55,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#22C55E', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
    },
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
            setTimeout(() => navigation.replace('Rating', { matchId: matchId || 'mock-id', otherUser }), 2000);
        });
        return () => { SocketService.offMeetupConfirmed(); };
    }, []);

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
            'Sorun Var', 'İptal', true,
        );
    };

    const TITLES = {
        pending: `${firstName} ile buluştunuz mu?`,
        waiting_partner: `${firstName} onay bekleniyor`,
        success: 'Buluşma tamamlandı! 🎉',
    };

    const SUBTITLES = {
        pending: 'Karşılaşıp karşılaşmadığınızı doğrulamak için her iki tarafın onaylaması gerekiyor.',
        waiting_partner: `${firstName}'nın onaylaması bekleniyor. Birkaç saniye içinde gelecek.`,
        success: 'İyi yolculuklar! Lütfen birbirinizi değerlendirin.',
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafe}>
                <View style={styles.header}>
                    {status !== 'success' && (
                        <TouchableOpacity
                            style={styles.closeBtn}
                            activeOpacity={0.75}
                            onPress={() => showConfirm(
                                'İptal Et', 'Buluşmayı iptal etmek istiyor musunuz?',
                                () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }),
                                'Evet, İptal', 'Hayır', true,
                            )}
                        >
                            <Ionicons name="close" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>Buluşma Onayı</Text>
                    <View style={{ width: 36 }} />
                </View>
                <View style={styles.headerDivider} />
            </SafeAreaView>

            {/* Content */}
            <View style={styles.content}>
                {/* Art */}
                <View style={styles.artWrap}>
                    <AnimatePresence exitBeforeEnter>
                        {status === 'success' ? (
                            <SuccessArt key="s" />
                        ) : status === 'waiting_partner' ? (
                            <WaitingArt key="w" />
                        ) : (
                            <PendingArt key="p" partnerName={partnerName} photoUrl={otherUser?.photoUrl} />
                        )}
                    </AnimatePresence>
                </View>

                {/* Text */}
                <MotiView
                    key={status}
                    from={{ opacity: 0, translateY: 8 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 150, duration: 300 } as any}
                    style={styles.textWrap}
                >
                    <Text style={styles.title}>{TITLES[status]}</Text>
                    <Text style={styles.subtitle}>{SUBTITLES[status]}</Text>
                </MotiView>

                {/* Info card (pending only) */}
                {status === 'pending' && (
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 250 } as any}
                        style={styles.infoCard}
                    >
                        <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoText}>
                                Güvenlik kodu:{' '}
                                <Text style={styles.infoCode}>
                                    {matchId?.slice(-4)?.toUpperCase() || 'DEMO'}
                                </Text>
                            </Text>
                            <Text style={styles.infoSub}>Yolcuyla bu kodu karşılaştırın</Text>
                        </View>
                    </MotiView>
                )}

                <View style={{ flex: 1 }} />

                {/* Actions */}
                {status === 'pending' && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.9} style={styles.confirmBtn}>
                            <LinearGradient
                                colors={['#22C55E', '#16A34A']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.confirmGrad}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                <Text style={styles.confirmText}>Evet, buluştuk</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDispute} activeOpacity={0.8} style={styles.disputeBtn}>
                            <Text style={styles.disputeText}>Sorun bildir</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {status === 'waiting_partner' && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={handleDispute} activeOpacity={0.8} style={styles.disputeBtn}>
                            <Text style={styles.disputeText}>Sorun bildir</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },

    // Header
    headerSafe: { backgroundColor: colors.surface },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: colors.surfaceElevated,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.2 },
    headerDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },

    // Content
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, alignItems: 'center' },
    artWrap: { height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 36 },

    // Text
    textWrap: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 },
    title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', letterSpacing: -0.4, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },

    // Info card
    infoCard: {
        width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12,
        backgroundColor: `${colors.success}0F`,
        borderWidth: 1, borderColor: `${colors.success}25`,
        borderRadius: 12, padding: 14,
    },
    infoText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
    infoCode: { fontSize: 14, fontWeight: '800', color: colors.success, letterSpacing: 2 },
    infoSub: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },

    // Actions
    actions: { width: '100%', gap: 10 },
    confirmBtn: {
        borderRadius: 12, overflow: 'hidden',
        shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    confirmGrad: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 17,
    },
    confirmText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    disputeBtn: { alignItems: 'center', paddingVertical: 12 },
    disputeText: { fontSize: 14, color: colors.textTertiary, fontWeight: '500' },
});
