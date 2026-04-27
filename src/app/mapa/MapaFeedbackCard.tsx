'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function MapaFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="Mapa"
            description={'A ponte entre o Hub e o mundo real. O Mapa conecta os espaços físicos do IFUSP ao digital: no futuro, navegue pelos laboratórios do instituto e utilize QR codes espalhados pelo campus para escanear e descobrir instantaneamente o que é produzido em cada local. Transforme sua caminhada pelo IF em uma jornada de descoberta científica. O mapeamento (Beta) está em expansão. Qual laboratório você quer ver mapeado com prioridade? Nos conte!'}
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
