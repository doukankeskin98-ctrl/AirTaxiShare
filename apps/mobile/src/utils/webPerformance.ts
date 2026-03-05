/**
 * Web Performance Optimizations
 *
 * Moti/Reanimated animations run JS-driven on web (vs GPU on native),
 * causing jank. This module configures global defaults to keep web smooth
 * without touching any screen files or degrading native quality.
 */
import { Platform } from 'react-native';

/**
 * On web, reduce CSS transition/animation durations globally.
 * This affects the Reanimated web polyfill which uses CSS transitions.
 */
export function applyWebPerformanceOptimizations() {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // Inject a global CSS rule that speeds up all CSS transitions & animations
    // on Reanimated/Moti web elements, reducing perceived jank
    const style = document.createElement('style');
    style.textContent = `
        /* Speed up all Moti/Reanimated CSS transitions on web */
        [data-moti], [style*="transition"], [style*="transform"] {
            transition-duration: 0.15s !important;
            animation-duration: 0.2s !important;
        }

        /* Optimize rendering performance */
        * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Force GPU compositing for animated elements */
        [data-moti] {
            will-change: transform, opacity;
            transform: translateZ(0);
        }

        /* Reduce blur intensity on web (very expensive) */
        .css-view-175oi2r[style*="blur"] {
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
        }

        /* Smooth scrolling */
        * {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
    `;
    document.head.appendChild(style);
}
