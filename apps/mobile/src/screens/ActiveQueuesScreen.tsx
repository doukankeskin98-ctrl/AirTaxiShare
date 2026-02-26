import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, StatusBar, Image, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import SocketService from '../services/socket';
import { showAlert } from '../utils/alert';

interface QueueItem {
    destination: string;
    count: number;
    firstUserPhoto?: string;
}

export default function ActiveQueuesScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [queues, setQueues] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchQueues = useCallback(async () => {
        try {
            await SocketService.connect();
            SocketService.socket?.emit('get_active_queues');
        } catch (error) {
            console.warn('[ActiveQueues] Socket connection failed', error);
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Register listener for queue list
        const unsub = SocketService.socket?.on('active_queues_list', (payload: { queues: QueueItem[] }) => {
            setQueues(payload.queues || []);
            setIsLoading(false);
            setRefreshing(false);
        });

        fetchQueues();

        return () => {
            if (unsub) SocketService.socket?.off('active_queues_list', unsub);
        };
    }, [fetchQueues]);

    const handleJoinQueue = (destination: string) => {
        // Navigate to the standard Queue screen, instantly injecting the user into this specific destination's matchmaking engine.
        // We prompt them to choose their luggage size first to ensure they meet the 4-score limit against whoever is waiting.
        navigation.navigate('CreateMatch', { preselectedDestination: destination });
    };

    const renderItem = ({ item, index }: { item: QueueItem; index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'spring' } as any}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.cardContainer}
                onPress={() => handleJoinQueue(item.destination)}
            >
                <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
                    <View style={styles.cardHighlight} />

                    {/* Header Row */}
                    <View style={styles.cardHeader}>
                        <View style={styles.destinationBox}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="location" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.destinationText}>{item.destination}</Text>
                        </View>

                        <View style={styles.badge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.badgeText}>{item.count} Bekleyen</Text>
                        </View>
                    </View>

                    {/* Middle Row: Avatars & Action */}
                    <View style={styles.cardActionRow}>
                        <View style={styles.avatarStack}>
                            {item.firstUserPhoto ? (
                                <Image source={{ uri: item.firstUserPhoto }} style={styles.avatar} />
                            ) : (
                                <View style={styles.fallbackAvatar}>
                                    <Ionicons name="person" size={16} color={colors.textSecondary} />
                                </View>
                            )}
                            {item.count > 1 && (
                                <View style={[styles.fallbackAvatar, styles.avatarOverlap]}>
                                    <Text style={styles.overlapText}>+{item.count - 1}</Text>
                                </View>
                            )}
                        </View>

                        <LinearGradient
                            colors={colors.primaryGradient}
                            style={styles.joinButton}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.joinButtonText}>Katıl</Text>
                            <Ionicons name="arrow-forward" size={16} color="#FFF" />
                        </LinearGradient>
                    </View>
                </BlurView>
            </TouchableOpacity>
        </MotiView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a1040', colors.background]} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mevcutlara Katıl</Text>
                    <View style={{ width: 40 }} />
                </View>

                {isLoading && !refreshing ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Kuyruklar aranıyor...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={queues}
                        keyExtractor={(item) => item.destination}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQueues(); }} tintColor={colors.primary} />}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="sad-outline" size={64} color={colors.textDisabled} />
                                <Text style={styles.emptyTitle}>Henüz Kimse Yok</Text>
                                <Text style={styles.emptySubtitle}>Şu anda hiçbir rotada bekleyen yolcu bulunmuyor. Kendi yolculuğunu başlatarak havuzu sen açabilirsin!</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.m, paddingTop: spacing.m, paddingBottom: spacing.s,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { ...typography.h2, fontSize: 20, color: colors.textPrimary },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.m },
    listContent: { padding: spacing.m, paddingTop: spacing.l, paddingBottom: 100 },
    cardContainer: { marginBottom: spacing.m, borderRadius: 24, overflow: 'hidden', ...shadows.medium },
    cardBlur: { padding: spacing.l, backgroundColor: 'rgba(30, 33, 54, 0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHighlight: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
    destinationBox: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: spacing.s },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(14, 165, 233, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.s },
    destinationText: { ...typography.h3, fontSize: 18, color: colors.textPrimary, flexShrink: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
    pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 6 },
    badgeText: { ...typography.caption, color: colors.success, fontWeight: '600' },
    cardActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    avatarStack: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.surface },
    fallbackAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    avatarOverlap: { marginLeft: -12, backgroundColor: colors.surfaceDark },
    overlapText: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
    joinButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, gap: spacing.xs },
    joinButtonText: { ...typography.button, color: '#FFF' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: spacing.xl },
    emptyTitle: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.l },
    emptySubtitle: { ...typography.body, color: colors.textDisabled, textAlign: 'center', marginTop: spacing.s, lineHeight: 22 },
});
