'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, MessageSquare, Zap } from 'lucide-react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { FluxoView } from './FluxoView';
import { LogsView } from './LogsView';
import { MediaCardProps } from '@/components/MediaCard';
import { HubHeader } from './HubHeader';

interface ComunidadeClientProps {
    initialFluxoData: {
        items: MediaCardProps[];
        hasMore: boolean;
        trendingItems: MediaCardProps[];
        featuredItems: MediaCardProps[];
    };
}

type Tab = 'mural' | 'updates';

export function ComunidadeClient({ initialFluxoData }: ComunidadeClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { trackEvent } = useTelemetry();
    
    const tabParam = searchParams.get('tab') as Tab;
    const [activeTab, setActiveTab] = useState<Tab>(tabParam === 'updates' ? 'updates' : 'mural');

    // Telemetry: Time on Tab
    const tabStartTimeRef = useRef<number>(Date.now());
    
    // Telemetry: Rage Click Detection
    const clickCountRef = useRef(0);
    const lastClickTimeRef = useRef(0);

    const handleTabChange = (newTab: Tab) => {
        if (newTab === activeTab) return;

        // Track time spent on previous tab
        const timeSpent = Math.round((Date.now() - tabStartTimeRef.current) / 1000);
        trackEvent('TIME_ON_PAGE', { 
            tab: activeTab, 
            duration_seconds: timeSpent,
            context: 'comunidade_hub'
        });

        // Track tab change
        trackEvent('TAB_CHANGE', { 
            from: activeTab, 
            to: newTab,
            context: 'comunidade_hub'
        });

        setActiveTab(newTab);
        tabStartTimeRef.current = Date.now();

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', newTab);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Track final time on component unmount
    useEffect(() => {
        return () => {
            const timeSpent = Math.round((Date.now() - tabStartTimeRef.current) / 1000);
            trackEvent('TIME_ON_PAGE', { 
                tab: activeTab, 
                duration_seconds: timeSpent,
                context: 'comunidade_hub_unmount'
            });
        };
    }, [activeTab]);

    // Handle initial param sync if it changes externally
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
            tabStartTimeRef.current = Date.now();
        }
    }, [tabParam]);

    // Rage Click Detection Global Listener for this Hub
    useEffect(() => {
        const handleClick = () => {
            const now = Date.now();
            if (now - lastClickTimeRef.current < 500) {
                clickCountRef.current += 1;
            } else {
                clickCountRef.current = 1;
            }
            lastClickTimeRef.current = now;

            if (clickCountRef.current > 4) {
                trackEvent('RAGE_CLICK', { 
                    tab: activeTab, 
                    clicks: clickCountRef.current,
                    context: 'comunidade_hub'
                });
                clickCountRef.current = 0; // Reset after tracking
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-transparent pt-2">
            {/* Tab Navigation */}
            <div className="sticky top-16 z-50 flex justify-center pb-4 pt-1">
                <div className="flex p-1.5 bg-white/50 dark:bg-black/40 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                    <button
                        onClick={() => handleTabChange('mural')}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black font-bukra uppercase tracking-widest transition-all ${
                            activeTab === 'mural' ? 'text-white' : 'text-gray-500 hover:text-brand-blue'
                        }`}
                    >
                        {activeTab === 'mural' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-brand-blue rounded-xl shadow-lg shadow-brand-blue/20"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${activeTab === 'mural' ? 'animate-pulse' : ''}`} />
                            Fluxo
                        </span>
                    </button>

                    <button
                        onClick={() => handleTabChange('updates')}
                        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black font-bukra uppercase tracking-widest transition-all ${
                            activeTab === 'updates' ? 'text-white' : 'text-gray-500 hover:text-brand-red'
                        }`}
                    >
                        {activeTab === 'updates' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-brand-red rounded-xl shadow-lg shadow-brand-red/20"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <MessageSquare className={`w-4 h-4 ${activeTab === 'updates' ? 'animate-bounce' : ''}`} />
                            Logs
                        </span>
                    </button>
                </div>
            </div>

            <HubHeader />

            {/* Content Area */}
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'mural' ? (
                        <motion.div
                            key="mural"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <FluxoView 
                                initialItems={initialFluxoData.items}
                                initialHasMore={initialFluxoData.hasMore}
                                trendingItems={initialFluxoData.trendingItems}
                                featuredItems={initialFluxoData.featuredItems}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="updates"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <LogsView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
