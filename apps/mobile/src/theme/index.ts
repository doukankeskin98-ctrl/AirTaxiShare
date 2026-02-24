export const colors = {
    // Modern Trend: Deep Midnight / Obsidian
    background: '#0B0D17',      // Very deep blue/black
    surface: '#121421',         // Slightly lighter for depth
    surfaceLight: '#1E2136',    // For elevated cards

    // Modern Trend: Vibrant but mature Accents
    primary: '#4F46E5',         // Electric Violet
    secondary: '#0EA5E9',       // Ocean Blue

    // High-Contrast Text
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',   // Slate 400 (cooler grey)
    textInverse: '#1E1E24',
    textDisabled: '#475569',

    // Micro-Borders (Crucial for Glassmorphism)
    border: 'rgba(255, 255, 255, 0.1)',   // 1px inner glows
    divider: 'rgba(255, 255, 255, 0.05)',

    // Glassmorphism System
    overlay: 'rgba(11, 13, 23, 0.7)',     // Darkened background for modals
    glass: 'rgba(30, 33, 54, 0.4)',       // Core glass base (requires blur)
    glassHighlight: 'rgba(255, 255, 255, 0.03)', // Inner shine

    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // --- FALLBACKS FOR BACKWARDS COMPATIBILITY ---
    primaryDark: '#3730A3',
    primaryLight: '#818CF8',
    secondaryDark: '#0284C7',
    secondaryLight: '#38BDF8',
    backgroundLight: '#121421',
    overlayDark: 'rgba(11, 13, 23, 0.9)',
    glassDark: 'rgba(0, 0, 0, 0.2)',

    // Modern Dynamic Gradients
    gradientStart: '#4F46E5',
    gradientEnd: '#0EA5E9',
    primaryGradient: ['#4F46E5', '#0EA5E9'],
    secondaryGradient: ['#0EA5E9', '#10B981'],
    glassGradient: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.0)'],
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const typography = {
    // Inter / SF Pro aesthetic - crisp, tight, bold
    display: {
        fontSize: 44,
        fontWeight: '800' as const,
        color: colors.textPrimary,
        letterSpacing: -1.5,
        lineHeight: 52,
    },
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: colors.textPrimary,
        letterSpacing: -1,
        lineHeight: 40,
    },
    h2: {
        fontSize: 26,
        fontWeight: '600' as const,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: colors.textPrimary,
        letterSpacing: -0.25,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    bodyLarge: {
        fontSize: 18,
        fontWeight: '500' as const,
        color: colors.textPrimary,
        lineHeight: 26,
    },
    caption: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: colors.textSecondary,
        textTransform: 'uppercase' as const,
        letterSpacing: 1.5,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        letterSpacing: 0.2, // Small tracking for premium buttons
    },
};

export const shadows = {
    // Deep, colored shadow bounds
    subtle: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    card: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
        elevation: 8,
    },
    floating: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 16,
    },
    // Adding a glow for glass elements
    glow: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    }
};

export const layout = {
    radius: {
        s: 8,
        m: 16,          // Increased for bubblier glass boxes
        l: 24,          // Standard glass card
        xl: 36,         // Massive bottom sheet border radius
        round: 9999,
        button: 100,    // Fully rounded "Pill" shape (Huge modern trend)
        card: 24,
        input: 16,
    },
    headerHeight: 56,
    tabBarHeight: 88,
};
