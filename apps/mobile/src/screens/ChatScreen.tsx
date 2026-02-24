import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, KeyboardAvoidingView,
    Platform, TextInput, TouchableOpacity, Image, ActivityIndicator, Linking, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import SocketService from '../services/socket';
import { useChatContext } from '../context/ChatContext';
import { showAlert } from '../utils/alert';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
}

const QUICK_REPLIES = [
    'Terminaldeyim 👋',
    '5 dk bekliyorum',
    'Taksi buldum, gel!',
    'Neredesin?',
];

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Date Separator ───────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
    return (
        <View style={sepStyles.wrap}>
            <View style={sepStyles.line} />
            <BlurView intensity={20} tint="dark" style={sepStyles.pill}>
                <Text style={sepStyles.text}>{date}</Text>
            </BlurView>
            <View style={sepStyles.line} />
        </View>
    );
}

const sepStyles = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 20 },
    line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.1)' },
    pill: {
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, overflow: 'hidden',
        backgroundColor: 'rgba(30,33,54,0.6)', marginHorizontal: 10,
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)',
    },
    text: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600', letterSpacing: 0.5 },
});

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
    return (
        <View style={typStyles.row}>
            <View style={typStyles.dots}>
                {[0, 1, 2].map(i => (
                    <MotiView
                        key={i}
                        from={{ translateY: 0, opacity: 0.4 }}
                        animate={{ translateY: -4, opacity: 1 }}
                        transition={{ type: 'timing', duration: 500, loop: true, delay: i * 150, repeatReverse: true } as any}
                        style={typStyles.dot}
                    />
                ))}
            </View>
            <Text style={typStyles.label}>{name.split(' ')[0]} yazıyor...</Text>
        </View>
    );
}

const typStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
    dots: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(30,33,54,0.7)', padding: 10, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.08)' },
    dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.primary },
    label: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
});

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ item, index, isLast, partnerAvatar, partnerName }: any) {
    const isMe = item.sender === 'me';

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'timing', duration: 200, delay: Math.min(index * 25, 250) } as any}
            style={[bubStyles.row, isMe ? bubStyles.rowMe : bubStyles.rowThem]}
        >
            {!isMe && (
                <View style={bubStyles.partnerAvatar}>
                    {partnerAvatar ? (
                        <Image source={{ uri: partnerAvatar }} style={bubStyles.avatarImg} />
                    ) : (
                        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={bubStyles.avatarGrad}>
                            <Text style={bubStyles.avatarText}>{getInitials(partnerName)}</Text>
                        </LinearGradient>
                    )}
                </View>
            )}

            <View style={[bubStyles.bubble, isMe ? bubStyles.bubbleMe : bubStyles.bubbleThem, isLast && (isMe ? bubStyles.lastMe : bubStyles.lastThem)]}>
                {isMe && (
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <Text style={[bubStyles.text, isMe ? bubStyles.textMe : bubStyles.textThem]}>{item.text}</Text>
                <View style={bubStyles.meta}>
                    <Text style={[bubStyles.time, { color: isMe ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)' }]}>{item.time}</Text>
                    {isMe && (
                        <Ionicons
                            name="checkmark-done"
                            size={13}
                            color="rgba(255,255,255,0.6)"
                            style={{ marginLeft: 3 }}
                        />
                    )}
                </View>
            </View>
        </MotiView>
    );
}

const bubStyles = StyleSheet.create({
    row: { flexDirection: 'row', marginBottom: 6, paddingHorizontal: 16, alignItems: 'flex-end' },
    rowMe: { justifyContent: 'flex-end' },
    rowThem: { justifyContent: 'flex-start' },
    partnerAvatar: { marginRight: 8, marginBottom: 2 },
    avatarImg: { width: 28, height: 28, borderRadius: 14 },
    avatarGrad: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
    bubble: {
        maxWidth: '72%', paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 20, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
    },
    bubbleMe: {
        borderBottomRightRadius: 4,
        backgroundColor: colors.primary,
    },
    bubbleThem: {
        backgroundColor: 'rgba(30,33,54,0.85)',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 4,
    },
    lastMe: { borderBottomRightRadius: 18 },
    lastThem: { borderBottomLeftRadius: 18 },
    text: { fontSize: 15, lineHeight: 22 },
    textMe: { color: '#FFF' },
    textThem: { color: 'rgba(255,255,255,0.9)' },
    meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
    time: { fontSize: 10 },
});

// ─── ChatScreen ───────────────────────────────────────────────────────────────

export default function ChatScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { otherUser, matchId } = route.params || {};
    const safeOtherUser = otherUser || { name: 'Yolcu' };
    const partnerName = safeOtherUser.name || 'Yolcu';

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [partnerOnline, setPartnerOnline] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeout = useRef<any>(null);

    const { markRead, setActiveChatId } = useChatContext();

    useEffect(() => {
        if (matchId) { setActiveChatId(matchId); markRead(matchId); }
        return () => setActiveChatId(null);
    }, [matchId]);

    useEffect(() => {
        if (!matchId) { setIsLoading(false); return; }
        SocketService.loadMessages(matchId).then((saved) => {
            if (saved.length > 0) setMessages(saved);
            setIsLoading(false);
        });
    }, [matchId]);

    useEffect(() => {
        if (!matchId) return;

        SocketService.onReceiveMessage(matchId, (message: any) => {
            setMessages(prev => [...prev, { id: message.id, text: message.text, sender: 'them', time: message.time }]);
            // Auto-clear typing when message arrives
            setIsTyping(false);
        });

        SocketService.onPartnerOnlineStatus((online) => setPartnerOnline(online));

        SocketService.onMatchEnded((payload) => {
            const name = partnerName.split(' ')[0];
            const msg = payload?.reason === 'partner_left' ? `${name} uygulamayı kapattı.` : 'Bağlantı kesildi.';
            showAlert('Eşleşme Sona Erdi', msg);
            setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }), 1500);
        });

        return () => {
            SocketService.offReceiveMessage();
            SocketService.offPartnerOnlineStatus();
            SocketService.offMatchEnded();
        };
    }, [matchId]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const handleCall = () => {
        if (safeOtherUser?.phoneNumber) {
            Linking.openURL(`tel:${safeOtherUser.phoneNumber}`);
        } else {
            showAlert('Numara Bulunamadı', 'Bu kullanıcının telefon numarası paylaşılmıyor.');
        }
    };

    const handleSend = useCallback(async (text?: string) => {
        const msg = (text ?? inputText).trim();
        if (!msg || !matchId) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage: Message = { id: Date.now().toString(), text: msg, sender: 'me', time };
        setMessages(prev => [...prev, newMessage]);
        if (!text) setInputText('');
        await SocketService.persistMessage(matchId, newMessage);
        SocketService.sendMessage(matchId, newMessage.text);
    }, [inputText, matchId]);

    const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0D0E1C', colors.background]} style={StyleSheet.absoluteFillObject} />

            {/* ── HEADER ── */}
            <BlurView intensity={60} tint="dark" style={styles.header}>
                <View style={styles.headerShimmer} />
                <SafeAreaView>
                    <View style={styles.headerInner}>
                        {/* Back */}
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>

                        {/* Avatar + Name */}
                        <View style={styles.headerCenter}>
                            {/* Avatar with online ring */}
                            <View style={styles.headerAvatarWrap}>
                                {safeOtherUser?.photoUrl ? (
                                    <Image source={{ uri: safeOtherUser.photoUrl }} style={styles.headerAvatar} />
                                ) : (
                                    <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.headerAvatar}>
                                        <Text style={styles.headerAvatarText}>{getInitials(partnerName)}</Text>
                                    </LinearGradient>
                                )}
                                <MotiView
                                    from={{ opacity: 1, scale: 1 }}
                                    animate={{ opacity: partnerOnline ? 0.3 : 0, scale: 2.5 }}
                                    transition={{ type: 'timing', duration: 1500, loop: true, repeatReverse: true } as any}
                                    style={[styles.onlinePulse, { backgroundColor: partnerOnline ? '#10B981' : 'transparent' }]}
                                />
                                <View style={[styles.onlineDot, { backgroundColor: partnerOnline ? '#10B981' : '#6B7280' }]} />
                            </View>

                            {/* Name + status */}
                            <View style={styles.headerNameCol}>
                                <Text style={styles.headerName} numberOfLines={1}>{partnerName}</Text>
                                <Text style={[styles.headerStatus, { color: partnerOnline ? '#10B981' : 'rgba(255,255,255,0.4)' }]}>
                                    {partnerOnline ? '● Çevrimiçi' : '○ Çevrimdışı'}
                                </Text>
                            </View>
                        </View>

                        {/* Call button */}
                        <TouchableOpacity onPress={handleCall} style={styles.callBtn} activeOpacity={0.8}>
                            <LinearGradient colors={['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.1)']} style={StyleSheet.absoluteFill} />
                            <Ionicons name="call" size={20} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </BlurView>

            {/* ── MESSAGES ── */}
            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={<DateSeparator date={today} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MotiView
                                from={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring' } as any}
                                style={styles.emptyIcon}
                            >
                                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.emptyIconGrad}>
                                    <Ionicons name="chatbubbles" size={36} color="#FFF" />
                                </LinearGradient>
                            </MotiView>
                            <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
                            <Text style={styles.emptySub}>Bir merhaba gönderin 👋</Text>

                            {/* Quick replies */}
                            <View style={styles.quickReplies}>
                                {QUICK_REPLIES.map((q, i) => (
                                    <TouchableOpacity key={i} onPress={() => handleSend(q)} style={styles.quickChip} activeOpacity={0.8}>
                                        <Text style={styles.quickText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <MessageBubble
                            item={item}
                            index={index}
                            isLast={index === messages.length - 1}
                            partnerAvatar={safeOtherUser?.photoUrl}
                            partnerName={partnerName}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator name={partnerName} />}

            {/* ── INPUT BAR ── */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <BlurView intensity={60} tint="dark" style={styles.inputBar}>
                    <View style={styles.inputBarShimmer} />
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Mesaj yaz..."
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => handleSend()}
                            returnKeyType="send"
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim()}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={inputText.trim() ? ['#4F46E5', '#7C3AED'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <Ionicons name="send" size={18} color={inputText.trim() ? '#FFF' : 'rgba(255,255,255,0.25)'} />
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        backgroundColor: 'rgba(13,14,28,0.85)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        zIndex: 20,
    },
    headerShimmer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    headerInner: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerAvatarWrap: { position: 'relative', width: 42, height: 42 },
    headerAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    headerAvatarText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    onlinePulse: {
        position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6,
    },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: 5.5,
        borderWidth: 2, borderColor: '#0D0E1C',
    },
    headerNameCol: { flex: 1 },
    headerName: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: -0.2 },
    headerStatus: { fontSize: 11, marginTop: 1 },
    callBtn: {
        width: 42, height: 42, borderRadius: 21, overflow: 'hidden',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    },

    // Messages
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { paddingBottom: 20, flexGrow: 1 },

    // Empty state
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 },
    emptyIcon: { marginBottom: 20 },
    emptyIconGrad: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 6 },
    emptySub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32 },
    quickReplies: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    quickChip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 100, borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
        backgroundColor: 'rgba(79,70,229,0.12)',
    },
    quickText: { fontSize: 13, color: '#A5B4FC', fontWeight: '500' },

    // Input
    inputBar: {
        backgroundColor: 'rgba(13,14,28,0.9)',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.08)',
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    },
    inputBarShimmer: { position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 12, gap: 10 },
    input: {
        flex: 1, minHeight: 44, maxHeight: 120,
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22,
        paddingHorizontal: 16, paddingVertical: 11,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        color: '#FFF', fontSize: 15, lineHeight: 20,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    },
    sendBtnDisabled: { opacity: 0.7 },
});
