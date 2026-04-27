'use client';

import { useEffect, useRef } from 'react';
import { useTelemetry } from './useTelemetry';

/**
 * 📜 useScrollTracker Hook
 * Tracks 50% and 100% scroll depth once per page view.
 */
export function useScrollTracker() {
    const { trackEvent } = useTelemetry();
    const hasTracked50 = useRef(false);
    const hasTracked90 = useRef(false);
    const hasTracked100 = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            if (typeof window === 'undefined') return;

            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercent = (scrollY + windowHeight) / documentHeight * 100;

            if (scrollPercent >= 50 && !hasTracked50.current) {
                trackEvent('SCROLL_50');
                hasTracked50.current = true;
            }

            if (scrollPercent >= 90 && !hasTracked90.current) {
                trackEvent('SCROLL_90');
                hasTracked90.current = true;
            }

            if (scrollPercent >= 98 && !hasTracked100.current) { // 98% because 100% is hard to hit
                trackEvent('SCROLL_100');
                hasTracked100.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [trackEvent]);

    // Reset tracking on mount (useful for SPA navigation if handleScroll is in a component that remounts)
}
