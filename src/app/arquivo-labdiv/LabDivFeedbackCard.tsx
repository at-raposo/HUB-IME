'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function LabDivFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="Lab-Div"
            description="Onde a ciência ganha forma, cor e movimento. No Lab-Div você acessa o núcleo criativo do Laboratório de Demonstrações: agende mentorias ou utilização do espaço novo milênio e explore o KitDiv. Descubra nosso catálogo 'Padrão Ouro' de divulgação científica, produzido por nossa equipe ou através de nossas consultorias. Como o Lab-Div pode ajudar a transformar sua pesquisa em comunicação de impacto? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
