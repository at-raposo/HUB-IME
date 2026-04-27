'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AcervoManager } from './moderacao/AcervoManager';
import { SubmissionsManager } from './moderacao/SubmissionsManager';
import { CommentsManager } from './moderacao/CommentsManager';
import { CorrectionsManager } from './moderacao/CorrectionsManager';
import { NarrationManager } from './moderacao/NarrationManager';

type ModerationTab = 'acervo' | 'submissoes' | 'comentarios' | 'correcoes' | 'narracao';

export function AdminModerationClient() {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as ModerationTab) || 'submissoes';
    const [activeTab, setActiveTab] = useState<ModerationTab>(initialTab);

    const tabs = [
        { id: 'submissoes', label: 'Submissões', icon: 'assignment' },
        { id: 'acervo', label: 'Acervo Hub', icon: 'collections_bookmark' },
        { id: 'comentarios', label: 'Comentários', icon: 'chat_bubble' },
        { id: 'narracao', label: 'Narração & TTS', icon: 'record_voice_over' },
        { id: 'correcoes', label: 'Peer Review', icon: 'spellcheck' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen pb-20">
            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Torre de Moderação
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Moderação do <span className="text-brand-blue">Fluxo</span>
                </h1>
                <p className="text-gray-500 mt-4 text-sm font-medium max-w-2xl leading-relaxed">
                    Central de controle para validação de conteúdo, gestão do acervo histórico e moderação da comunidade.
                </p>
            </header>

            {/* Custom Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] mb-12 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ModerationTab)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id
                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'acervo' && <AcervoManager />}
                {activeTab === 'submissoes' && <SubmissionsManager />}
                {activeTab === 'comentarios' && <CommentsManager />}
                {activeTab === 'correcoes' && <CorrectionsManager />}
                {activeTab === 'narracao' && <NarrationManager />}
            </section>
        </div>
    );
}
