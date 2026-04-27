'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export const EmaranhamentoFeedbackCard = ({ className }: { className?: string }) => {
    const { setReportModalOpen } = useNavigationStore();

    return (
        <ContextFeedbackCard
            title="Emaranhamento"
            description="Onde a física individual se torna inteligência coletiva. Aqui você constrói sua rede de contatos no Instituto. Navegue pelo diretório para encontrar alunos, professores e técnicos com interesses similares, e crie grupos de estudo para sobreviver às disciplinas complexas ou debater tópicos avançados de pesquisa. Forme equipes e fortaleça as conexões no campus. A rede de Emaranhamento (Beta) une a nossa comunidade. Qual funcionalidade facilitaria ainda mais seus encontros acadêmicos? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
};
