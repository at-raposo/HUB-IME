'use client';

import React, { useState, useEffect } from 'react';

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                setProgress(Math.min(100, (scrollTop / docHeight) * 100));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-transparent print:hidden">
            <div
                className="h-full bg-gradient-to-r from-brand-blue via-brand-red to-brand-yellow transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
