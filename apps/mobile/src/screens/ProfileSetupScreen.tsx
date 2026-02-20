import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileSetupScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState<string | null>(null);

    // Consents
    const [tosAccepted, setTosAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [marketingAccepted, setMarketingAccepted] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleContinue = () => {
        if (!name) {
            Alert.alert('Error', t('profile.error.nameRequired'));
            return;
        }
        if (!image) {
            Alert.alert('Error', t('profile.error.photoRequired'));
            return;
        }
        // In a real app, strict consent checks might be here, but for demo we might relax or keep them
        if (!tosAccepted || !privacyAccepted) {
            Alert.alert('Error', 'Please accept mandatory consents.');
            return;
        }

        // Navigate to Home
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.backgroundLight, colors.background]}
                style={styles.background}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 100 } as any}
                    style={styles.introSection}
                >
                    <Text style={styles.subtitle}>{t('profile.subtitle')}</Text>
                </MotiView>

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
                    <Text style={styles.photoLabel}>{t('profile.photo.label')}</Text>
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

                <PremiumCard variant="default" animate delay={400} style={styles.consentCard}>
                    <Text style={styles.consentTitle}>{t('profile.consent.title')}</Text>
                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            label={t('profile.consent.tos')}
                            value={tosAccepted}
                            onChange={setTosAccepted}
                        />
                        <Checkbox
                            label={t('profile.consent.privacy')}
                            value={privacyAccepted}
                            onChange={setPrivacyAccepted}
                        />
                        <Checkbox
                            label={t('profile.consent.marketing.optional')}
                            value={marketingAccepted}
                            onChange={setMarketingAccepted}
                        />
                    </View>
                </PremiumCard>

                <View style={styles.spacer} />

                <PremiumButton
                    title={t('profile.continue')}
                    onPress={handleContinue}
                    icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
                />
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

const Checkbox = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
    <TouchableOpacity style={styles.checkboxRow} onPress={() => onChange(!value)} activeOpacity={0.8}>
        <MotiView
            animate={{
                backgroundColor: value ? colors.primary : 'transparent',
                borderColor: value ? colors.primary : colors.textSecondary
            }}
            transition={{ type: 'timing', duration: 200 } as any}
            style={[styles.checkbox]}
        >
            {value && <Ionicons name="checkmark" size={14} color={colors.textInverse} />}
        </MotiView>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundLight,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing.l,
        paddingBottom: spacing.m,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    content: {
        padding: spacing.l,
        paddingTop: spacing.s,
    },
    introSection: {
        marginBottom: spacing.l,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
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
    consentCard: {
        padding: spacing.l,
        marginBottom: spacing.l,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    consentTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.m,
        fontSize: 16,
    },
    checkboxContainer: {
        gap: spacing.m,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.s,
    },
    checkboxLabel: {
        ...typography.body,
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
        marginLeft: spacing.s,
    },
    spacer: {
        height: spacing.s,
    },
    bottomSpacer: {
        height: spacing.xxl,
    }
});
