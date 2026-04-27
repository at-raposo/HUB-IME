'use client';

import { ContextFeedbackCard } from "@/components/ui/ContextFeedbackCard";
import { useNavigationStore } from "@/store/useNavigationStore";

export function FluxoFeedbackCard({ className }: { className?: string }) {
  const { setReportModalOpen } = useNavigationStore();

  const handleFeedbackClick = () => {
    setReportModalOpen(true, 'sugestao');
  };

  return (
    <ContextFeedbackCard
      title="O Pulso do IFUSP"
      icon={<span className="material-symbols-outlined text-2xl text-brand-blue">grain</span>}
      description="Este é o pulso do IFUSP em tempo real. Com a agilidade de uma rede social e o rigor da academia, aqui a divulgação passiva se transforma em comunicação científica interativa. O ecossistema está em construção: como podemos melhorar seu fluxo?"
      betaTag={true}
      onFeedbackClick={handleFeedbackClick}
      className={className}
    />
  );
}
