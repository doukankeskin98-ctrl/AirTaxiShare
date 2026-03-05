import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthService, setAuthToken } from '../services/api';
import { showAlert } from '../utils/alert';
import { colors, typography, spacing } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';

export default function VerifyScreen({ route, navigation }: any) {
    const { t } = useTranslation();
    const { phoneNumber } = route.params;
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length < 6) {
            showAlert(t('common.error', { defaultValue: 'Hata' }), t('verify.invalid_code_error', { defaultValue: 'Lütfen geçerli bir 6 haneli kod girin.' }));
            return;
        }
        setIsLoading(true);
        try {
            const response = await AuthService.verify(phoneNumber, code);
            const { accessToken } = response.data;
            await setAuthToken(accessToken);
            navigation.replace('ProfileSetup');
        } catch (error: any) {
            const msg = error?.message || t('verify.invalid_code', { defaultValue: 'Geçersiz doğrulama kodu.' });
            showAlert(t('verify.failed', { defaultValue: 'Doğrulama Başarısız' }), msg);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.content}
            >
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 15 } as any}
                    style={styles.header}
                >
                    <View style={styles.iconCircle}>
                        <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
                    </View>
                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={styles.title}
                    >
                        {t('verify.title', { defaultValue: 'Doğrulama' })}
                    </MotiText>
                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                        style={styles.subtitle}
                    >
                        {t('verify.subtitle', { defaultValue: 'Kod şuraya gönderildi:' })} {phoneNumber}
                    </MotiText>
                </MotiView>

                <PremiumCard variant="elevated" animate delay={500} style={styles.formCard}>
                    <PremiumInput
                        label={t('verify.code_label', { defaultValue: 'Doğrulama Kodu' })}
                        value={code}
                        onChangeText={setCode}
                        placeholder="123456"
                        leftIcon={<Ionicons name="keypad-outline" size={20} color={colors.textSecondary} />}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    <View style={styles.spacer} />

                    <PremiumButton
                        title={t('verify.button', { defaultValue: 'Doğrula' })}
                        onPress={handleVerify}
                        loading={isLoading}
                        icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
                    />

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.resendLink}>
                        <Text style={styles.resendText}>{t('verify.wrong_number', { defaultValue: 'Yanlış numara mı?' })}</Text>
                    </TouchableOpacity>
                </PremiumCard>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundLight },
    background: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    title: {
        ...typography.h1,
        color: colors.textInverse,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: colors.surface,
        padding: spacing.l,
        borderRadius: 24,
    },
    spacer: {
        height: spacing.l,
    },
    resendLink: {
        marginTop: spacing.m,
        alignItems: 'center',
    },
    resendText: {
        ...typography.body,
        color: colors.textSecondary,
        textDecorationLine: 'underline',
    }
});
