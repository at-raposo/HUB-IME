'use client';

import { ContextFeedbackCard } from "@/components/ui/ContextFeedbackCard";
import { useNavigationStore } from "@/store/useNavigationStore";

export function PerfilFeedbackCard({ className }: { className?: string }) {
  const { setReportModalOpen } = useNavigationStore();

  const handleFeedbackClick = () => {
    setReportModalOpen(true, 'sugestao');
  };

  return (
    <ContextFeedbackCard
      title="Lab Pessoal"
      description="Sua base de operações e identidade no ecossistema. Aqui você gerencia seu perfil e acompanha sua jornada no Hub: edite sua bio, personalize seus badges e veja seu progresso de XP e tier. Acesse suas coleções salvas, organize anotações e revise suas publicações para acompanhar seu impacto na comunicação científica. Seu Lab (Beta) é seu espaço privado. Que outra ferramenta de organização você quer ver aqui? Nos conte!"
      betaTag={true}
      onFeedbackClick={handleFeedbackClick}
      className={className}
    />
  );
}
