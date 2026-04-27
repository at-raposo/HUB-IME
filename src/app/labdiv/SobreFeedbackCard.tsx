'use client';

import { ContextFeedbackCard } from "@/components/ui/ContextFeedbackCard";
import { useNavigationStore } from "@/store/useNavigationStore";

export function SobreFeedbackCard({ className }: { className?: string }) {
  const { setReportModalOpen } = useNavigationStore();

  const handleFeedbackClick = () => {
    setReportModalOpen(true, 'sugestao');
  };

  return (
    <ContextFeedbackCard
      title="Sobre"
      description={'A engenharia e a filosofia por trás do Hub-LabDiv. Aqui contamos como saímos da prancheta e da observação de um "gap" visual para a criação deste código. Entenda nossa evolução de um repositório para um ecossistema interativo focado em UX Inclusiva, construído com arquitetura de ponta e inspirado no MIT Comm Lab. Conheça a nossa visão para o futuro da divulgação. Como um projeto (Beta), sua percepção é vital. O que achou da nossa arquitetura e proposta? Nos conte!'}
      betaTag={true}
      onFeedbackClick={handleFeedbackClick}
      className={className}
    />
  );
}
