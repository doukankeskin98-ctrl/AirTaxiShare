import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, Dimensions, TouchableOpacity,
    FlatList, NativeScrollEvent, NativeSyntheticEvent, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../theme';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@onboarding_seen';

interface OnboardingPage {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    gradient: [string, string, string];
    accentGlow: string;
}

const pages: OnboardingPage[] = [
    {
        icon: 'people',
        iconColor: '#818CF8',
        gradient: ['#0B0D17', '#111336', '#0B0D17'],
        accentGlow: 'rgba(129,140,248,0.15)',
    },
    {
        icon: 'location',
        iconColor: '#34D399',
        gradient: ['#0B0D17', '#0A2520', '#0B0D17'],
        accentGlow: 'rgba(52,211,153,0.15)',
    },
    {
        icon: 'car-sport',
        iconColor: '#FBBF24',
        gradient: ['#0B0D17', '#1C1A0F', '#0B0D17'],
        accentGlow: 'rgba(251,191,36,0.15)',
    },
];

export default function OnboardingScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onDone = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        navigation.replace('Welcome');
    }, [navigation]);

    const onNext = useCallback(() => {
        if (currentIndex < pages.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            onDone();
        }
    }, [currentIndex, onDone]);

    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setCurrentIndex(idx);
    }, []);

    const renderPage = ({ item, index }: { item: OnboardingPage; index: number }) => {
        const isActive = index === currentIndex;
        return (
            <View style={styles.page}>
                <LinearGradient colors={item.gradient} style={StyleSheet.absoluteFill} />

                {/* Glow circle */}
                <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5 }}
                    transition={{ type: 'timing', duration: 600 } as any}
                    style={[styles.glowCircle, { backgroundColor: item.accentGlow }]}
                />

                {/* Icon */}
                <MotiView
                    from={{ opacity: 0, scale: 0.3, translateY: 40 }}
                    animate={{
                        opacity: isActive ? 1 : 0.3,
                        scale: isActive ? 1 : 0.6,
                        translateY: isActive ? 0 : 40,
                    }}
                    transition={{ type: 'spring', damping: 15, stiffness: 120, delay: 100 } as any}
                    style={styles.iconContainer}
                >
                    <View style={[styles.iconRing, { borderColor: item.iconColor + '30' }]}>
                        <View style={[styles.iconInner, { backgroundColor: item.iconColor + '15' }]}>
                            <Ionicons name={item.icon} size={64} color={item.iconColor} />
                        </View>
                    </View>
                </MotiView>

                {/* Step indicator */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 } as any}
                    style={styles.stepBadge}
                >
                    <Text style={[styles.stepText, { color: item.iconColor }]}>
                        {index + 1}/{pages.length}
                    </Text>
                </MotiView>

                {/* Title */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 30 }}
                    transition={{ type: 'spring', damping: 20, delay: 250 } as any}
                >
                    <Text style={styles.title}>
                        {t(`onboarding.page${index + 1}.title`)}
                    </Text>
                </MotiView>

                {/* Subtitle */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: isActive ? 1 : 0, translateY: isActive ? 0 : 20 }}
                    transition={{ type: 'spring', damping: 20, delay: 350 } as any}
                >
                    <Text style={styles.subtitle}>
                        {t(`onboarding.page${index + 1}.subtitle`)}
                    </Text>
                </MotiView>
            </View>
        );
    };

    const isLast = currentIndex === pages.length - 1;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={pages}
                renderItem={renderPage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScroll}
                keyExtractor={(_, i) => i.toString()}
                bounces={false}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            />

            {/* Bottom controls */}
            <View style={styles.bottomContainer}>
                {/* Dots */}
                <View style={styles.dotsRow}>
                    {pages.map((page, i) => (
                        <MotiView
                            key={i}
                            animate={{
                                width: i === currentIndex ? 28 : 8,
                                backgroundColor: i === currentIndex ? page.iconColor : colors.border,
                                opacity: i === currentIndex ? 1 : 0.4,
                            }}
                            transition={{ type: 'spring', damping: 18 } as any}
                            style={styles.dot}
                        />
                    ))}
                </View>

                {/* Buttons row */}
                <View style={styles.buttonsRow}>
                    {!isLast && (
                        <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
                            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={onNext} style={styles.nextBtn} activeOpacity={0.85}>
                        <LinearGradient
                            colors={isLast ? ['#818CF8', '#6D28D9'] : [colors.surface, colors.surface]}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        {isLast ? (
                            <Text style={styles.startText}>{t('onboarding.start')}</Text>
                        ) : (
                            <>
                                <Text style={styles.nextText}>{t('onboarding.next')}</Text>
                                <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    page: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    glowCircle: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        top: height * 0.18,
    },
    iconContainer: {
        marginBottom: spacing.xl,
    },
    iconRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepBadge: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 100,
        marginBottom: spacing.m,
    },
    stepText: {
        ...typography.caption,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: spacing.m,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
        fontSize: 16,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: spacing.m,
    },
    skipBtn: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    skipText: {
        ...typography.button,
        color: colors.textSecondary,
        fontSize: 15,
    },
    nextBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    nextText: {
        ...typography.button,
        color: colors.textPrimary,
        fontSize: 16,
    },
    startText: {
        ...typography.button,
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
