'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export const IngressoFeedbackCard = ({ className }: { className?: string }) => {
    const { setReportModalOpen } = useNavigationStore();

    return (
        <ContextFeedbackCard
            title="Ingresso na USP"
            description="O portal de boas-vindas para os futuros físicos. Aqui desmistificamos o caminho até a Cidade Universitária. Navegue para entender as vias de acesso (FUVEST, ENEM), os auxílios de permanência da PRIP e acesse o Guia do Calouro para se preparar para a vida no Bandeijão e no CRUSP. Dê seus primeiros passos com segurança e acolhimento. Esta área (Beta) é dedicada a quem está chegando. Se você já é aluno, que dica de sobrevivência deixaria para os bixos? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
};
