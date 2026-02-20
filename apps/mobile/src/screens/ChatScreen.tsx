import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, spacing, layout, shadows } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChatScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const title = route.params?.otherUser?.name || 'Mehmet Y.'; // Mock name

    const [messages, setMessages] = useState([
        { id: '1', text: 'Hi! I am at Exit 9.', sender: 'them', time: '10:05' },
        { id: '2', text: 'Okay, coming specifically there.', sender: 'me', time: '10:06' },
        { id: '3', text: 'Great, see you soon!', sender: 'them', time: '10:07' },
    ]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setInputText('');
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const isMe = item.sender === 'me';
        return (
            <MotiView
                from={{ opacity: 0, translateY: 10, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{ type: 'timing', duration: 300, delay: index * 50 } as any}
                style={[
                    styles.messageRow,
                    isMe ? styles.myMessageRow : styles.theirMessageRow
                ]}
            >
                {!isMe && (
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={32} color={colors.textSecondary} />
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessageBubble : styles.theirMessageBubble
                ]}>
                    {isMe && (
                        <LinearGradient
                            colors={colors.primaryGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                    <Text style={[
                        styles.messageText,
                        isMe ? styles.myMessageText : styles.theirMessageText
                    ]}>{item.text}</Text>
                    <Text style={[
                        styles.timeText,
                        isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.textSecondary }
                    ]}>{item.time}</Text>
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
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => alert('Call')} style={styles.callButton}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder={t('chat.placeholder')}
                        placeholderTextColor={colors.textDisabled}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
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
        paddingTop: 60,
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
    },
    headerTitle: {
        ...typography.h3,
        fontSize: 18,
        color: colors.textPrimary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    statusText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '10', // 10% opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.m,
        paddingBottom: spacing.xl,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: spacing.m,
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
    messageBubble: {
        maxWidth: '75%',
        padding: spacing.m,
        borderRadius: 20,
        overflow: 'hidden',
        ...shadows.subtle,
    },
    myMessageBubble: {
        borderBottomRightRadius: 4,
        backgroundColor: colors.primary, // Fallback
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
        ...typography.caption,
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
        includeFontPadding: false,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.m,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing.m,
    },
    attachButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: colors.background,
        borderRadius: 22,
        paddingHorizontal: spacing.m,
        marginRight: spacing.m,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.textPrimary,
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
        opacity: 0.5,
    },
});
