'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTelemetry } from './useTelemetry';

/**
 * 👁️ useOmniscientMatrix Hook
 * Advanced behavioral sensors for qualitative UX research (Level 5+).
 * Tracks Hover Intent, Text Copy, TTFA (LCP-based), and Form Abandonment.
 */
export function useOmniscientMatrix() {
    const { trackEvent } = useTelemetry();
    const pathname = usePathname();
    
    // TTFA (Time to First Action) State
    const lcpTimeRef = useRef<number>(0);
    const firstActionTakenRef = useRef<boolean>(false);
    
    // Hover Intent State
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. LCP-based TTFA
        // ------------------------------------------
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcpTimeRef.current = lastEntry.startTime;
        });
        
        try {
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            // Older browsers fallback
            lcpTimeRef.current = performance.now();
        }

        const handleFirstAction = (e: MouseEvent | KeyboardEvent) => {
            if (firstActionTakenRef.current) return;
            
            // Only count "useful" actions (ignore simple scrolls or focus moves if possible)
            // But usually the first click/keypress is the indicator.
            const now = performance.now();
            const ttfa = now - lcpTimeRef.current;
            
            if (ttfa > 0) {
                trackEvent('FIRST_ACTION_TAKEN', { 
                    ms: Math.round(ttfa),
                    action_type: e.type,
                    target: (e.target as HTMLElement).tagName
                });
                firstActionTakenRef.current = true;
                // Cleanup listeners once done
                window.removeEventListener('click', handleFirstAction);
                window.removeEventListener('keydown', handleFirstAction);
            }
        };

        window.addEventListener('click', handleFirstAction);
        window.addEventListener('keydown', handleFirstAction);

        // 2. Text Copied (Value Extraction)
        // ------------------------------------------
        const handleCopy = () => {
            const selection = window.getSelection()?.toString();
            if (selection && selection.length > 10) {
                trackEvent('TEXT_COPIED', {
                    length: selection.length,
                    preview: selection.substring(0, 50) + '...',
                    path: pathname
                });
            }
        };
        window.addEventListener('copy', handleCopy);

        // 3. Hover Intent
        // ------------------------------------------
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const hasHoverIntent = target.closest('[data-telemetry-hover]');
            
            if (hasHoverIntent) {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => {
                    const el = hasHoverIntent as HTMLElement;
                    trackEvent('HOVER_INTENT', {
                        target_id: el.id || null,
                        target_text: el.innerText?.substring(0, 30),
                        path: pathname
                    });
                }, 2000);
            }
        };

        const handleMouseOut = () => {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
            }
        };

        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);

        // 4. Form Abandonment
        // ------------------------------------------
        // We look for elements that "close" something while data is present.
        const handleAbandonmentCheck = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Common close buttons or backdrop clicks
            if (target.closest('[data-telemetry-close]') || target.classList.contains('backdrop-blur-sm')) {
                const forms = document.querySelectorAll('[data-telemetry-form]');
                forms.forEach(form => {
                    const inputs = form.querySelectorAll('input, textarea');
                    let totalChars = 0;
                    inputs.forEach(input => {
                        totalChars += (input as HTMLInputElement).value?.length || 0;
                    });

                    if (totalChars > 10) {
                        trackEvent('FORM_ABANDONMENT', {
                            form_id: form.id || 'unknown',
                            chars_lost: totalChars,
                            path: pathname
                        });
                    }
                });
            }
        }
        window.addEventListener('click', handleAbandonmentCheck);

        return () => {
            lcpObserver.disconnect();
            window.removeEventListener('click', handleFirstAction);
            window.removeEventListener('keydown', handleFirstAction);
            window.removeEventListener('copy', handleCopy);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('click', handleAbandonmentCheck);
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, [trackEvent, pathname]);
}
