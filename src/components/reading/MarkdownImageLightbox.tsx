'use client';

import React, { useState, useCallback, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTelemetry } from '@/hooks/useTelemetry';

/**
 * MarkdownImageLightbox
 * Wraps ReactMarkdown's rendered images in a full-screen click-to-zoom modal.
 * Usage: replace `img` in ReactMarkdown components prop.
 */
export function MarkdownImage({ src, alt, ...props }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const { trackEvent } = useTelemetry();
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        hoverTimerRef.current = setTimeout(() => {
            trackEvent('IMAGE_VIEW_DETAIL', { src, alt, trigger: 'hover_5s' });
        }, 5000);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    const handleClose = useCallback(() => setIsOpen(false), []);

    return (
        <>
            {/* Inline image — clickable to zoom */}
            <img
                src={src}
                alt={alt}
                className="cursor-zoom-in hover:opacity-90 transition-opacity rounded-xl"
                onClick={() => {
                    setIsOpen(true);
                    trackEvent('IMAGE_VIEW_DETAIL', { src, alt, trigger: 'click' });
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            />

            {/* Full-screen Lightbox */}
            <AnimatePresence>
                {isOpen && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out print:hidden"
                    >
                        <m.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            src={props.src}
                            alt={props.alt || ''}
                            className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        />
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label="Fechar"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
