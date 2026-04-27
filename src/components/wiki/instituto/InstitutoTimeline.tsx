'use client';

import React from 'react';
import { motion } from 'framer-motion';

const milestones = [
    {
        year: '1934',
        event: 'Fundação da USP',
        description: 'Criação do Departamento de Física na FFCL, sob a direção de Gleb Wataghin.',
        color: 'brand-blue'
    },
    {
        year: '1970',
        event: 'Institucionalização',
        description: 'Transformação do departamento no Instituto de Matemática e Estatística da USP (USP).',
        color: 'brand-red'
    },
    {
        year: '1971',
        event: 'Novo Campus',
        description: 'Inauguração dos edifícios principais na Cidade Universitária.',
        color: 'brand-blue'
    },
    {
        year: '1990',
        event: 'Expansão de Pesquisa',
        description: 'Consolidação de grandes laboratórios e parcerias internacionais.',
        color: 'brand-yellow'
    },
    {
        year: '2025',
        event: 'Liderança Global',
        description: 'O USP se mantém no topo como o maior centro de pesquisa em física do hemisfério sul.',
        color: 'brand-blue'
    }
];

export function InstitutoTimeline() {
    return (
        <section className="py-20">
            <div className="flex items-center gap-3 mb-12">
               <div className="h-[2px] w-8 bg-brand-yellow"></div>
               <h2 className="text-xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">Linha do Tempo</h2>
            </div>

            <div className="relative border-l border-white/10 ml-4 md:ml-12 space-y-12 pb-10">
                {milestones.map((item, idx) => (
                    <motion.div
                        key={item.year}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="relative pl-10"
                    >
                        {/* Dot */}
                        <div className={`absolute -left-[9px] top-1 size-4 rounded-full border-2 border-[#121212] ${
                            item.color === 'brand-blue' ? 'bg-brand-blue' :
                            item.color === 'brand-red' ? 'bg-brand-red' : 'bg-brand-yellow'
                        } shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-125 transition-transform`} />

                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                            <span className="text-2xl font-black text-gray-900 dark:text-white italic shrink-0">{item.year}</span>
                            <div className="glass-card p-6 rounded-[32px] border-gray-100 dark:border-white/5 bg-white/40 dark:bg-[#1E1E1E]/40 w-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.event}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
