'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function WikiFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="Wiki Hub"
            description="A Base de Conhecimento do Hub. Construída pelo LabDiv, a Wiki é o lugar mais amigável para entender os cursos e o instituto sem o 'bucrocratês' dos editais oficiais. Saiba quais são os departamentos, onde buscar apoio psicológico no IF, o que fazer após se formar ou consulte o guia essencial para recém-chegados. Como a Wiki pode ser mais útil para sua jornada? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
