import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumCard } from '../components/PremiumCard';
import { ATSHeader } from '../components/ATS/ATSHeader';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import { UserService, saveUserProfile, loadUserProfile } from '../services/api';
import { showAlert } from '../utils/alert';

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load
    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await loadUserProfile();
            if (profile) {
                setName(profile.fullName || '');
                setPhone(profile.phoneNumber || '');
                setImage(profile.photoUrl || null);
            }
        };
        fetchProfile();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                // Store as data URI for persistence across sessions
                setImage(`data:image/jpeg;base64,${asset.base64}`);
            } else {
                // Fallback to file URI
                setImage(asset.uri);
            }
        }
    };



    const handleSave = async () => {
        if (!name) {
            showAlert('Error', t('profile.error.nameRequired'));
            return;
        }

        setIsLoading(true);
        try {
            // Save profile to backend
            const response = await UserService.updateProfile({
                fullName: name,
                phoneNumber: phone || undefined,
                photoUrl: image || undefined, // Photo is optional
            });

            // Cache profile locally
            await saveUserProfile(response.data);

            showAlert('', t('settings.success'));
            navigation.goBack();
        } catch (error: any) {
            showAlert(t('settings.error'), error.response?.data?.message || error.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.backgroundLight, colors.background]}
                style={styles.background}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ATSHeader title={t('settings.editProfile')} />

                    <ScrollView contentContainerStyle={styles.content}>

                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 200 } as any}
                            style={styles.avatarSection}
                        >
                            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                                {image ? (
                                    <Image source={{ uri: image }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="camera" size={32} color={colors.textSecondary} />
                                    </View>
                                )}
                                <View style={styles.editIcon}>
                                    <Ionicons name="add" size={20} color={colors.textInverse} />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.photoLabel}>{t('settings.changePhoto')}</Text>
                        </MotiView>

                        <PremiumCard variant="elevated" animate delay={300} style={styles.formCard}>
                            <PremiumInput
                                label={t('profile.name.label')}
                                value={name}
                                onChangeText={setName}
                                placeholder="John Doe"
                                leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
                            />

                            <PremiumInput
                                label={t('profile.phone.label')}
                                helper={t('profile.phone.helper')}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="+90 5XX XXX XX XX"
                                leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                            />
                        </PremiumCard>

                        <View style={styles.spacer} />

                        <PremiumButton
                            title={t('settings.save')}
                            onPress={handleSave}
                            loading={isLoading}
                            icon={<Ionicons name="save-outline" size={20} color={colors.textInverse} />}
                        />
                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundLight,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    content: {
        padding: spacing.l,
        paddingTop: spacing.s,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.s,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    editIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.background,
    },
    photoLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    formCard: {
        padding: spacing.l,
        marginBottom: spacing.l,
        backgroundColor: colors.surface,
        borderRadius: 20,
    },
    spacer: {
        height: spacing.s,
    },
    bottomSpacer: {
        height: spacing.xxl,
    }
});
