"use client";

import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { MediaCardProps } from '../MediaCard';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { withEliteBoundary } from '../shared/EliteErrorBoundary';
import { Map as MapIcon, X, ArrowRight, PlayCircle, Image as ImageIcon } from 'lucide-react';

interface CampusMapProps {
    items: MediaCardProps[];
}

const CampusMapBase = ({ items }: CampusMapProps) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const lastMapClicksRef = useRef<Record<string, number>>({});

    // Filter items that have coordinates
    const pinnedItems = items.filter(item => item.post.location_lat && item.post.location_lng);

    const selectedItem = pinnedItems.find(i => i.post.id === selectedId);

    return (
        <div className="w-full h-full aspect-square relative bg-gray-50 dark:bg-[#1E1E1E] group">
            
            {/* Legend / Overlay - Repositioned to Bottom Left */}
            <div className="absolute bottom-6 left-6 z-30 space-y-2 pointer-events-none">
                <m.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-3 rounded-xl glass-card border border-white/10 shadow-2xl backdrop-blur-md"
                >
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-0.5">
                        <MapIcon className="w-4 h-4 text-brand-blue" />
                        Mapa IFUSP 2025
                    </h3>
                    <p className="text-[8px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                        Geolocalização Ativa
                    </p>
                </m.div>
            </div>

            {/* Interactive Image Map */}
            <m.img
                src="/mapa-ifusp-2025.jpg"
                alt="Mapa IFUSP 2025"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full object-contain transition-all duration-700 select-none pointer-events-none"
            />
            
            {/* Map Overlay Filter - Subtler */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 to-transparent dark:from-white/5" />
            <div className="absolute inset-0 bg-brand-blue/5 mix-blend-overlay pointer-events-none z-10" />

            {/* Container for Event Delegation */}
            <div
                className="absolute inset-0 z-20"
                onClick={(e) => {
                    const pin = (e.target as HTMLElement).closest('[data-pin-id]');
                    if (pin) {
                        const id = pin.getAttribute('data-pin-id');
                        if (id) {
                            setSelectedId(id);
                            const item = pinnedItems.find(i => i.post.id === id);
                            if (item?.post.location_name) {
                                const buildingId = item.post.location_name;
                                const lastClick = lastMapClicksRef.current[buildingId] || 0;
                                const now = Date.now();
                                if (now - lastClick > 5000) {
                                    lastMapClicksRef.current[buildingId] = now;
                                    supabase.from('map_interactions').insert({
                                        building_id: buildingId,
                                        interaction_type: 'click'
                                    }).then(({ error }) => {
                                        if (error) console.error('Heatmap telemetry error:', error);
                                    });
                                }
                            }
                        }
                    }
                }}
            >
                {/* Pins */}
                {pinnedItems.map((item) => {
                    const x = (item.post.location_lng! / 100) * 1000;
                    const y = (item.post.location_lat! / 100) * 600;

                    return (
                        <m.div
                            key={item.post.id}
                            data-pin-id={item.post.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.2, zIndex: 30 }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer size-8 flex items-center justify-center rounded-full border-2 border-white dark:border-[#1E1E1E] shadow-xl transition-all ${selectedId === item.post.id ? 'bg-brand-red ring-4 ring-brand-red/20' : 'bg-brand-blue ring-4 ring-brand-blue/20'}`}
                            style={{ left: `${(x / 10)}%`, top: `${(y / 6)}%` }}
                        >
                            <m.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute inset-0 rounded-full ${selectedId === item.post.id ? 'bg-brand-red' : 'bg-brand-blue'}`}
                            />
                            {item.post.mediaType === 'video' ? <PlayCircle className="w-4 h-4 text-white z-10" /> : <ImageIcon className="w-4 h-4 text-white z-10" />}

                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {item.post.title}
                            </div>
                        </m.div>
                    );
                })}
            </div>

            {/* Selection Detail Panel */}
            <AnimatePresence>
                {selectedItem && (
                    <m.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute right-6 top-6 bottom-6 w-72 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-40 p-4 flex flex-col"
                    >
                        <button
                            onClick={() => setSelectedId(null)}
                            className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                            <img
                                src={Array.isArray(selectedItem.post.mediaUrl) ? selectedItem.post.mediaUrl[0] : (selectedItem.post.mediaUrl as string)}
                                alt={selectedItem.post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="text-[10px] font-black text-brand-blue uppercase mb-1">{selectedItem.post.location_name}</div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-snug">{selectedItem.post.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{selectedItem.post.description}</p>

                            <Link
                                href={`/arquivo/${selectedItem.post.id}`}
                                className="w-full py-2 bg-brand-blue text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                            >
                                Ver Detalhes
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const CampusMap = withEliteBoundary(CampusMapBase, 'Campus Map');
