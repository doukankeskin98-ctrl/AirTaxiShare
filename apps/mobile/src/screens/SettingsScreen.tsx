import React from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { ATSHeader } from '../components/ATS/ATSHeader';
import { ATSOptionList } from '../components/ATS/ATSOptionList';
import { ATSButton } from '../components/ATS/ATSButton';
import { ATSCard } from '../components/ATS/ATSCard';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    // Mock language state - should be persistent
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
                    text: 'Log Out', style: 'destructive', onPress: () => {
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
                    text: 'Delete', style: 'destructive', onPress: () => {
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
