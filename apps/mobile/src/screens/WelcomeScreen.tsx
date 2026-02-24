import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, useWindowDimensions, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, layout } from '../theme';
import { AuthService, setAuthToken } from '../services/api';
import { showAlert } from '../utils/alert';
import { PremiumButton } from '../components/PremiumButton';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Havalimanından\nTaksi Paylaş',
        description: 'Aynı yöne giden yolcularla tanış,\nmasrafı zahmetsizce bölüş.',
        icon: 'airplane',
        color: '#4F46E5', // Electric Violet
    },
    {
        id: '2',
        title: 'Saniyeler İçinde\nEşleşme Bul',
        description: 'Akıllı algoritmamızla aynı yöne giden\nyolcuları hemen haritada gör.',
        icon: 'people',
        color: '#0EA5E9', // Ocean Blue
    },
    {
        id: '3',
        title: 'Terminalde\nKolay Buluşma',
        description: 'Özel buluşma noktaları ve\nkarekod ile havalimanında anında buluş.',
        icon: 'location',
        color: '#10B981', // Emerald
    },
    {
        id: '4',
        title: 'Standart Üstü\nGüvenli Yolculuk',
        description: 'Doğrulanmış profiller, yolcu\ndeğerlendirmeleri ve 7/24 canlı destek.',
        icon: 'shield-checkmark',
        color: '#F59E0B', // Amber
    },
    {
        id: '5',
        title: 'Aracısız, Şeffaf\nÖdeme Sistemi',
        description: 'Uygulama üzerinden komisyon yok.\nÖdemeyi doğrudan taksiciye yapın.',
        icon: 'card',
        color: '#EC4899', // Pink
    },
];

export default function WelcomeScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { width: windowWidth } = useWindowDimensions();

    const [activeIndex, setActiveIndex] = useState(0);
    const [isSocialLoading, setIsSocialLoading] = React.useState(false);

    const handleEmailAuth = () => {
        navigation.navigate('EmailAuth');
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
                // Real integration
                AuthService.googleLogin(authentication.accessToken)
                    .then(async res => {
                        if (res.data?.accessToken) {
                            await setAuthToken(res.data.accessToken);
                        }
                        navigation.replace('Home');
                    })
                    .catch(error => {
                        showAlert('Login Failed', error.message || 'Google Auth Error');
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
                showAlert('Apple Login Failed', error.message);
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
            showAlert('Login Failed', error.message);
        } finally {
            setIsSocialLoading(false);
        }
    };

    const renderSlide = ({ index, item }: any) => {
        return (
            <View style={styles.slideContainer}>
                {/* Visual Art Composition */}
                <MotiView
                    from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 100 } as any}
                    style={styles.artContainer}
                >
                    {/* Ghost Background Icon for depth */}
                    <Ionicons
                        name={item.icon as any}
                        size={140}
                        color={item.color}
                        style={styles.ghostIcon}
                    />

                    {/* Foreground Glass Circle */}
                    <View style={styles.glassCircleWrapper}>
                        {Platform.OS === 'web' ? (
                            <View style={[styles.glassCircle, { backgroundColor: 'rgba(20,20,30,0.85)' }]}>
                                <View style={styles.glassCircleBorder} />
                                <Ionicons name={item.icon as any} size={48} color="#FFF" />
                            </View>
                        ) : (
                            <BlurView intensity={80} tint="dark" style={styles.glassCircle}>
                                <View style={styles.glassCircleBorder} />
                                <Ionicons name={item.icon as any} size={48} color="#FFF" />
                            </BlurView>
                        )}
                    </View>
                </MotiView>

                {/* Typography */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 } as any}
                    style={styles.textContainer}
                >
                    <Text style={styles.slideTitle}>{item.title}</Text>
                    <Text style={styles.slideDescription}>{item.description}</Text>
                </MotiView>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            {/* Base Dark Background */}
            <View style={StyleSheet.absoluteFillObject}>
                <View style={{ flex: 1, backgroundColor: colors.background }} />
            </View>

            {/* Dynamic Cross-Fading Aurora Backgrounds */}
            {SLIDES.map((slide, index) => {
                const isActive = index === activeIndex;
                return (
                    <MotiView
                        key={slide.id}
                        style={StyleSheet.absoluteFillObject}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ type: 'timing', duration: 800 } as any}
                        pointerEvents="none"
                    >
                        <LinearGradient
                            colors={[slide.color + '40', slide.color + '00']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 0.6 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        {/* Soft Glow Orb */}
                        <View style={[styles.glowOrb, { backgroundColor: slide.color + '30' }]} />
                    </MotiView>
                );
            })}

            <SafeAreaView style={styles.safeArea}>

                {/* Minimal Header */}
                <View style={styles.topBar}>
                    <Ionicons name="airplane" size={24} color="#FFF" />
                    <Text style={styles.logoText}>AirTaxi.</Text>
                </View>

                {/* The Main Carousel */}
                <View style={styles.carouselSection}>
                    <Carousel
                        key={`carousel-${windowWidth}`}
                        loop={true}
                        width={windowWidth}
                        height={400}
                        autoPlay={true}
                        autoPlayInterval={4500}
                        data={SLIDES}
                        onSnapToItem={(index) => setActiveIndex(index)}
                        renderItem={renderSlide}
                        mode={Platform.OS === 'web' ? 'parallax' : "parallax"}
                        modeConfig={{
                            parallaxScrollingScale: 0.9,
                            parallaxScrollingOffset: Platform.OS === 'web' ? 0 : 40,
                            parallaxAdjacentItemScale: 0.8,
                        }}
                        panGestureHandlerProps={{
                            activeOffsetX: [-10, 10],
                        }}
                    />

                    {/* Modern Elegant Pagination */}
                    <View style={styles.paginationContainer}>
                        {SLIDES.map((_, i) => (
                            <MotiView
                                key={i}
                                animate={{
                                    width: i === activeIndex ? 24 : 6,
                                    backgroundColor: i === activeIndex ? '#FFF' : 'rgba(255,255,255,0.2)',
                                }}
                                transition={{ type: 'spring', damping: 20, stiffness: 200 } as any}
                                style={styles.dot}
                            />
                        ))}
                    </View>
                </View>

                {/* The Frosted Glass Action Sheet */}
                <MotiView
                    from={{ opacity: 0, translateY: 80 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 150, delay: 300 } as any}
                    style={styles.sheetWrapper}
                >
                    {Platform.OS === 'web' ? (
                        <View style={[styles.glassSheet, { backgroundColor: 'rgba(20,20,30,0.85)' }]}>
                            {/* Ultra-subtle 1px Top Shine */}
                            <View style={styles.sheetTopHighlight} />

                            <PremiumButton
                                title="Email ile Devam Et"
                                onPress={handleEmailAuth}
                                icon={<Ionicons name="mail" size={20} color={colors.textPrimary} />}
                                variant="primary"
                                style={styles.actionButton}
                            />

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ya da</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialRow}>
                                <PremiumButton
                                    title="Apple"
                                    onPress={handleAppleLogin}
                                    loading={isSocialLoading}
                                    icon={<Ionicons name="logo-apple" size={22} color={colors.textPrimary} />}
                                    variant="glass"
                                    style={styles.socialHalfButton}
                                />
                                <View style={{ width: spacing.m }} />
                                <PremiumButton
                                    title="Google"
                                    onPress={handleGoogleLogin}
                                    loading={isSocialLoading}
                                    icon={<Ionicons name="logo-google" size={20} color={colors.textPrimary} />}
                                    variant="glass"
                                    style={styles.socialHalfButton}
                                />
                            </View>

                            <Text style={styles.disclaimer}>
                                Devam ederek Hizmet Şartlarımızı onaylamış olursunuz.
                            </Text>
                        </View>
                    ) : (
                        <BlurView intensity={60} tint="dark" style={styles.glassSheet}>
                            {/* ... Content ... */}
                            <View style={styles.sheetTopHighlight} />

                            <PremiumButton
                                title="Email ile Devam Et"
                                onPress={handleEmailAuth}
                                icon={<Ionicons name="mail" size={20} color={colors.textPrimary} />}
                                variant="primary"
                                style={styles.actionButton}
                            />

                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ya da</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialRow}>
                                <PremiumButton
                                    title="Apple"
                                    onPress={handleAppleLogin}
                                    loading={isSocialLoading}
                                    icon={<Ionicons name="logo-apple" size={22} color={colors.textPrimary} />}
                                    variant="glass"
                                    style={styles.socialHalfButton}
                                />
                                <View style={{ width: spacing.m }} />
                                <PremiumButton
                                    title="Google"
                                    onPress={handleGoogleLogin}
                                    loading={isSocialLoading}
                                    icon={<Ionicons name="logo-google" size={20} color={colors.textPrimary} />}
                                    variant="glass"
                                    style={styles.socialHalfButton}
                                />
                            </View>

                            <Text style={styles.disclaimer}>
                                Devam ederek Hizmet Şartlarımızı onaylamış olursunuz.
                            </Text>
                        </BlurView>
                    )}
                </MotiView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    glowOrb: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        top: -100,
        right: -100,
        // The blur effect for glowing is generally achieved by overlapping gradients, or in CSS filter: blur()
        // React Native requires large linear gradients effectively, but pure opacity shapes also provide a nice ambient light
    },
    safeArea: {
        flex: 1,
    },

    // Header
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginTop: spacing.m,
    },
    logoText: {
        ...typography.h3,
        color: '#FFF',
        fontWeight: '800',
        marginLeft: spacing.xs,
        letterSpacing: -0.5,
    },

    // Carousel Items
    carouselSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slideContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.l,
    },
    artContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    ghostIcon: {
        position: 'absolute',
        opacity: 0.15, // Creates a massive subtle deep shadow icon
        transform: [{ scale: 1.2 }, { translateY: -10 }],
    },
    glassCircleWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 10,
    },
    glassCircle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    glassCircleBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 50,
    },

    // Text
    textContainer: {
        alignItems: 'center',
        marginTop: spacing.m,
    },
    slideTitle: {
        ...typography.h1,
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        lineHeight: 38,
        letterSpacing: -0.5,
        marginBottom: spacing.m,
    },
    slideDescription: {
        ...typography.bodyLarge,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: spacing.m,
    },

    // Pagination
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
        marginTop: spacing.xl,
    },
    dot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },

    // Sheet
    sheetWrapper: {
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.xxl,
    },
    glassSheet: {
        borderRadius: layout.radius.xl,
        padding: spacing.xl,
        overflow: 'hidden',
        backgroundColor: 'rgba(12, 14, 25, 0.65)', // Super dark premium base
    },
    sheetTopHighlight: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionButton: {
        marginBottom: spacing.l,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.l,
    },
    dividerLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        paddingHorizontal: spacing.m,
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialHalfButton: {
        flex: 1,
    },
    disclaimer: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginTop: spacing.xl,
        letterSpacing: 0.2,
    },
});
