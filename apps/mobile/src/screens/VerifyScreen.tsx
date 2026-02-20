import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { AuthService, setAuthToken } from '../services/api';
import { colors, typography, spacing } from '../theme';
import { PremiumButton } from '../components/PremiumButton';
import { PremiumInput } from '../components/PremiumInput';
import { PremiumCard } from '../components/PremiumCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';

export default function VerifyScreen({ route, navigation }: any) {
    const { phoneNumber } = route.params;
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }
        setIsLoading(true);
        try {
            // Mock verify for now if API fails or for demo
            // const response = await AuthService.verify(phoneNumber, code);
            // const { accessToken } = response.data;
            // setAuthToken(accessToken);

            // For smoother demo if backend isn't ready:
            setTimeout(() => {
                navigation.replace('ProfileSetup'); // Navigate to setup instead of Home mostly
            }, 1000);

        } catch (error) {
            Alert.alert('Error', 'Invalid Code');
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
                        Verification
                    </MotiText>
                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400 }}
                        style={styles.subtitle}
                    >
                        Code sent to {phoneNumber}
                    </MotiText>
                </MotiView>

                <PremiumCard variant="elevated" animate delay={500} style={styles.formCard}>
                    <PremiumInput
                        label="Verification Code"
                        value={code}
                        onChangeText={setCode}
                        placeholder="123456"
                        leftIcon={<Ionicons name="keypad-outline" size={20} color={colors.textSecondary} />}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    <View style={styles.spacer} />

                    <PremiumButton
                        title="Verify"
                        onPress={handleVerify}
                        loading={isLoading}
                        icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
                    />

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.resendLink}>
                        <Text style={styles.resendText}>Wrong number?</Text>
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
