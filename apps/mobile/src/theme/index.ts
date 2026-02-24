// ─── AirTaxiShare Design System ──────────────────────────────────────────────
// Inspired by Uber, Lyft, and top-tier mobility apps.
// Philosophy: clean, purposeful, fast. No decoration for decoration's sake.

export const colors = {
    // ── Core Surfaces (clean dark, not "gamer purple") ──
    background: '#141414',      // True dark — like Uber app background
    surface: '#1C1C1C',         // Card surface
    surfaceElevated: '#242424', // Elevated modals, sheets
    surfaceBorder: '#2A2A2A',   // Subtle card borders (replace heavy blur borders)

    // ── Brand Accent (one primary color, used sparingly) ──
    primary: '#5B5EF4',         // Refined indigo — stronger than before
    primaryDark: '#4338CA',
    primaryLight: '#818CF8',
    primaryMuted: 'rgba(91,94,244,0.12)',   // For subtle tints on cards
    primaryBorder: 'rgba(91,94,244,0.25)', // For accent borders

    // ── Secondary (for successes, confirmations) ──
    secondary: '#0EA5E9',
    secondaryDark: '#0284C7',
    secondaryLight: '#38BDF8',

    // ── Text Hierarchy (strong contrast ratios — WCAG AA) ──
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',   // zinc-400 — clean gray, not warm/cool tinted
    textTertiary: '#71717A',    // zinc-500
    textInverse: '#141414',
    textDisabled: '#52525B',    // zinc-600

    // ── Borders & Dividers ──
    border: '#2A2A2A',
    borderLight: 'rgba(255,255,255,0.08)',
    divider: 'rgba(255,255,255,0.06)',

    // ── Status Colors ──
    success: '#22C55E',         // green-500 — cleaner than emerald
    successMuted: 'rgba(34,197,94,0.12)',
    error: '#EF4444',
    errorMuted: 'rgba(239,68,68,0.12)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245,158,11,0.12)',
    info: '#3B82F6',

    // ── Overlays ──
    overlay: 'rgba(0,0,0,0.7)',
    overlayLight: 'rgba(0,0,0,0.4)',

    // ── Legacy (keep for backward compat) ──
    surfaceLight: '#242424',
    backgroundLight: '#1C1C1C',
    overlayDark: 'rgba(0,0,0,0.85)',
    glass: 'rgba(28,28,28,0.95)',
    glassHighlight: 'rgba(255,255,255,0.04)',
    glassDark: 'rgba(0,0,0,0.6)',
    glassGradient: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.0)'] as [string, string],
    gradientStart: '#5B5EF4',
    gradientEnd: '#0EA5E9',
    primaryGradient: ['#5B5EF4', '#0EA5E9'] as [string, string],
    secondaryGradient: ['#0EA5E9', '#22C55E'] as [string, string],
};

// ── Spacing Scale (8pt grid) ─────────────────────────────────────────────────
export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

// ── Typography (tight, bold, purposeful) ─────────────────────────────────────
// Use negative letterSpacing for headline weight, positive for small labels
export const typography = {
    // Display: hero numbers, onboarding
    display: {
        fontSize: 40,
        fontWeight: '800' as const,
        color: colors.textPrimary,
        letterSpacing: -1.5,
        lineHeight: 48,
    },
    // H1: screen titles, large headings
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: colors.textPrimary,
        letterSpacing: -0.8,
        lineHeight: 36,
    },
    // H2: section titles
    h2: {
        fontSize: 22,
        fontWeight: '600' as const,
        color: colors.textPrimary,
        letterSpacing: -0.4,
        lineHeight: 30,
    },
    // H3: card titles, list items
    h3: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: colors.textPrimary,
        letterSpacing: -0.2,
        lineHeight: 24,
    },
    // Body: default content text
    body: {
        fontSize: 15,
        fontWeight: '400' as const,
        color: colors.textSecondary,
        lineHeight: 22,
        letterSpacing: 0,
    },
    bodyLarge: {
        fontSize: 17,
        fontWeight: '400' as const,
        color: colors.textPrimary,
        lineHeight: 26,
        letterSpacing: 0,
    },
    // Caption: labels, metadata
    caption: {
        fontSize: 12,
        fontWeight: '500' as const,
        color: colors.textTertiary,
        letterSpacing: 0.3,
        lineHeight: 16,
    },
    label: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: colors.textTertiary,
        letterSpacing: 0.8,
        textTransform: 'uppercase' as const,
        lineHeight: 14,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        letterSpacing: 0,
        lineHeight: 20,
    },
};

// ── Shadows (elevation system — Android-compatible) ──────────────────────────
export const shadows = {
    none: {},
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    floating: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 10,
    },
    glow: {
        shadowColor: '#5B5EF4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
};

// ── Layout Constants ──────────────────────────────────────────────────────────
export const layout = {
    radius: {
        xs: 4,
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        xxl: 32,
        round: 9999,
        button: 12,    // Uber uses slightly rounded, NOT pill-shaped by default
        card: 16,
        input: 12,
    },
    // Touch target minimum: 48pt
    touchTarget: 48,
    headerHeight: 56,
    tabBarHeight: 84,
    contentPadding: 20,
};
