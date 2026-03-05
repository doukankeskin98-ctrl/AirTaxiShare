import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { colors, typography, spacing } from '../theme';
import { useTranslation } from 'react-i18next';

interface ProfileZoomModalProps {
    visible: boolean;
    imageUrl: string | null;
    userName: string;
    onClose: () => void;
}

export const ProfileZoomModal: React.FC<ProfileZoomModalProps> = ({
    visible,
    imageUrl,
    userName,
    onClose,
}) => {
    const { t } = useTranslation();

    // SECURITY: This native hook prevents screenshots while the modal is mounted
    // Does nothing on web, but on iOS/Android it blanks the screen or blocks the action entirely
    usePreventScreenCapture();

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFillObject}
                    onPress={onClose}
                    activeOpacity={1}
                />

                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 } as any}
                    style={styles.contentContainer}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={32} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageWrapper}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.fallbackContainer}>
                                <Ionicons name="person" size={80} color={colors.textSecondary} />
                            </View>
                        )}

                        {/* Security Overlay Badge */}
                        <View style={styles.securityBadge}>
                            <Ionicons name="shield-checkmark" size={14} color={colors.success} style={{ marginRight: 4 }} />
                            <Text style={styles.securityText}>
                                {t('common.anti_screenshot', { defaultValue: 'Ekran Görüntüsü Korumalı' })}
                            </Text>
                        </View>
                    </View>

                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200 } as any}
                        style={styles.userName}
                    >
                        {userName}
                    </MotiText>

                </MotiView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.l,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.surfaceLight,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 10,
    },
    header: {
        position: 'absolute',
        top: spacing.s,
        right: spacing.s,
        zIndex: 10,
    },
    closeButton: {
        padding: spacing.s,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.surface,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallbackContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    securityBadge: {
        position: 'absolute',
        bottom: spacing.m,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Success tint
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    securityText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '600',
    },
    userName: {
        ...typography.h2,
        textAlign: 'center',
        paddingVertical: spacing.l,
        color: colors.textPrimary,
    },
});
