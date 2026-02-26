import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl, StatusBar, Image, Modal, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import api from '../services/api';
import SocketService from '../services/socket';
import { showAlert } from '../utils/alert';

interface QueueItem {
    destination: string;
    count: number;
    firstUserId?: string;
    firstUserName?: string;
    firstUserPhoto?: string;
    firstUserRating?: number;
    firstUserTrips?: number;
    firstUserTrustBadge?: boolean;
    firstUserPhoneVerified?: boolean;
    firstUserEmailVerified?: boolean;
    firstUserLuggage?: string;
    firstUserTime?: string;
}

interface ReviewItem {
    id: string;
    score: number;
    note: string;
    createdAt: string;
    reviewerName: string;
    reviewerPhoto: string | null;
}

export default function ActiveQueuesScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [queues, setQueues] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [isLuggageModalVisible, setLuggageModalVisible] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);
    const [selectedLuggage, setSelectedLuggage] = useState<string>('medium');

    const [isProfileModalVisible, setProfileModalVisible] = useState(false);
    const [profileReviews, setProfileReviews] = useState<ReviewItem[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

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

    const openLuggageModal = (queue: QueueItem) => {
        setSelectedQueue(queue);
        setSelectedLuggage('medium');
        setLuggageModalVisible(true);
    };

    const openProfileModal = async (queue: QueueItem) => {
        setSelectedQueue(queue);
        setProfileReviews([]);
        setProfileModalVisible(true);
        if (queue.firstUserId) {
            setIsLoadingReviews(true);
            try {
                const res = await api.get(`/match/user/${queue.firstUserId}/reviews`);
                setProfileReviews(res.data);
            } catch (err) {
                console.warn('Failed to fetch reviews', err);
            } finally {
                setIsLoadingReviews(false);
            }
        }
    };

    const getLuggageScore = (size: string | undefined): number => {
        switch (size) {
            case 'small': return 1;
            case 'medium': return 2;
            case 'large': return 3;
            default: return 2; // Default assume medium
        }
    };

    const handleConfirmJoin = () => {
        if (!selectedQueue) return;

        const myScore = getLuggageScore(selectedLuggage);
        const theirScore = getLuggageScore(selectedQueue.firstUserLuggage);
        const totalScore = myScore + theirScore;

        if (totalScore > 4) {
            // Fails the matching criteria
            showAlert(
                'Kapasite Aşımı',
                'Maalesef seçtiğiniz bagaj boyutu, bekleyen kişinin bagajıyla taksiye aynı anda sığmıyor. Yeni bir eşleşme başlatmayı deneyin.'
            );
            return;
        }

        // Direct Join Magic -> Navigate straight to Queue with Params
        setLuggageModalVisible(false);
        navigation.navigate('Queue', {
            destination: selectedQueue.destination,
            time: '',
            luggage: selectedLuggage
        });
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
                onPress={() => openLuggageModal(item)}
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

                    {/* Match Constraints Info */}
                    <View style={styles.constraintsRow}>
                        <View style={styles.constraintBadge}>
                            <Ionicons name="time-outline" size={14} color={colors.primaryLight} />
                            <Text style={styles.constraintText}>
                                {item.firstUserTime === '0' ? 'Hemen' : item.firstUserTime ? `${item.firstUserTime} dk` : 'Farketmez'}
                            </Text>
                        </View>
                        <View style={styles.constraintBadge}>
                            <Ionicons name="briefcase-outline" size={14} color={colors.primaryLight} />
                            <Text style={styles.constraintText}>
                                {item.firstUserLuggage === 'small' ? 'Sırt Çantası' : item.firstUserLuggage === 'large' ? 'Büyük Boy' : 'Orta'}
                            </Text>
                        </View>
                    </View>

                    {/* Middle Row: Avatars & Action */}
                    <View style={styles.cardActionRow}>
                        <TouchableOpacity style={styles.profileClickArea} onPress={() => openProfileModal(item)} activeOpacity={0.7}>
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
                            <View style={styles.profileTextInfo}>
                                <Text style={styles.profileName} numberOfLines={1}>
                                    {item.firstUserName || 'Yolcu'}
                                </Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={styles.ratingText}>{item.firstUserRating ? item.firstUserRating.toFixed(1) : '5.0'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => openLuggageModal(item)} activeOpacity={0.8}>
                            <LinearGradient
                                colors={colors.primaryGradient}
                                style={styles.joinButton}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                                <Text style={styles.joinButtonText}>Katıl</Text>
                                <Ionicons name="arrow-forward" size={16} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
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

            {/* Inline Luggage Selection Modal */}
            <Modal
                visible={isLuggageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLuggageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bagaj Boyutunuz?</Text>
                            <Text style={styles.modalSubtitle}>Araca sığacağınızı doğrulamamız gerekiyor.</Text>
                        </View>

                        <View style={styles.luggageOptionsRow}>
                            <TouchableOpacity
                                style={[styles.luggageOption, selectedLuggage === 'small' && styles.luggageOptionSelected]}
                                onPress={() => setSelectedLuggage('small')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="briefcase-outline" size={28} color={selectedLuggage === 'small' ? colors.primary : colors.textSecondary} />
                                <Text style={[styles.luggageText, selectedLuggage === 'small' && styles.luggageTextSelected]}>Sırt Çantası</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.luggageOption, selectedLuggage === 'medium' && styles.luggageOptionSelected]}
                                onPress={() => setSelectedLuggage('medium')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="business-outline" size={32} color={selectedLuggage === 'medium' ? colors.primary : colors.textSecondary} />
                                <Text style={[styles.luggageText, selectedLuggage === 'medium' && styles.luggageTextSelected]}>Kabin Boy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.luggageOption, selectedLuggage === 'large' && styles.luggageOptionSelected]}
                                onPress={() => setSelectedLuggage('large')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="albums-outline" size={36} color={selectedLuggage === 'large' ? colors.primary : colors.textSecondary} />
                                <Text style={[styles.luggageText, selectedLuggage === 'large' && styles.luggageTextSelected]}>Büyük Boy</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setLuggageModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Vazgeç</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmWrapper} onPress={handleConfirmJoin}>
                                <LinearGradient
                                    colors={colors.primaryGradient}
                                    style={styles.modalConfirmButton}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.modalConfirmText}>Eşleşmeyi Başlat</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* User Profile Modal */}
            <Modal
                visible={isProfileModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />

                    <View style={styles.modalContent}>
                        {selectedQueue && (
                            <>
                                <View style={styles.profileModalHeader}>
                                    {selectedQueue.firstUserPhoto ? (
                                        <Image source={{ uri: selectedQueue.firstUserPhoto }} style={styles.profileModalAvatar} />
                                    ) : (
                                        <View style={styles.profileModalFallbackAvatar}>
                                            <Ionicons name="person" size={32} color={colors.textSecondary} />
                                        </View>
                                    )}
                                    <Text style={styles.profileModalName}>{selectedQueue.firstUserName || 'Yolcu'}</Text>
                                    <View style={styles.profileModalStats}>
                                        <View style={styles.statBox}>
                                            <Ionicons name="star" size={16} color="#F59E0B" />
                                            <Text style={styles.statBoxText}>{selectedQueue.firstUserRating?.toFixed(1) || '5.0'}</Text>
                                        </View>
                                        <View style={styles.statDivider} />
                                        <View style={styles.statBox}>
                                            <Ionicons name="car-outline" size={16} color={colors.primaryLight} />
                                            <Text style={styles.statBoxText}>{selectedQueue.firstUserTrips || 0} Yolculuk</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Trust Badges */}
                                <View style={styles.badgesWrapper}>
                                    {selectedQueue.firstUserPhoneVerified && (
                                        <View style={styles.trustBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                            <Text style={styles.trustBadgeText}>Telefon Onaylı</Text>
                                        </View>
                                    )}
                                    {selectedQueue.firstUserEmailVerified && (
                                        <View style={styles.trustBadge}>
                                            <Ionicons name="mail" size={14} color={colors.success} />
                                            <Text style={styles.trustBadgeText}>E-posta Onaylı</Text>
                                        </View>
                                    )}
                                    {selectedQueue.firstUserTrustBadge && (
                                        <View style={styles.trustBadge}>
                                            <Ionicons name="shield-checkmark" size={14} color={colors.primaryLight} />
                                            <Text style={styles.trustBadgeText}>Güvenilir Profil</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Reviews Section */}
                                <Text style={styles.reviewsTitle}>Son Yorumlar</Text>
                                {isLoadingReviews ? (
                                    <View style={styles.reviewsLoading}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    </View>
                                ) : profileReviews.length > 0 ? (
                                    <FlatList
                                        data={profileReviews}
                                        keyExtractor={(r) => r.id}
                                        style={styles.reviewsList}
                                        renderItem={({ item }) => (
                                            <View style={styles.reviewCard}>
                                                <View style={styles.reviewHeader}>
                                                    {item.reviewerPhoto ? (
                                                        <Image source={{ uri: item.reviewerPhoto }} style={styles.reviewAvatar} />
                                                    ) : (
                                                        <View style={styles.reviewFallbackAvatar}>
                                                            <Ionicons name="person" size={12} color={colors.textSecondary} />
                                                        </View>
                                                    )}
                                                    <Text style={styles.reviewName}>{item.reviewerName}</Text>
                                                    <View style={styles.reviewScoreBox}>
                                                        <Ionicons name="star" size={10} color="#F59E0B" />
                                                        <Text style={styles.reviewScoreText}>{item.score}</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.reviewNote}>"{item.note}"</Text>
                                            </View>
                                        )}
                                    />
                                ) : (
                                    <View style={styles.reviewsEmpty}>
                                        <Text style={styles.reviewsEmptyText}>Henüz yazılı bir yorum bulunmuyor.</Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.closeProfileButton}
                                    onPress={() => setProfileModalVisible(false)}
                                >
                                    <Text style={styles.closeProfileText}>Kapat</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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

    constraintsRow: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.m, paddingHorizontal: spacing.xs },
    constraintBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14, 165, 233, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(14, 165, 233, 0.3)' },
    constraintText: { ...typography.caption, color: colors.primaryLight, fontSize: 13, fontWeight: '500' },

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

    /* Modal Styles */
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: colors.surfaceDark, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: spacing.xl, paddingBottom: 40, ...shadows.large },
    modalHeader: { marginBottom: spacing.l, alignItems: 'center' },
    modalTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: 8 },
    modalSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
    luggageOptionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
    luggageOption: { flex: 1, height: 110, backgroundColor: colors.background, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6, borderWidth: 1, borderColor: colors.border },
    luggageOptionSelected: { backgroundColor: 'rgba(14, 165, 233, 0.1)', borderColor: colors.primary },
    luggageText: { ...typography.caption, color: colors.textSecondary, marginTop: 12, fontWeight: '500' },
    luggageTextSelected: { color: colors.primary, fontWeight: '700' },
    modalActions: { flexDirection: 'row', alignItems: 'center' },
    modalCancelButton: { flex: 1, paddingVertical: 16, alignItems: 'center' },
    modalCancelText: { ...typography.button, color: colors.textSecondary },
    modalConfirmWrapper: { flex: 1 },
    modalConfirmButton: { borderRadius: 100, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    modalConfirmText: { ...typography.button, color: '#FFF' },

    /* Profile Click Area */
    profileClickArea: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    profileTextInfo: { marginLeft: 10, flexShrink: 1 },
    profileName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    ratingText: { ...typography.caption, color: colors.textSecondary },

    /* Profile Modal Styles */
    profileModalHeader: { alignItems: 'center', marginBottom: spacing.m },
    profileModalAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.primary, marginBottom: spacing.s },
    profileModalFallbackAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.s, borderWidth: 3, borderColor: colors.border },
    profileModalName: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
    profileModalStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
    statBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statBoxText: { ...typography.body, color: colors.textSecondary, fontWeight: '600' },
    statDivider: { width: 1, height: 16, backgroundColor: colors.border },

    badgesWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, justifyContent: 'center', marginBottom: spacing.l },
    trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6, borderWidth: 1, borderColor: colors.border },
    trustBadgeText: { ...typography.caption, color: colors.textPrimary },

    reviewsTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.m },
    reviewsLoading: { padding: spacing.l, alignItems: 'center' },
    reviewsList: { maxHeight: 300 },
    reviewsEmpty: { padding: spacing.l, alignItems: 'center', backgroundColor: colors.background, borderRadius: 16 },
    reviewsEmptyText: { ...typography.body, color: colors.textDisabled, fontStyle: 'italic' },

    reviewCard: { backgroundColor: colors.background, padding: spacing.m, borderRadius: 16, marginBottom: spacing.m, borderWidth: 1, borderColor: colors.border },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    reviewAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
    reviewFallbackAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
    reviewName: { ...typography.caption, color: colors.textPrimary, fontWeight: '600', flex: 1 },
    reviewScoreBox: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    reviewScoreText: { ...typography.caption, color: '#F59E0B', fontSize: 11, fontWeight: '700' },
    reviewNote: { ...typography.body, color: colors.textSecondary, fontSize: 13, lineHeight: 18, fontStyle: 'italic' },

    closeProfileButton: { marginTop: spacing.l, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 100 },
    closeProfileText: { ...typography.button, color: colors.textPrimary },
});
