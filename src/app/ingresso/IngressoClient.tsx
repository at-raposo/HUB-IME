'use client';

import React, { useState } from 'react';
import { BookOpen, GraduationCap, Globe, HelpCircle, ArrowRight, Sparkles, Zap } from 'lucide-react';

const IngressOption = ({ title, icon, description, items, color }: any) => (
    <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-500 group">
        <div className="p-8 space-y-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 font-medium italic">{description}</p>
            </div>
            <ul className="space-y-3">
                {items.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        <ArrowRight className="w-3 h-3 text-brand-blue" />
                        {item}
                    </li>
                ))}
            </ul>
            <button className="w-full py-4 bg-white/5 text-white/60 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                Mais detalhes
            </button>
        </div>
    </div>
);

import { IngressoFeedbackCard } from './IngressoFeedbackCard';

export default function IngressoClient({ profile }: { profile: any }) {
    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="max-w-3xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 rounded-full border border-brand-blue/20 mb-4 scale-90">
                    <Sparkles className="w-3 h-3 text-brand-blue" />
                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Portal do Curioso</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-none">
                    Sua Jornada no <span className="text-brand-blue">IFUSP</span> Começa Aqui.
                </h1>
                <p className="text-gray-400 text-lg font-medium italic">
                    Descubra os caminhos para ingressar em um dos maiores centros de física do mundo.
                </p>
                
                <IngressoFeedbackCard className="lg:hidden mt-8" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <IngressOption 
                        title="Graduação"
                        icon={<BookOpen className="w-8 h-8 text-brand-blue" />}
                        description="Para quem está começando a carreira científica."
                        items={["Fuvest (Vestibular)", "ENEM-USP", "Provão Paulista", "Transferência Interna"]}
                        color="bg-brand-blue/10"
                    />
                    <IngressOption 
                        title="Pós-Graduação"
                        icon={<GraduationCap className="w-8 h-8 text-brand-yellow" />}
                        description="Para quem busca o mestrado ou doutorado."
                        items={["CEx (Física Experimental)", "CEx (Física Teórica)", "Pós em Ensino de Física", "Fluxo Contínuo"]}
                        color="bg-brand-yellow/10"
                    />
                    <IngressOption 
                        title="Intercâmbio"
                        icon={<Globe className="w-8 h-8 text-green-500" />}
                        description="Oportunidades internacionais para visitantes."
                        items={["Mobilidade Acadêmica", "Summer Programs", "Parcerias CERN/DESY", "Pesquisa Visitante"]}
                        color="bg-green-500/10"
                    />
                </div>

                <div className="glass-card rounded-[40px] border border-white/5 p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover:bg-brand-blue/10 duration-700"></div>
                    <div className="relative z-10 flex flex-col items-center gap-12 w-full">
                        <div className="w-full space-y-6">
                            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                                <Zap className="w-8 h-8 text-brand-yellow fill-current" />
                                Dúvidas Frequentes (FAQ)
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { q: "Como faço para conhecer os laboratórios?", a: "O IFUSP promove o 'Portas Abertas' e visitas agendadas via Secretaria de Cultura e Extensão." },
                                    { q: "Existem bolsas de permanência para alunos?", a: "Sim, a USP oferece o programa PAPFE de auxílio permanência para estudantes em vulnerabilidade." },
                                    { q: "Posso fazer pesquisa sem ser aluno oficial?", a: "Sim, como aluno ou pesquisador visitante, sob supervisão de um docente da casa." }
                                ].map((faq, i) => (
                                    <details key={i} className="group cursor-pointer">
                                        <summary className="text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white py-4 border-b border-white/5 list-none flex items-center justify-between">
                                            {faq.q}
                                            <ArrowRight className="w-4 h-4 text-brand-blue group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <p className="py-4 text-sm text-gray-500 italic leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
}
