import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Image, Linking, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import SocketService from '../services/socket';
import { useChatContext } from '../context/ChatContext';


interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
}

export default function ChatScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { otherUser, matchId } = route.params || {};
    const safeOtherUser = otherUser || { name: 'Yolcu' };
    const title = safeOtherUser.name || 'Yolcu';

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [partnerOnline, setPartnerOnline] = useState(true);
    const flatListRef = useRef<FlatList>(null);

    const { markRead, setActiveChatId } = useChatContext();

    // Signal to ChatContext that this chat is active + clear unread badge
    useEffect(() => {
        if (matchId) {
            setActiveChatId(matchId);
            markRead(matchId);
        }
        return () => setActiveChatId(null);
    }, [matchId]);

    // Load persisted messages on mount
    useEffect(() => {
        if (!matchId) {
            setIsLoading(false);
            return;
        }

        SocketService.loadMessages(matchId).then((saved) => {
            if (saved.length > 0) setMessages(saved);
            setIsLoading(false);
        });
    }, [matchId]);

    // Register socket listeners
    useEffect(() => {
        if (!matchId) return;

        // Incoming messages — also auto-persisted inside SocketService
        SocketService.onReceiveMessage(matchId, (message: any) => {
            setMessages(prev => [...prev, {
                id: message.id,
                text: message.text,
                sender: 'them',
                time: message.time,
            }]);
        });

        // Partner presence
        SocketService.onPartnerOnlineStatus((online) => {
            setPartnerOnline(online);
        });

        return () => {
            SocketService.offReceiveMessage();
            SocketService.offPartnerOnlineStatus();
        };
    }, [matchId]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const handleCall = () => {
        if (safeOtherUser?.phoneNumber) {
            Linking.openURL(`tel:${safeOtherUser.phoneNumber}`);
        } else {
            Alert.alert('Numara Bulunamadı', 'Bu kullanıcının telefon numarası doğrulanmamış veya erişilemiyor.', [{ text: 'Tamam' }]);
        }
    };

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || !matchId) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'me',
            time,
        };

        // Optimistically add to UI immediately
        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Persist + send over socket
        await SocketService.persistMessage(matchId, newMessage);
        SocketService.sendMessage(matchId, newMessage.text);
    }, [inputText, matchId]);

    const renderItem = ({ item, index }: { item: Message; index: number }) => {
        const isMe = item.sender === 'me';
        return (
            <MotiView
                from={{ opacity: 0, translateY: 8, scale: 0.97 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: 'timing', duration: 220, delay: Math.min(index * 30, 300) } as any}
                style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}
            >
                {!isMe && (
                    <View style={styles.avatarContainer}>
                        {otherUser?.photoUrl ? (
                            <Image source={{ uri: otherUser.photoUrl }} style={styles.avatarPhoto} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Ionicons name="person" size={16} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>
                )}

                <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
                    {isMe && (
                        <LinearGradient
                            colors={colors.primaryGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.text}
                    </Text>
                    <Text style={[styles.timeText, isMe ? { color: 'rgba(255,255,255,0.6)' } : { color: colors.textSecondary }]}>
                        {item.time}
                    </Text>
                </View>
            </MotiView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: partnerOnline ? colors.success : colors.textDisabled }]} />
                        <Text style={styles.statusText}>{partnerOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={handleCall} style={styles.callButton}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <>
                    {messages.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color={colors.textDisabled} />
                            <Text style={styles.emptyText}>Henüz mesaj yok</Text>
                            <Text style={styles.emptySubtext}>Merhaba deyin! 👋</Text>
                        </View>
                    )}

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[styles.listContent, messages.length === 0 && { display: 'none' }]}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('chat.placeholder')}
                        placeholderTextColor={colors.textDisabled}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <LinearGradient
                            colors={inputText.trim() ? colors.primaryGradient : [colors.border, colors.border]}
                            style={StyleSheet.absoluteFill}
                        />
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingTop: Platform.OS === 'ios' ? 55 : 40,
        paddingBottom: spacing.m,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.subtle,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.s,
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 17,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    statusText: {
        ...typography.caption,
        fontSize: 12,
        color: colors.textSecondary,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '18',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
    },
    emptyText: {
        ...typography.h3,
        color: colors.textSecondary,
        marginTop: spacing.m,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.textDisabled,
        marginTop: spacing.xs,
    },
    listContent: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
        flexGrow: 1,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: spacing.s,
        alignItems: 'flex-end',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginRight: spacing.s,
        marginBottom: 4,
    },
    avatarPhoto: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    avatarFallback: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageBubble: {
        maxWidth: '72%',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s + 2,
        borderRadius: 20,
        overflow: 'hidden',
        ...shadows.subtle,
    },
    myMessageBubble: {
        borderBottomRightRadius: 4,
        backgroundColor: colors.primary,
    },
    theirMessageBubble: {
        borderBottomLeftRadius: 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        ...typography.body,
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: {
        color: '#FFF',
    },
    theirMessageText: {
        color: colors.textPrimary,
    },
    timeText: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 3,
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? 32 : spacing.m,
        gap: spacing.s,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        backgroundColor: colors.background,
        borderRadius: 22,
        paddingHorizontal: spacing.m,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.textPrimary,
        fontSize: 15,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    sendBtnDisabled: {
        opacity: 0.45,
    },
});
