'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function TrilhasFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="Trilhas de Aprendizado"
            description="Seu mapa de navegação acadêmica e profissional. Aqui você visualiza de forma clara a estrutura do seu curso. Explore a Árvore Curricular para entender o Ciclo Básico e descobrir os caminhos optativos (Ensino, Quântica, Médica, etc.), utilizando guias curados para planejar suas matrículas. Planeje seus próximos passos no Instituto com segurança. As Trilhas (Beta) guiam o seu futuro. Qual área de especialização deveríamos mapear com mais detalhes para você? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
