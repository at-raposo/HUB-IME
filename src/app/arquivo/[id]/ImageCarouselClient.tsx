'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useTelemetry } from '@/hooks/useTelemetry';

interface Slide {
    type: 'image' | 'markdown';
    content: string;
}

export function ImageCarouselClient({ urls, title, slides }: { urls: string[], title: string, slides?: Slide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { trackEvent } = useTelemetry();
    const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const minSwipeDistance = 50;

    // V4.0 Hardening: If slides are provided, use them. Otherwise, fallback to legacy urls.
    const displayItems: Slide[] = slides || urls.map(url => ({ type: 'image', content: url }));

    const handleMouseEnter = (content: string) => {
        hoverTimerRef.current = setTimeout(() => {
            trackEvent('IMAGE_VIEW_DETAIL', { src: content, title, trigger: 'hover_5s', gallery: true });
        }, 5000);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    const nextImage = (trigger: string = 'carousel_nav') => {
        const next = (currentIndex + 1) % displayItems.length;
        setCurrentIndex(next);
        const item = displayItems[next];
        if (item.type === 'image') {
            trackEvent('IMAGE_VIEW_DETAIL', { src: item.content, title, trigger, index: next, gallery: true });
        }
    };
    const prevImage = (trigger: string = 'carousel_nav') => {
        const prev = (currentIndex - 1 + displayItems.length) % displayItems.length;
        setCurrentIndex(prev);
        const item = displayItems[prev];
        if (item.type === 'image') {
            trackEvent('IMAGE_VIEW_DETAIL', { src: item.content, title, trigger, index: prev, gallery: true });
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartX.current || !touchStartY.current) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const distanceX = touchStartX.current - touchEndX;
        const distanceY = touchStartY.current - touchEndY;

        // Only trigger if horizontal swipe is dominant
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
            if (distanceX > 0) {
                nextImage('swipe');
            } else {
                prevImage('swipe');
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (displayItems.length === 0) {
        return <span className="text-white">Conteúdo não disponível</span>;
    }

    const currentItem = displayItems[currentIndex];

    return (
        <div 
            className="relative w-full h-full flex items-center justify-center min-h-[300px] md:min-h-[500px] bg-black/20 rounded-3xl overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {currentItem.type === 'image' ? (
                <img
                    src={currentItem.content}
                    alt={`${title} - ${currentIndex + 1}`}
                    className="w-full h-full object-contain max-h-[70vh] transition-opacity duration-300 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(currentItem.content)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => trackEvent('IMAGE_VIEW_DETAIL', { src: currentItem.content, title, trigger: 'click', gallery: true })}
                />
            ) : (
                <div className="w-full h-full p-8 md:p-16 flex items-center justify-center overflow-y-auto max-h-[70vh]">
                    <div className="prose prose-invert prose-lg max-w-none w-full text-center slide-content font-display">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {currentItem.content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {displayItems.length > 1 && (
                <>
                    <button
                        onClick={() => prevImage()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110 z-20"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                    </button>
                    <button
                        onClick={() => nextImage()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110 z-20"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                    </button>

                    <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md z-20">
                        {displayItems.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
