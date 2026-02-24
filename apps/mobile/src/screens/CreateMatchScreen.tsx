import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showAlert } from '../utils/alert';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import { BlurView } from 'expo-blur';

export default function CreateMatchScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();

    const [destination, setDestination] = useState<string | null>(null);
    const [time, setTime] = useState<string | null>(null);
    const [luggage, setLuggage] = useState<string>('medium');

    const destinationOptions = [
        { label: 'Maslak', value: 'maslak', subtitle: 'İş Merkezi', icon: 'business' },
        { label: 'Levent', value: 'levent', subtitle: 'Şehir Merkezi', icon: 'location' },
        { label: 'Ataşehir', value: 'atasehir', subtitle: 'Anadolu Yakası', icon: 'map' },
    ];

    const timeOptions = [
        { label: 'Hemen', value: '0' },
        { label: '+15 Dk', value: '15' },
        { label: '+30 Dk', value: '30' },
        { label: '+45 Dk', value: '45' },
    ];

    const luggageOptions = [
        { label: 'Küçük', value: 'small', subtitle: 'Kabin Boy', icon: 'briefcase-outline' },
        { label: 'Orta', value: 'medium', subtitle: 'Standart', icon: 'briefcase' },
        { label: 'Büyük', value: 'large', subtitle: 'Büyük Boy', icon: 'cube' },
    ];

    const handleSearch = () => {
        if (!destination || !time) {
            showAlert('Eksik Bilgi', 'Lütfen varış noktası ve zaman seçin.');
            return;
        }

        navigation.navigate('Queue', {
            destination,
            time,
            luggage,
        });
    };

    return (
        <View style={styles.container}>
            {/* Background Aurora Orbs */}
            <LinearGradient
                colors={['#1a1040', colors.background]}
                style={StyleSheet.absoluteFillObject}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ type: 'timing', duration: 2500, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: -50, right: -150, backgroundColor: colors.primary }]}
            />
            <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1.2 }}
                transition={{ type: 'timing', duration: 3500, loop: true, repeatReverse: true } as any}
                style={[styles.orb, { top: 300, left: -200, backgroundColor: colors.secondary }]}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <BlurView intensity={30} tint="dark" style={styles.backBlur}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </BlurView>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('create.title')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <MotiText
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={styles.pageTitle}
                >
                    Nereye gidiyorsun?
                </MotiText>

                {/* Destination Selection */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 100 } as any}
                >
                    <View style={styles.sectionWrapper}>
                        <Text style={styles.sectionTitle}>{t('create.step.destination')}</Text>
                        <View style={styles.optionsGrid}>
                            {destinationOptions.map((option) => {
                                const isSelected = destination === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setDestination(option.value)}
                                        activeOpacity={0.8}
                                        style={styles.optionWrapper}
                                    >
                                        <BlurView intensity={20} tint="dark" style={[
                                            styles.optionCard,
                                            isSelected && styles.optionCardSelected
                                        ]}>
                                            {isSelected && (
                                                <LinearGradient
                                                    colors={[colors.primary, 'transparent']}
                                                    style={styles.selectedOverlay}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 0, y: 1 }}
                                                />
                                            )}
                                            <View style={[styles.iconBox, isSelected && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                                                <Ionicons
                                                    name={option.icon as any}
                                                    size={28}
                                                    color={isSelected ? colors.textPrimary : colors.primaryLight}
                                                />
                                            </View>
                                            <Text style={[styles.optionLabel, isSelected && { color: colors.textPrimary }]}>{option.label}</Text>
                                            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                                        </BlurView>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </MotiView>

                {/* Time Selection */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 200 } as any}
                >
                    <View style={styles.sectionWrapper}>
                        <Text style={styles.sectionTitle}>{t('create.step.time')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {timeOptions.map((option) => {
                                const isSelected = time === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setTime(option.value)}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                    >
                                        {isSelected && (
                                            <LinearGradient
                                                colors={colors.primaryGradient}
                                                style={StyleSheet.absoluteFillObject}
                                            />
                                        )}
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </MotiView>

                {/* Luggage Selection */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300 } as any}
                >
                    <View style={styles.sectionWrapper}>
                        <Text style={styles.sectionTitle}>{t('create.step.luggage')}</Text>
                        <View style={styles.luggageGrid}>
                            {luggageOptions.map((option) => {
                                const isSelected = luggage === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setLuggage(option.value)}
                                        activeOpacity={0.8}
                                        style={styles.luggageOptionWrapper}
                                    >
                                        <BlurView intensity={20} tint="dark" style={[styles.luggageOptionCard, isSelected && styles.luggageOptionSelected]}>
                                            <View style={[styles.luggageIconBox, isSelected && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                                                <Ionicons
                                                    name={option.icon as any}
                                                    size={24}
                                                    color={isSelected ? colors.textPrimary : colors.textSecondary}
                                                />
                                            </View>
                                            <Text style={[styles.luggageText, isSelected && { color: colors.textPrimary, fontWeight: '700' }]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.luggageSubtitle}>
                                                {option.subtitle}
                                            </Text>
                                        </BlurView>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </MotiView>

                {/* Footer Action */}
                <View style={styles.footerSpacer} />
            </ScrollView>

            <MotiView
                style={styles.footer}
                from={{ translateY: 150 }}
                animate={{ translateY: 0 }}
                transition={{ delay: 400, type: 'spring' } as any}
            >
                <BlurView intensity={40} tint="dark" style={styles.footerBlur}>
                    <View style={styles.footerHighlight} />
                    <PremiumButton
                        title={t('create.cta.findMatch')}
                        onPress={handleSearch}
                        disabled={!destination || !time}
                        icon={<Ionicons name="search" size={20} color="#FFF" />}
                        style={styles.findButton}
                    />
                </BlurView>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    orb: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.3,
        transform: [{ scale: 1.5 }],
        filter: 'blur(90px)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.m,
        paddingTop: 60,
        paddingBottom: spacing.m,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    backBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    content: {
        padding: spacing.m,
    },
    pageTitle: {
        ...typography.h1,
        marginBottom: spacing.l,
        color: colors.textPrimary,
        fontSize: 32,
    },
    sectionWrapper: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 18,
        marginBottom: spacing.m,
        color: colors.textPrimary,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
    },
    optionWrapper: {
        width: '47%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    optionCard: {
        padding: spacing.l,
        alignItems: 'center',
        backgroundColor: 'rgba(24, 26, 43, 0.4)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        minHeight: 140,
        justifyContent: 'center',
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    optionLabel: {
        ...typography.body,
        fontWeight: '600',
        marginBottom: 2,
        color: colors.textSecondary,
    },
    optionSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        opacity: 0.7,
    },
    chipScroll: {
        gap: spacing.m,
        paddingBottom: spacing.s,
    },
    chip: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        borderRadius: 100,
        backgroundColor: 'rgba(24, 26, 43, 0.6)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        overflow: 'hidden',
        minHeight: 44,
        justifyContent: 'center',
    },
    chipSelected: {
        borderColor: colors.primary,
        borderWidth: 0,
    },
    chipText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    chipTextSelected: {
        color: '#FFF',
        fontWeight: '700',
    },
    luggageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.s,
    },
    luggageOptionWrapper: {
        width: '31%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    luggageOptionCard: {
        alignItems: 'center',
        padding: spacing.m,
        backgroundColor: 'rgba(24, 26, 43, 0.4)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        minHeight: 120,
        justifyContent: 'center',
    },
    luggageOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
    },
    luggageIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    luggageText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    luggageSubtitle: {
        ...typography.caption,
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 2,
        opacity: 0.7,
        textAlign: 'center',
    },
    footerSpacer: {
        height: 140,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
    },
    footerBlur: {
        padding: spacing.l,
        paddingBottom: 40,
        paddingTop: spacing.xl,
        backgroundColor: 'rgba(10, 12, 20, 0.8)',
    },
    footerHighlight: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    findButton: {
        width: '100%',
        height: 60,
    },
});
