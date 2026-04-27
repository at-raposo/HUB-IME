'use client';

import React from 'react';

export function HubHeader() {
    return (
        <section className="relative pt-12 pb-16 flex-shrink-0 overflow-hidden rounded-[40px] text-center mb-8">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-blue/8 rounded-full blur-[80px] -translate-x-1/3 -translate-y-1/4"></div>
                <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-brand-yellow/6 rounded-full blur-[80px] -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-red/8 rounded-full blur-[80px] translate-x-1/3 translate-y-1/4"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-8 animate-fade-in-up">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                    Excelência Científica
                </div>

                <h1 className="font-bukra font-black text-5xl md:text-7xl tracking-tighter mb-8 text-gray-900 dark:text-white leading-[0.85] uppercase italic animate-fade-in-up">
                    Hub de Comunicação <br />
                    Científica <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Lab-Div</span>
                </h1>

                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Hub de Comunicação Científica do Lab-Div — Um projeto para melhorar a comunicação do IF-USP e reunir em um <span className="text-brand-blue-accent font-bold">FLUXO</span> interativo o arquivo de material de divulgação do Lab-Div e de toda a comunidade — de dentro e fora do instituto.
                </p>
            </div>
        </section>
    );
}
