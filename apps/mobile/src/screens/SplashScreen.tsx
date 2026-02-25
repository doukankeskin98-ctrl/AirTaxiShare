import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';
import { colors, typography, spacing } from '../theme';
import * as Localization from 'expo-localization';
import i18n from '../i18n';
import { initAuthToken, UserService, saveUserProfile, setAuthToken, clearUserProfile } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_MATCH_KEY = '@active_match';

export default function SplashScreen() {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const initApp = async () => {
            // Set language
            const locale = Localization.getLocales()[0].languageCode;
            if (locale === 'tr' || locale === 'en') {
                await i18n.changeLanguage(locale);
            }

            // Check for saved token
            const token = await initAuthToken();

            if (token) {
                // Token exists → Validate it by fetching profile
                try {
                    const response = await UserService.getProfile();
                    await saveUserProfile(response.data);

                    // Check if there was an active match before app was killed
                    const activeMatchRaw = await AsyncStorage.getItem(ACTIVE_MATCH_KEY);
                    if (activeMatchRaw) {
                        try {
                            const activeMatch = JSON.parse(activeMatchRaw);
                            setTimeout(() => {
                                navigation.replace('MatchFound', {
                                    matchId: activeMatch.matchId,
                                    otherUser: activeMatch.otherUser,
                                    luggage: activeMatch.luggage,
                                });
                            }, 1000);
                            return; // Skip default Home navigation
                        } catch { /* Invalid JSON, ignore and go Home */ }
                    }

                    setTimeout(() => {
                        navigation.replace('Home');
                    }, 1500);
                } catch (error) {
                    // Token is invalid/expired → Clear and go to Welcome
                    await setAuthToken('');
                    await clearUserProfile();
                    setTimeout(() => {
                        navigation.replace('Welcome');
                    }, 1500);
                }
            } else {
                // No token → Go to Welcome
                setTimeout(() => {
                    navigation.replace('Welcome');
                }, 2500);
            }
        };

        initApp();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background, '#0A0A0A']}
                style={styles.background}
            />

            <View style={styles.content}>
                <MotiView
                    from={{ opacity: 0, scale: 0.8, translateY: 30 }}
                    animate={{
                        opacity: 1,
                        scale: [
                            { value: 1, type: 'spring' },
                            { value: 1.05, type: 'timing', duration: 1500, loop: true },
                            { value: 1, type: 'timing', duration: 1500 }
                        ] as any,
                        translateY: 0
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 } as any}
                    style={styles.logoContainer}
                >
                    <View style={styles.iconWrapper}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            style={styles.iconGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="airplane" size={48} color="#FFF" style={styles.planeIcon} />
                        </LinearGradient>
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.logoText}>Air</Text>
                        <Text style={styles.logoTextBold}>Taxi</Text>
                    </View>
                    <Text style={styles.subtitle}>{i18n.t('app.tagline')}</Text>
                </MotiView>

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 1000, delay: 600 } as any}
                    style={styles.loaderContainer}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </MotiView>
            </View>

            <View style={styles.footer}>
                <MotiView
                    from={{ opacity: 0, translateY: 50 }}
                    animate={{ opacity: 0.3, translateY: 0 }}
                    transition={{ type: 'timing', duration: 1500, delay: 200 } as any}
                >
                    <LinearGradient
                        colors={['transparent', colors.primary]}
                        style={styles.wave}
                    />
                </MotiView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 32,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: spacing.l,
        overflow: 'hidden',
    },
    iconGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    planeIcon: {
        transform: [{ rotate: '-45deg' }, { translateY: -2 }],
    },
    textWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 42,
        fontWeight: '300',
        color: '#FFF',
        letterSpacing: 1,
    },
    logoTextBold: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 1,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.s,
        letterSpacing: 0.5,
        opacity: 0.8,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 120,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        justifyContent: 'flex-end',
        zIndex: 1,
    },
    wave: {
        height: 80,
    },
});
