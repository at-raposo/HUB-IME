'use client';

import { ContextFeedbackCard } from "@/components/ui/ContextFeedbackCard";
import { useNavigationStore } from "@/store/useNavigationStore";

export function PergunteFeedbackCard({ className }: { className?: string }) {
  const { setReportModalOpen } = useNavigationStore();

  const handleFeedbackClick = () => {
    setReportModalOpen(true, 'sugestao');
  };

  return (
    <ContextFeedbackCard
      title="Pergunte"
      description="Sua linha direta com a ciência. Faça perguntas sobre física ou sobre a vida acadêmica e conte com a equipe do LabDiv e pesquisadores parceiros para responder. Quer saber como a força fraca funciona, como é trabalhar em um reator nuclear ou como é a rotina de pesquisa na USP? Explore curiosidades e tire suas dúvidas com quem faz a ciência acontecer. O que você sempre quis perguntar, mas não sabia onde? Nos conte!"
      betaTag={true}
      onFeedbackClick={handleFeedbackClick}
      className={className}
    />
  );
}
