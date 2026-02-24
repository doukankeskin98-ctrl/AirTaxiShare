import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService, setAuthToken } from '../services/api';
import { showAlert } from '../utils/alert';
import { colors, typography, spacing } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: any) {
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSocialLoading, setIsSocialLoading] = useState(false);

    const handleLogin = async () => {
        if (phoneNumber.length < 10) {
            showAlert(t('common.error'), 'Please enter a valid phone number');
            return;
        }
        setIsLoading(true);
        try {
            await AuthService.login(phoneNumber);
            navigation.navigate('Verify', { phoneNumber });
        } catch (error) {
            showAlert(t('common.error'), 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_GOOGLE_CLIENT_ID',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_GOOGLE_CLIENT_ID',
    });

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                AuthService.googleLogin(authentication.accessToken)
                    .then(async res => {
                        if (res.data?.accessToken) {
                            await setAuthToken(res.data.accessToken);
                        }
                        navigation.replace('Home');
                    })
                    .catch(error => {
                        showAlert('Google Login Failed', error.message || 'Unknown error');
                    });
            }
        }
    }, [response]);

    const handleAppleLogin = async () => {
        setIsSocialLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            const res = await AuthService.appleLogin(
                credential.identityToken || '',
                credential.fullName?.givenName || 'AppleUser'
            );

            if (res.data?.accessToken) {
                await setAuthToken(res.data.accessToken);
            }
            navigation.replace('Home');
        } catch (error: any) {
            if (error.code !== 'ERR_REQUEST_CANCELED') {
                showAlert('Apple Login Failed', error.message || 'Unknown error');
            }
        } finally {
            setIsSocialLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSocialLoading(true);
        try {
            await promptAsync();
        } catch (error: any) {
            showAlert('Google Login Failed', error.message || 'Unknown error');
        } finally {
            setIsSocialLoading(false);
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
                        <Ionicons name="airplane" size={40} color={colors.primary} />
                    </View>
                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 } as any}
                        style={styles.title}
                    >
                        {t('login.title')}
                    </MotiText>
                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 } as any}
                        style={styles.subtitle}
                    >
                        {t('login.subtitle')}
                    </MotiText>
                </MotiView>

                <PremiumCard variant="elevated" animate delay={500} style={styles.formCard}>
                    <PremiumInput
                        label={t('login.placeholder')}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="+1 234 567 8900"
                        keyboardType="phone-pad"
                        leftIcon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
                    />

                    <View style={styles.spacer} />

                    <PremiumButton
                        title={t('login.button')}
                        onPress={handleLogin}
                        loading={isLoading}
                        icon={<Ionicons name="paper-plane-outline" size={20} color={colors.textInverse} />}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {Platform.OS === 'ios' && (
                        <PremiumButton
                            title="Continue with Apple"
                            onPress={handleAppleLogin}
                            loading={isSocialLoading}
                            variant="secondary"
                            icon={<Ionicons name="logo-apple" size={20} color={colors.textInverse} />}
                            style={{ marginBottom: spacing.m }}
                        />
                    )}

                    <PremiumButton
                        title="Continue with Google"
                        onPress={handleGoogleLogin}
                        loading={isSocialLoading}
                        variant="secondary"
                        icon={<Ionicons name="logo-google" size={20} color={colors.primary} />}
                    />
                </PremiumCard>

                <TouchableOpacity onPress={() => navigation.navigate('EmailAuth')} style={styles.emailLink}>
                    <Text style={styles.emailLinkText}>{t('auth.use_email', 'Or utilize Email for Sign In')}</Text>
                </TouchableOpacity>
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
    emailLink: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    emailLinkText: {
        ...typography.body,
        color: 'rgba(255,255,255,0.6)',
        textDecorationLine: 'underline',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.l,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...typography.caption,
        color: colors.textSecondary,
        paddingHorizontal: spacing.s,
    }
});
