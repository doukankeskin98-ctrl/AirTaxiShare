import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { ATSHeader } from '../components/ATS/ATSHeader';
import { ATSOptionList } from '../components/ATS/ATSOptionList';
import { ATSButton } from '../components/ATS/ATSButton';
import { ATSCard } from '../components/ATS/ATSCard';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { setAuthToken, clearUserProfile, loadUserProfile } from '../services/api';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [user, setUser] = useState<any>(null);

    // Load the user profile
    useFocusEffect(
        React.useCallback(() => {
            const load = async () => {
                const profile = await loadUserProfile();
                if (profile) setUser(profile);
            };
            load();
        }, [])
    );

    const currentLang = i18n.language || 'en';

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const handleLogout = () => {
        Alert.alert(
            t('settings.logout'),
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out', style: 'destructive', onPress: async () => {
                        await setAuthToken('');
                        await clearUserProfile();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.deleteAccount'),
            'This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        await setAuthToken('');
                        await clearUserProfile();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }],
                        });
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ATSHeader title={t('settings.title')} />

            <View style={styles.content}>
                {/* Profile Info Card */}
                {user && (
                    <ATSCard title="Profil">
                        <View style={styles.profileSection}>
                            <View style={styles.avatarWrapper}>
                                {user.photoUrl ? (
                                    <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Ionicons name="person" size={32} color={colors.textSecondary} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user.fullName || 'İsimsiz'}</Text>
                                <Text style={styles.profileDetail}>{user.email || ''}</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="star" size={14} color={colors.warning} />
                                        <Text style={styles.statText}>{user.rating?.toFixed(1) || '5.0'}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons name="car" size={14} color={colors.primary} />
                                        <Text style={styles.statText}>{user.tripsCompleted || 0} yolculuk</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ATSCard>
                )}

                <ATSCard title={t('settings.language.title')}>
                    <ATSOptionList
                        options={[
                            { label: t('settings.language.tr'), value: 'tr' },
                            { label: t('settings.language.en'), value: 'en' },
                        ]}
                        selectedValue={currentLang}
                        onSelect={changeLanguage}
                    />
                </ATSCard>

                <ATSCard title={t('settings.legal')}>
                    <SettingsItem
                        label={t('settings.tos')}
                        onPress={() => navigation.navigate('Legal', { type: 'tos' })}
                    />
                    <SettingsItem
                        label={t('settings.privacy')}
                        onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                    />
                </ATSCard>

                <ATSCard title={t('settings.account')}>
                    <ATSButton
                        title={t('settings.logout')}
                        onPress={handleLogout}
                        variant="secondary"
                        style={styles.actionBtn}
                        textStyle={{ color: colors.error, fontWeight: 'normal' }}
                    />
                    <ATSButton
                        title={t('settings.deleteAccount')}
                        onPress={handleDeleteAccount}
                        variant="ghost"
                        style={styles.actionBtn}
                        textStyle={{ color: colors.textSecondary, fontSize: 14 }}
                    />
                </ATSCard>
            </View>
        </View>
    );
}

const SettingsItem = ({ label, onPress }: { label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <Text style={styles.itemText}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.m,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.m,
    },
    avatarWrapper: {
        marginRight: spacing.m,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    profileDetail: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemText: {
        ...typography.body,
    },
    actionBtn: {
        marginBottom: spacing.s,
        borderWidth: 0,
    },
});
