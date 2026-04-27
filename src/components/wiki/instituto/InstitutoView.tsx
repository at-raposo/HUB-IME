'use client';

import React from 'react';
import { InstitutoHero } from './InstitutoHero';
import { DepartmentGrid } from './DepartmentGrid';
import { InstitutoHistory } from './InstitutoHistory';
import { InstitutoTimeline } from './InstitutoTimeline';
import { HistoricalPosts } from './HistoricalPosts';
import MapClient from '@/app/mapa/MapClient';
import { HelpCircle } from 'lucide-react';

interface InstitutoViewProps {
    mapItems: any[];
}

export function InstitutoView({ mapItems }: InstitutoViewProps) {
    return (
        <div className="flex flex-col gap-12 w-full overflow-x-hidden pb-12">
            <InstitutoHero />
            
            {/* Mapa Interativo Section */}
            <section className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                        Campus <span className="text-brand-blue">Interativo</span>
                    </h2>
                    <p className="text-gray-400 font-medium max-w-2xl">
                        Navegue pelas descobertas e registros através da geografia do Instituto. 
                        Localize laboratórios, eventos e marcos históricos.
                    </p>
                </div>

                <div className="w-full max-w-4xl mx-auto aspect-square rounded-[40px] overflow-hidden relative shadow-2xl border border-white/5 bg-[#1B2B1B]/40">
                    <MapClient initialItems={mapItems} />
                </div>

                <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-brand-blue" />
                        Como funciona?
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                        Os pontos no mapa representam locais específicos onde as mídias foram registradas.
                        Clique em um pino para ver o resumo e mergulhar nos detalhes daquela localização.
                    </p>
                </div>
            </section>

            <div className="space-y-20">
                <DepartmentGrid />
                <InstitutoHistory />
                <InstitutoTimeline />
                <HistoricalPosts />
            </div>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 text-center mt-12">
                 <p className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Mapeamento Concluído</p>
                 <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                    Este é documento vivo. O mapeamento do Instituto de Física é expandido pela própria comunidade através do Hub Lab-Div.
                 </p>
            </footer>
        </div>
    );
}
