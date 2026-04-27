'use client';

import { ContextFeedbackCard } from "@/components/ui/ContextFeedbackCard";
import { useNavigationStore } from "@/store/useNavigationStore";

export function LogsFeedbackCard({ className }: { className?: string }) {
  const { setReportModalOpen } = useNavigationStore();

  const handleFeedbackClick = () => {
    setReportModalOpen(true, 'sugestao');
  };

  return (
    <ContextFeedbackCard
      title="Logs do IFUSP"
      description="O que está rolando nos corredores? Solte o verbo, compartilhe aquela fofoca de laboratório ou dê um aviso rápido que não cabe num artigo. Descubra um espaço feito para a comunidade desabafar e trocar informações sem o peso da academia. O IF é feito de gente: como podemos deixar esse mural mais vivo?"
      betaTag={true}
      onFeedbackClick={handleFeedbackClick}
      className={className}
    />
  );
}
