'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetflixFeedProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function NetflixFeed({ title, icon, children }: NetflixFeedProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">
                        {title}
                    </h2>
                </div>
                
                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm"
                        aria-label="Rolar para esquerda"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm"
                        aria-label="Rolar para direita"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="relative group">
                {/* Gradient Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#FAFAFA] dark:from-[#121212] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FAFAFA] dark:from-[#121212] to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-6 pb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                    {children}
                </div>
            </div>
        </section>
    );
}
