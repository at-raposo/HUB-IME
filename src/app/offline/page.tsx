import React from 'react';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background-light dark:bg-background-dark">
            <div className="size-24 bg-brand-blue/10 rounded-full flex items-center justify-center mb-8 text-brand-blue">
                <WifiOff size={48} />
            </div>

            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                Oops! Sem conexão?
            </h1>

            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-12">
                O Hub de Comunicação Científica requer internet para sincronizar novos dados.
                Verifique sua conexão ou tente novamente.
            </p>

            <Link
                href="/"
                className="px-8 py-4 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-blue/20"
            >
                Tentar reconectar
            </Link>

            <p className="mt-12 text-[10px] uppercase font-black tracking-widest text-gray-400 text-brand-blue/40">
                Lab-Div Offline Resilience V3.0
            </p>
        </div>
    );
}
