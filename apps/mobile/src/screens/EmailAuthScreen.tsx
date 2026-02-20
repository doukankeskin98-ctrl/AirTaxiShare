import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

export default function EmailAuthScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (mode === 'signup') {
                navigation.navigate('ProfileSetup');
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            }
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.backgroundLight, colors.background]}
                style={styles.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <MotiView
                        from={{ opacity: 0, translateY: -20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200 }}
                        style={styles.header}
                    >
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {mode === 'signin' ? t('auth.signin') : t('auth.signup')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {mode === 'signin' ? 'Welcome back to AirTaxiShare' : 'Create an account to start flying'}
                        </Text>
                    </MotiView>

                    <PremiumCard variant="elevated" animate delay={400} style={styles.formCard}>
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'signin' && styles.activeTab]}
                                onPress={() => setMode('signin')}
                            >
                                <Text style={[styles.tabText, mode === 'signin' && styles.activeTabText]}>
                                    {t('auth.signin')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, mode === 'signup' && styles.activeTab]}
                                onPress={() => setMode('signup')}
                            >
                                <Text style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                                    {t('auth.signup')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputs}>
                            <PremiumInput
                                label={t('auth.label')}
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                            />

                            <PremiumInput
                                label={t('auth.password')}
                                placeholder="••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                            />

                            {mode === 'signin' && (
                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>{t('auth.forgot')}</Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.spacer} />

                            <PremiumButton
                                title={mode === 'signin' ? t('auth.signin') : t('auth.signup')}
                                onPress={handleAuth}
                                loading={isLoading}
                                icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
                            />
                        </View>
                    </PremiumCard>
                </ScrollView>
            </KeyboardAvoidingView>
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
        opacity: 0.8,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: spacing.l,
        paddingTop: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: spacing.l,
    },
    title: {
        ...typography.h1,
        color: colors.textInverse,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: 'rgba(255,255,255,0.7)',
    },
    formCard: {
        backgroundColor: colors.surface,
        padding: 0,
        overflow: 'hidden',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        margin: spacing.s,
        borderRadius: 12, // Inner radius
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        ...typography.body,
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    inputs: {
        padding: spacing.l,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: spacing.xs,
        marginBottom: spacing.m,
    },
    forgotText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    spacer: {
        height: spacing.s,
    },
});
