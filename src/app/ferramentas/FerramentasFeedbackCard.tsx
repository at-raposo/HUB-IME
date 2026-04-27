'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function FerramentasFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="Ferramentas Acadêmicas"
            description="Gestão Inteligente de Rotina. Atualmente as Ferramentas Acadêmicas oferecem o Cronograma do Hub, que puxa automaticamente as matérias que você marcou como 'cursando' nas Trilhas. Organize sua semana gerindo blocos de estudo com flexibilidade. Além do cronograma, que outro utilitário, calculadora ou script salvaria a sua vida acadêmica no IFUSP? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
