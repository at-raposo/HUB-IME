'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Atom, 
    Microscope, 
    Magnet, 
    Globe, 
    Layers, 
    Cpu 
} from 'lucide-react';
import Link from 'next/link';
import { useTelemetry } from '@/hooks/useTelemetry';

const departments = [
    {
        id: 'FAP',
        name: 'Física Aplicada',
        description: 'Desenvolvimento de tecnologias a partir de princípios físicos fundamentais.',
        icon: <Cpu className="w-6 h-6" />,
        metrics: { researchers: 42, labs: 12 }
    },
    {
        id: 'FMT',
        name: 'Física dos Materiais',
        description: 'Estudo da estrutura e propriedades macroscópicas da matéria.',
        icon: <Layers className="w-6 h-6" />,
        metrics: { researchers: 38, labs: 15 }
    },
    {
        id: 'FEP',
        name: 'Física Experimental',
        description: 'Investigação empírica dos fenômenos físicos em diversas escalas.',
        icon: <Microscope className="w-6 h-6" />,
        metrics: { researchers: 55, labs: 20 }
    },
    {
        id: 'FGE',
        name: 'Física Geral',
        description: 'Fundamentos da física clássica e moderna e ensino de física.',
        icon: <Globe className="w-6 h-6" />,
        metrics: { researchers: 30, labs: 8 }
    },
    {
        id: 'DFMA',
        name: 'Física Matemática',
        description: 'Pesquisa fundamentada em cosmologia, teoria quântica de campos e informação quântica.',
        icon: <Atom className="w-6 h-6" />,
        metrics: { researchers: 14, labs: 0 }
    },
    {
        id: 'FNC',
        name: 'Física Nuclear',
        description: 'Estudo das propriedades e interações dos núcleos atômicos.',
        icon: <Magnet className="w-6 h-6" />,
        metrics: { researchers: 35, labs: 10 }
    }
];

export function DepartmentGrid() {
    const { trackEvent } = useTelemetry();
    return (
        <section className="py-12">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-[2px] w-8 bg-brand-blue"></div>
               <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Departamentos</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {departments.map((dept, idx) => (
                    <Link 
                        key={dept.id} 
                        href={`/wiki/instituto/${dept.id.toLowerCase()}`}
                        className="block group"
                        onClick={() => trackEvent('DEPT_FILTER', { dept_id: dept.id, dept_name: dept.name })}
                    >
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6 rounded-[32px] border-gray-100 dark:border-white/5 hover:border-brand-blue/30 bg-white/40 dark:bg-[#1E1E1E]/40 hover:bg-gray-100 dark:hover:bg-[#1E1E1E]/60 transition-all duration-500 cursor-pointer h-full"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 group-hover:bg-brand-blue/20 transition-colors">
                                    <span className="text-gray-500 dark:text-gray-400 group-hover:text-brand-blue transition-colors">
                                        {dept.icon}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight underline-offset-4 group-hover:underline group-hover:text-brand-blue transition-all">{dept.name}</h3>
                                    <span className="text-[10px] font-black text-brand-blue/60 uppercase tracking-widest">{dept.id}</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 h-12 overflow-hidden">
                                {dept.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="px-3 py-1.5 rounded-xl bg-brand-red/10 border border-brand-red/20">
                                    <span className="text-[10px] font-black text-brand-red flex items-center gap-1.5">
                                        <div className="size-1 bg-brand-red rounded-full"></div>
                                        {dept.metrics.researchers} PESQUISADORES
                                    </span>
                                </div>
                                
                                {dept.metrics.labs > 0 && (
                                    <div className="px-3 py-1.5 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20">
                                        <span className="text-[10px] font-black text-brand-yellow flex items-center gap-1.5">
                                            <div className="size-1 bg-brand-yellow rounded-full"></div>
                                            {dept.metrics.labs} LABORATÓRIOS
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
