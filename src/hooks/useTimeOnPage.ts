'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTelemetry } from './useTelemetry';

/**
 * ⏳ useTimeOnPage Hook
 * Calculates and tracks time spent on page before navigation or close.
 */
export function useTimeOnPage(metadata: { content_format?: string, word_count?: number } = {}) {
    const { trackEvent } = useTelemetry();
    const startTimeRef = useRef<number>(Date.now());
    const pathname = usePathname();

    useEffect(() => {
        const reportTime = () => {
            const endTime = Date.now();
            const seconds = Math.floor((endTime - startTimeRef.current) / 1000);
            
            if (seconds > 2) { // Minimum threshold to count as active engagement
                trackEvent('TIME_ON_PAGE', { 
                    seconds,
                    path: pathname,
                    ...metadata
                });
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                reportTime();
            } else {
                // Reset start time when coming back
                startTimeRef.current = Date.now();
            }
        };

        // For modern browsers during navigation/unload
        const handlePageHide = () => {
            reportTime();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);

        // Cleanup (SPA navigation)
        return () => {
            reportTime();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            // We don't reset startTime here because it will mount next
        };
    }, [trackEvent, pathname]);
}
