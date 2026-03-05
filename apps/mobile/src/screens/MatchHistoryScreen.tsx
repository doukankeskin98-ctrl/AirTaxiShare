import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, StatusBar, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { MatchAPI } from '../services/api';
import { showAlert } from '../utils/alert';
import { SkeletonRow } from '../components/SkeletonLoader';

export default function MatchHistoryScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await MatchAPI.getHistory();
            setHistory(response.data || []);
        } catch (error: any) {
            showAlert('Hata', error.response?.data?.message || error.message || 'Geçmiş yüklenemedi.');
            setHistory([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isCompleted = item.status === 'COMPLETED';
        const partnerName = item.otherUser?.fullName || t('common.passenger');

        return (
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 80, type: 'timing', duration: 300 } as any}
                style={styles.cardWrapper}
            >
                <BlurView intensity={25} tint="dark" style={styles.cardBlur}>
                    <View style={styles.cardHeader}>
                        <View style={styles.destinationBox}>
                            <Ionicons name="airplane" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.destinationTitle}>{item.destination}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
                            <Text style={[styles.statusText, { color: isCompleted ? colors.success : colors.warning }]}>
                                {isCompleted ? 'Tamamlandı' : 'İptal / Yarım'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.partnerInfo}>
                            {item.otherUser?.photoUrl ? (
                                <Image source={{ uri: item.otherUser.photoUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Ionicons name="person" size={20} color={colors.textSecondary} />
                                </View>
                            )}
                            <View style={styles.partnerDetails}>
                                <Text style={styles.partnerName}>{partnerName}</Text>
                                <Text style={styles.matchedDate}>
                                    {new Date(item.matchedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </MotiView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#1a1040', colors.background]} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('history.title', { defaultValue: 'Geçmiş Yolculuklarım' })}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {isLoading && !refreshing ? (
                    <View style={styles.centerContainer}>
                        <View style={{ width: '100%', paddingHorizontal: spacing.l, marginTop: spacing.l }}>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        keyExtractor={(item) => item.id || Math.random().toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor={colors.primary} />}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={64} color={colors.textDisabled} />
                                <Text style={styles.emptyTitle}>{t('history.empty.title', { defaultValue: 'Geçmiş Yolculuk Yok' })}</Text>
                                <Text style={styles.emptySubtitle}>{t('history.empty.desc', { defaultValue: 'Platformumuzda henüz bir yolculuk geçmişiniz bulunmuyor.' })}</Text>
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
    loadingText: { ...typography.body, color: colors.textSecondary },
    listContent: { padding: spacing.m, paddingBottom: 100, gap: spacing.m },
    cardWrapper: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardBlur: { padding: spacing.m, backgroundColor: 'rgba(20, 22, 38, 0.4)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.m },
    destinationBox: { flexDirection: 'row', alignItems: 'center' },
    destinationTitle: { ...typography.h3, fontSize: 16, color: colors.textPrimary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
    statusText: { ...typography.caption, fontWeight: '600' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    partnerInfo: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
    avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    partnerDetails: { marginLeft: spacing.m },
    partnerName: { ...typography.body, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
    matchedDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: spacing.xl },
    emptyTitle: { ...typography.h3, color: colors.textSecondary, marginTop: spacing.l },
    emptySubtitle: { ...typography.body, color: colors.textDisabled, textAlign: 'center', marginTop: spacing.s, lineHeight: 22 },
});
