'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTelemetry } from './useTelemetry';

/**
 * 🖱️ useRageClickTracker Hook
 * Detects frequent clicks (3+ in < 1s) within a small radius (50px).
 * Indicator of user frustration or UI confusion.
 */
export function useRageClickTracker() {
    const { trackEvent } = useTelemetry();
    const pathname = usePathname();
    const clickHistoryRef = useRef<{ timestamp: number; x: number; y: number }[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const now = Date.now();
            const currentClick = { timestamp: now, x: e.clientX, y: e.clientY };
            
            // Add current click and filter for those within the last 1000ms
            clickHistoryRef.current = [...clickHistoryRef.current, currentClick].filter(
                click => now - click.timestamp < 1000
            );

            const recentClicks = clickHistoryRef.current;

            if (recentClicks.length >= 3) {
                // Check if all clicks are within a 50px radius of each other
                const firstClick = recentClicks[0];
                const isRage = recentClicks.every(click => {
                    const dist = Math.sqrt(
                        Math.pow(click.x - firstClick.x, 2) + Math.pow(click.y - firstClick.y, 2)
                    );
                    return dist < 50;
                });

                if (isRage) {
                    const target = e.target as HTMLElement;
                    trackEvent('RAGE_CLICK', {
                        path: pathname,
                        target_tag: target.tagName,
                        target_id: target.id || null,
                        target_class: target.className || null,
                        clicks_count: recentClicks.length
                    });
                    
                    // Clear history to prevent multiple triggers for the same rage session
                    clickHistoryRef.current = [];
                }
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [trackEvent, pathname]);
}
