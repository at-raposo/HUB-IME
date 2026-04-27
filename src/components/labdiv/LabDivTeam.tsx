'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const creators = [
    {
        name: 'Ana Silva',
        role: 'Pesquisadora do Lab Div',
        bio: 'Investigadora principal focada em metodologias de ensino de ciências para o ensino médio.',
        imagePlaceholder: 'A',
        color: 'brand-blue'
    },
    {
        name: 'Carlos Mendes',
        role: 'Bolsista do Arquivo',
        bio: 'Catalogando e digitalizando os documentos históricos do Instituto de Física da USP.',
        imagePlaceholder: 'C',
        color: 'brand-yellow'
    },
    {
        name: 'Luiza Costa',
        role: 'Desenvolvedora do Hub',
        bio: 'Criando ferramentas digitais para facilitar a comunicação científica e o acesso à informação.',
        imagePlaceholder: 'L',
        color: 'brand-red'
    },
    {
        name: 'Rafael Oliveira',
        role: 'Coordenador de Divulgação',
        bio: 'Organizador de eventos e palestras para aproximar a ciência desenvolvida na USP do público em geral.',
        imagePlaceholder: 'R',
        color: 'brand-blue'
    }
];

export function LabDivTeam() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full animate-in fade-in zoom-in duration-500 relative">
            {/* Scroll Navigation Controls */}
            <div className="flex justify-end gap-3 mb-6">
                <button
                    onClick={() => scroll('left')}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white group shadow-sm hover:shadow-md"
                    aria-label="Rolar para a esquerda"
                >
                    <ChevronLeft className="w-6 h-6 group-active:scale-90 transition-transform" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-900 dark:text-white group shadow-sm hover:shadow-md"
                    aria-label="Rolar para a direita"
                >
                    <ChevronRight className="w-6 h-6 group-active:scale-90 transition-transform" />
                </button>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory no-scrollbar px-2 scroll-smooth"
            >
                {creators.map((creator, index) => (
                    <div key={index} className="shrink-0 snap-center sm:snap-start w-[280px] flex flex-col items-center text-center group/card bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                        <div className={`relative w-28 h-28 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${creator.color} shadow-lg ring-4 ring-gray-50 dark:ring-[#121212] outline outline-2 outline-gray-200 dark:outline-white/10 transition-transform group-hover/card:scale-105 duration-300`}>
                            {creator.imagePlaceholder}
                            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{creator.name}</h3>
                        <p className={`text-[10px] uppercase tracking-widest font-black text-${creator.color} mb-3`}>{creator.role}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed max-w-[250px] mx-auto">
                            {creator.bio}
                        </p>
                        <div className="flex gap-3 mt-auto pt-6 opacity-30 group-hover/card:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer text-gray-400">
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer text-gray-400">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}
