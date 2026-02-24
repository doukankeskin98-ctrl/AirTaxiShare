import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, KeyboardAvoidingView,
    Platform, TextInput, TouchableOpacity, Image,
    ActivityIndicator, Linking, StatusBar, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, layout } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import SocketService from '../services/socket';
import { useChatContext } from '../context/ChatContext';
import { showAlert } from '../utils/alert';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    time: string;
}

function getInitials(name: string) {
    return (name || 'Y').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Date Separator ───────────────────────────────────────────────────────────
function DateSep({ date }: { date: string }) {
    return (
        <View style={sep.row}>
            <View style={sep.line} />
            <Text style={sep.text}>{date}</Text>
            <View style={sep.line} />
        </View>
    );
}
const sep = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 20 },
    line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
    text: { fontSize: 11, color: colors.textDisabled, paddingHorizontal: 12, fontWeight: '600' },
});

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ item, isLast, partnerAvatar, partnerName }: {
    item: Message; isLast: boolean;
    partnerAvatar?: string; partnerName: string;
}) {
    const isMe = item.sender === 'me';
    const hue = ((partnerName || 'A').charCodeAt(0) * 37) % 360;
    const avatarBg = `hsl(${hue}, 45%, 28%)`;

    return (
        <View style={[bub.row, isMe ? bub.rowMe : bub.rowThem]}>
            {!isMe && (
                <View style={[bub.avatar, { backgroundColor: avatarBg }]}>
                    {partnerAvatar ? (
                        <Image source={{ uri: partnerAvatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                    ) : (
                        <Text style={bub.avatarText}>{getInitials(partnerName)}</Text>
                    )}
                </View>
            )}
            <View style={[bub.bubble, isMe ? bub.bubbleMe : bub.bubbleThem]}>
                {isMe && (
                    <LinearGradient
                        colors={['#5B5EF4', '#4338CA']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                )}
                <Text style={[bub.text, { color: isMe ? '#FFF' : colors.textPrimary }]}>{item.text}</Text>
                <View style={bub.meta}>
                    <Text style={[bub.time, { color: isMe ? 'rgba(255,255,255,0.5)' : colors.textDisabled }]}>
                        {item.time}
                    </Text>
                    {isMe && (
                        <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.55)" style={{ marginLeft: 3 }} />
                    )}
                </View>
            </View>
        </View>
    );
}
const bub = StyleSheet.create({
    row: { flexDirection: 'row', marginBottom: 4, paddingHorizontal: 16, alignItems: 'flex-end' },
    rowMe: { justifyContent: 'flex-end' },
    rowThem: { justifyContent: 'flex-start' },
    avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 2 },
    avatarText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
    bubble: {
        maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 9,
        borderRadius: 18, overflow: 'hidden',
    },
    bubbleMe: { borderBottomRightRadius: 4, backgroundColor: colors.primary },
    bubbleThem: {
        borderBottomLeftRadius: 4,
        backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
    },
    text: { fontSize: 15, lineHeight: 21 },
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
    const flatListRef = useRef<FlatList>(null);

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
        });
        SocketService.onPartnerOnlineStatus((online: boolean) => setPartnerOnline(online));
        SocketService.onMatchEnded((payload: any) => {
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
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
        }
    }, [messages.length]);

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || !matchId) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg: Message = { id: Date.now().toString(), text: inputText.trim(), sender: 'me', time };
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        await SocketService.persistMessage(matchId, newMsg);
        SocketService.sendMessage(matchId, newMsg.text);
    }, [inputText, matchId]);

    const handleCall = () => {
        if (safeOtherUser?.phoneNumber) {
            Linking.openURL(`tel:${safeOtherUser.phoneNumber}`);
        } else {
            showAlert('Numara Bulunamadı', 'Bu kullanıcının telefon numarası paylaşılmıyor.');
        }
    };

    const hue = (partnerName.charCodeAt(0) * 37) % 360;
    const avatarBg = `hsl(${hue}, 45%, 28%)`;

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ── */}
            <SafeAreaView style={styles.headerWrap}>
                <View style={styles.header}>
                    {/* Back */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.75}>
                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Partner info */}
                    <View style={styles.headerCenter}>
                        <View style={[styles.headerAvatar, { backgroundColor: avatarBg }]}>
                            {safeOtherUser?.photoUrl ? (
                                <Image source={{ uri: safeOtherUser.photoUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                            ) : (
                                <Text style={styles.headerAvatarText}>{getInitials(partnerName)}</Text>
                            )}
                            {/* Online dot */}
                            <View style={[styles.onlineDot, { backgroundColor: partnerOnline ? colors.success : colors.textDisabled }]} />
                        </View>
                        <View>
                            <Text style={styles.headerName}>{partnerName}</Text>
                            <Text style={[styles.headerStatus, { color: partnerOnline ? colors.success : colors.textDisabled }]}>
                                {partnerOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                            </Text>
                        </View>
                    </View>

                    {/* Call */}
                    <TouchableOpacity onPress={handleCall} style={styles.callBtn} activeOpacity={0.75}>
                        <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerDivider} />
            </SafeAreaView>

            {/* ── MESSAGES ── */}
            {isLoading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={colors.primary} size="small" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={
                        <DateSep date={new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={[styles.emptyIconBox, { backgroundColor: avatarBg }]}>
                                <Text style={styles.emptyAvatarText}>{getInitials(partnerName)}</Text>
                            </View>
                            <Text style={styles.emptyTitle}>{partnerName}</Text>
                            <Text style={styles.emptySub}>Bir merhaba diyerek başlayın</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <Bubble
                            item={item}
                            isLast={index === messages.length - 1}
                            partnerAvatar={safeOtherUser?.photoUrl}
                            partnerName={partnerName}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ── INPUT ── */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View style={styles.inputWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="Mesaj yaz..."
                        placeholderTextColor={colors.textDisabled}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        activeOpacity={0.85}
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnOff]}
                    >
                        <Ionicons name="send" size={18} color={inputText.trim() ? '#FFF' : colors.textDisabled} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },

    // Header
    headerWrap: { backgroundColor: colors.surface },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10, gap: 10,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    headerAvatarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 10, height: 10, borderRadius: 5,
        borderWidth: 2, borderColor: colors.surface,
    },
    headerName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.2 },
    headerStatus: { fontSize: 11, fontWeight: '500', marginTop: 1 },
    callBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },

    // Messages
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 16, flexGrow: 1 },
    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
    emptyIconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    emptyAvatarText: { fontSize: 22, fontWeight: '700', color: '#FFF' },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    emptySub: { fontSize: 13, color: colors.textTertiary },

    // Input
    inputWrap: {
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: 16, paddingVertical: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border, gap: 10,
    },
    input: {
        flex: 1, minHeight: 44, maxHeight: 120,
        backgroundColor: colors.background,
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11,
        borderWidth: 1, borderColor: colors.border,
        color: colors.textPrimary, fontSize: 15,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    sendBtnOff: { backgroundColor: colors.surfaceBorder },
});
