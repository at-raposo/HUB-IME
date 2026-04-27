'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export const ArenaFeedbackCard = ({ className }: { className?: string }) => {
    const { setReportModalOpen } = useNavigationStore();

    return (
        <ContextFeedbackCard
            title="Observatório de Pesquisa"
            description="O radar da vanguarda científica do IFUSP. Aqui você acompanha a produção de excelência dos nossos laboratórios. Descubra grupos de pesquisa ativos, leia seus papers recém-publicados e encontre as oportunidades ideais para iniciar sua carreira acadêmica na Iniciação Científica ou no Mestrado. Conecte-se com a ciência de ponta feita no Instituto. O Observatório (Beta) é a sua ponte para os orientadores. Como podemos facilitar sua busca por projetos de pesquisa? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
};
