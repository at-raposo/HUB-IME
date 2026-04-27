'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function HubImeFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="hub-ime"
            description="Onde a ciência ganha forma, cor e movimento. No HUB IME você acessa o núcleo criativo do Laboratório de Demonstrações: agende mentorias ou utilização do espaço novo milênio e explore o KitDiv. Descubra nosso catálogo 'Padrão Ouro' de divulgação científica, produzido por nossa equipe ou através de nossas consultorias. Como o HUB IME pode ajudar a transformar sua pesquisa em comunicação de impacto? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
