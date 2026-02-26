import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';
import { registerForPushNotificationsAsync } from '../services/notifications';

import { loadUserProfile, MatchAPI } from '../services/api';

export default function HomeScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [user, setUser] = useState<any>({ fullName: '', photoUrl: null });
    const [matchHistory, setMatchHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const profile = await loadUserProfile();
        if (profile) {
            setUser(profile);
        }

        setLoadingHistory(true);
        try {
            const response = await MatchAPI.getHistory();
            setMatchHistory(response.data || []);
        } catch (e) {
            // Silently fail - history is not critical
        } finally {
            setLoadingHistory(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const displayName = user.fullName || 'Yolcu';

    const handleCreateMatch = () => {
        navigation.navigate('CreateMatch');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Aurora Orbs */}
            <LinearGradient
                colors={['#1a1040', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ type: 'timing', duration: 2000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -100, right: -100, backgroundColor: colors.primary }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.4, scale: 1.2 }}
                transition={{ type: 'timing', duration: 3000, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: 200, left: -150, backgroundColor: colors.secondary }]}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <MotiText
                            from={{ opacity: 0, translateY: -10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 100 } as any}
                            style={styles.greeting}
                        >
                            Merhaba, {displayName.split(' ')[0]}
                        </MotiText>
                        <MotiText
                            from={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            transition={{ delay: 200 } as any}
                            style={styles.subGreeting}
                        >
                            {t('app.tagline')}
                        </MotiText>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Settings')}>
                        {user.photoUrl ? (
                            <Image
                                source={{ uri: user.photoUrl }}
                                style={styles.profilePhoto}
                            />
                        ) : (
                            <LinearGradient
                                colors={colors.primaryGradient}
                                style={styles.profileGradient}
                            >
                                <Ionicons name="person" size={20} color={colors.textInverse} />
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </View>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >

                    {/* Security Notification Pill */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 100 } as any}
                        style={styles.securityPillWrapper}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.securityPill}>
                            <View style={styles.securityPillHighlight} />
                            <View style={styles.securityIconBox}>
                                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                            </View>
                            <Text style={styles.securityPillText}>
                                Yolculuklar 7/24 Uygulama İçi Takip Edilir
                            </Text>
                        </BlurView>
                    </MotiView>

                    {/* Main Action: Create Match Card */}
                    <MotiView
                        from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                        animate={{ opacity: 1, scale: 1, translateY: 0 }}
                        transition={{ delay: 180, type: 'spring' } as any}
                        style={styles.mainCardWrapper}
                    >
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={handleCreateMatch}
                            style={styles.mainCardTouch}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#8B5CF6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.mainCardGradient}
                            >
                                <Ionicons name="airplane" size={180} color="rgba(255,255,255,0.1)" style={styles.mainCardGhostIcon} />

                                <View style={styles.mainCardContent}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="add" size={32} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.mainCardTitle}>Yolculuk Başlat</Text>
                                        <Text style={styles.mainCardSubtitle}>Aynı yöne gidenlerle masrafı paylaş</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </MotiView>

                    {/* Secondary Actions Grid */}
                    <View style={styles.secondaryGrid}>
                        {/* Search Matches */}
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 500, type: 'spring' } as any}
                            style={styles.secondaryCardWrapper}
                        >
                            <TouchableOpacity activeOpacity={0.8} style={styles.secondaryCard} onPress={() => navigation.navigate('ActiveQueues')}>
                                <BlurView intensity={30} tint="dark" style={styles.secondaryBlur}>
                                    <View style={styles.secondaryHighlight} />
                                    <View style={[styles.secondaryIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.2)' }]}>
                                        <Ionicons name="search" size={24} color={colors.secondary} />
                                    </View>
                                    <Text style={styles.secondaryTitle}>Mevcutlara katıl</Text>
                                    <Text style={styles.secondarySubtitle}>Yolculuk Birlikteliği</Text>
                                </BlurView>
                            </TouchableOpacity>
                        </MotiView>

                        {/* My Matches */}
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 600, type: 'spring' } as any}
                            style={styles.secondaryCardWrapper}
                        >
                            <TouchableOpacity activeOpacity={0.8} style={styles.secondaryCard} onPress={() => navigation.navigate('MatchHistory')}>
                                <BlurView intensity={30} tint="dark" style={styles.secondaryBlur}>
                                    <View style={styles.secondaryHighlight} />
                                    <View style={[styles.secondaryIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                        <Ionicons name="time" size={24} color={colors.success} />
                                    </View>
                                    <Text style={styles.secondaryTitle}>{t('home.myMatches')}</Text>
                                    <Text style={styles.secondarySubtitle}>
                                        {matchHistory.length > 0 ? `${matchHistory.length} yolculuk` : 'Geçmiş binişler'}
                                    </Text>
                                </BlurView>
                            </TouchableOpacity>
                        </MotiView>
                    </View>

                    {/* Recent Activity */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 700 } as any}
                        style={styles.recentSection}
                    >
                        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>

                        {matchHistory.length > 0 ? (
                            <View style={styles.historyList}>
                                {matchHistory.slice(0, 5).map((match, index) => (
                                    <MotiView
                                        key={match.id}
                                        from={{ opacity: 0, translateX: -20 }}
                                        animate={{ opacity: 1, translateX: 0 }}
                                        transition={{ delay: 800 + index * 100 } as any}
                                    >
                                        <BlurView intensity={15} tint="dark" style={styles.historyItem}>
                                            <View style={styles.historyIcon}>
                                                <Ionicons
                                                    name={match.status === 'COMPLETED' ? 'checkmark-circle' : 'time'}
                                                    size={24}
                                                    color={match.status === 'COMPLETED' ? colors.success : colors.warning}
                                                />
                                            </View>
                                            <View style={styles.historyInfo}>
                                                <Text style={styles.historyDest}>{match.destination}</Text>
                                                <Text style={styles.historyPartner}>
                                                    {match.otherUser?.fullName || 'Yolcu'} ile
                                                </Text>
                                            </View>
                                            <Text style={styles.historyDate}>
                                                {new Date(match.matchedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                            </Text>
                                        </BlurView>
                                    </MotiView>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyStateBox}>
                                <BlurView intensity={15} tint="dark" style={styles.emptyStateBlur}>
                                    <Ionicons name="time-outline" size={40} color={colors.textSecondary} />
                                    <Text style={styles.emptyStateText}>Henüz aktif bir yolculuğun yok.</Text>
                                    <PremiumButton
                                        title="Şimdi Başla"
                                        variant="glass"
                                        style={{ marginTop: spacing.l, width: 160 }}
                                        onPress={handleCreateMatch}
                                    />
                                </BlurView>
                            </View>
                        )}
                    </MotiView>

                </ScrollView>
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
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.4,
        transform: [{ scale: 2 }],
        // filter: 'blur(80px)' is web-only CSS — do not use in RN
        ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } as any : {}),
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.l,
        paddingTop: spacing.m,
        paddingBottom: spacing.m,
        zIndex: 10,
    },
    headerTextContainer: {
        flex: 1,
        paddingRight: spacing.m,
    },
    greeting: {
        ...typography.h1,
        color: colors.textPrimary,
        fontSize: 32,
        lineHeight: 38,
    },
    subGreeting: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: 4,
    },
    profileBtn: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    profileGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    profilePhoto: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    content: {
        paddingHorizontal: spacing.l,
        paddingBottom: 100,
    },
    securityPillWrapper: {
        marginBottom: spacing.l,
        borderRadius: 100,
        overflow: 'hidden',
    },
    securityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: spacing.m,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    securityPillHighlight: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    securityIconBox: {
        marginRight: spacing.s,
    },
    securityPillText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    mainCardWrapper: {
        height: 220,
        marginBottom: spacing.l,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    mainCardTouch: {
        flex: 1,
        borderRadius: 32,
        overflow: 'hidden',
    },
    mainCardGradient: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'flex-end',
    },
    mainCardGhostIcon: {
        position: 'absolute',
        top: -20,
        right: -30,
        transform: [{ rotate: '-15deg' }],
    },
    mainCardContent: {
        flexDirection: 'column',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.textPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    mainCardTitle: {
        ...typography.h1,
        color: colors.textPrimary,
        fontSize: 28,
        lineHeight: 34,
    },
    mainCardSubtitle: {
        ...typography.body,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    secondaryGrid: {
        flexDirection: 'row',
        gap: spacing.m,
        marginBottom: spacing.xl,
    },
    secondaryCardWrapper: {
        flex: 1,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
    },
    secondaryCard: {
        flex: 1,
    },
    secondaryBlur: {
        flex: 1,
        padding: spacing.m,
        justifyContent: 'center',
        backgroundColor: 'rgba(20, 22, 38, 0.5)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: 24,
    },
    secondaryHighlight: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    secondaryTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        fontSize: 16,
    },
    secondarySubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    recentSection: {
        marginTop: spacing.m,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.m,
    },
    historyList: {
        gap: spacing.s,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 33, 54, 0.3)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    historyIcon: {
        marginRight: spacing.m,
    },
    historyInfo: {
        flex: 1,
    },
    historyDest: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    historyPartner: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    historyDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    emptyStateBox: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    emptyStateBlur: {
        padding: spacing.xxl,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 33, 54, 0.3)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: 24,
    },
    emptyStateText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.m,
        textAlign: 'center',
    },
});
