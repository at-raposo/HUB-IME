'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Network, 
    User, 
    FileText, 
    FlaskConical, 
    Dna, 
    Building2 
} from 'lucide-react';

const nodes = [
    { label: 'Scientia Post', icon: <FileText className="w-5 h-5" />, color: 'text-brand-blue' },
    { label: 'Pesquisador', icon: <User className="w-5 h-5" />, color: 'text-brand-red' },
    { label: 'Linha de Pesquisa', icon: <Dna className="w-5 h-5" />, color: 'text-brand-yellow' },
    { label: 'Laboratório', icon: <FlaskConical className="w-5 h-5" />, color: 'text-brand-blue' },
    { label: 'Departamento', icon: <Building2 className="w-5 h-5" />, color: 'text-brand-red' }
];

export function SemanticGraph() {
    return (
        <section className="py-20 border-t border-white/5">
            <div className="flex items-center gap-3 mb-10">
               <div className="h-[2px] w-8 bg-brand-blue"></div>
               <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Grafo de Conhecimento</h2>
            </div>

            <div className="relative glass-card p-12 rounded-[48px] border-white/5 bg-[#1E1E1E]/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 md:px-4">
                    {nodes.map((node, idx) => (
                        <React.Fragment key={node.label}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, type: 'spring' }}
                                className="flex flex-col items-center gap-4 group"
                            >
                                <div className={`p-5 rounded-full bg-[#121212] border border-white/5 group-hover:border-brand-blue/40 shadow-2xl transition-all duration-500 relative`}>
                                   <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity ${node.color.replace('text-', 'bg-')}`} />
                                   <div className={`${node.color} group-hover:scale-110 transition-transform`}>
                                       {node.icon}
                                   </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${node.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                    {node.label}
                                </span>
                            </motion.div>

                            {idx < nodes.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    whileInView={{ opacity: 1, scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.15 + 0.2, duration: 0.8 }}
                                    className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent relative"
                                >
                                    <div className="absolute inset-0 bg-brand-blue/20 blur-[1px] animate-pulse" />
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="mt-16 text-center max-w-2xl mx-auto">
                    <p className="text-sm text-gray-400 leading-relaxed font-medium">
                        O Hub Lab-Div opera como um ecossistema semântico. No futuro, cada publicação será automaticamente conectada à sua infraestrutura acadêmica, permitindo uma descoberta de conhecimento fluida e contextualizada.
                    </p>
                </div>
            </div>
        </section>
    );
}
