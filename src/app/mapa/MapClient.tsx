'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MediaCardProps } from '@/components/MediaCard';
import { HelpCircle } from 'lucide-react';
import { MapaFeedbackCard } from './MapaFeedbackCard';

const CampusMap = dynamic(() => import('@/components/map/CampusMap').then(mod => mod.CampusMap), {
    ssr: false,
    loading: () => (
        <div className="webkit-aspect-guard w-full rounded-3xl overflow-hidden animate-shimmer-labdiv border border-gray-800 shadow-2xl" />
    )
});

export default function MapClient({ initialItems }: { initialItems: MediaCardProps[] }) {
    const [items] = useState<MediaCardProps[]>(initialItems);

    return (
        <main className="min-h-screen bg-transparent pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="max-w-5xl w-full">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-red mb-4">
                        Campus Interativo
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Navegue pelas descobertas e registros através da geografia do Instituto.
                    </p>
                </header>

                <MapaFeedbackCard className="block lg:hidden mb-8" />

                <div className="w-full max-w-2xl mx-auto aspect-square rounded-3xl overflow-hidden relative shadow-2xl border border-gray-100 dark:border-gray-800 bg-[#D5ED9E]/20 dark:bg-[#1B2B1B]/40">
                    <CampusMap items={items} />
                </div>

                <div className="mt-12 p-6 rounded-2xl glass-card shadow-xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-brand-yellow" />
                        Como funciona?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        Os pontos no mapa representam locais específicos onde as mídias foram registradas ou eventos ocorreram.
                        Clique em um pino para ver o resumo e acesse a página completa para mergulhar nos detalhes.
                    </p>
                </div>
            </div>
        </main>
    );
}
