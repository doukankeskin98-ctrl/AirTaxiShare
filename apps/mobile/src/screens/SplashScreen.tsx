import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';
import { colors, typography, spacing } from '../theme';
import * as Localization from 'expo-localization';
import i18n from '../i18n';

export default function SplashScreen() {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const initText = async () => {
            const locale = Localization.getLocales()[0].languageCode;
            if (locale === 'tr' || locale === 'en') {
                await i18n.changeLanguage(locale);
            }

            setTimeout(() => {
                navigation.replace('Welcome');
            }, 2500);
        };

        initText();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.backgroundLight, '#000830']}
                style={styles.background}
            />
            <View style={styles.content}>
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 15 } as any}
                >
                    <Text style={styles.logo}>AirTaxiShare</Text>
                </MotiView>

                <MotiText
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 1000, delay: 500 } as any}
                    style={styles.tagline}
                >
                    {i18n.t('app.tagline')}
                </MotiText>
            </View>

            <View style={styles.footer}>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ type: 'timing', duration: 2000 } as any}
                >
                    <LinearGradient
                        colors={['transparent', colors.primary + '40']}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        alignItems: 'center',
        zIndex: 2,
    },
    logo: {
        fontSize: 48, // Larger
        fontWeight: '800',
        color: colors.textInverse,
        marginBottom: spacing.m,
        letterSpacing: 2,
        textShadowColor: colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    tagline: {
        ...typography.body,
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: 'flex-end',
    },
    wave: {
        height: 100,
        opacity: 0.5,
    },
});
