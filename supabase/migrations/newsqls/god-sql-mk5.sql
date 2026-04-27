-- [2026-03-26] Geração de Aluno de Teste: Bento Silva
-- 1. Criar Usuário em Auth
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  'd475583b-e381-424a-93a1-1234567890ab', 
  'bento.teste@usp.br', 
  '{"full_name": "Bento Silva (Teste)", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bento"}'
) ON CONFLICT (id) DO NOTHING;

-- 2. Atualizar Perfil Público com Dados de IC
UPDATE public.profiles SET
  user_category = 'aluno_usp',
  course = 'Bacharelado em Física',
  institute = 'IFUSP',
  seeking_ic = true,
  ic_research_area = 'Física Teórica - Cosmologia',
  ic_preferred_department = 'FMA',
  ic_preferred_lab = 'Grupo de Teoria de Campo',
  ic_letter_of_interest = 'Tenho grande interesse em processamento de dados astronômicos e simulações de N-corpos. Busco minha primeira IC para aplicar conceitos de relatividade geral no estudo de buracos negros primordiais.',
  review_status = 'approved',
  is_visible = true,
  xp = 250,
  level = 5,
  is_usp_member = true
WHERE id = 'd475583b-e381-424a-93a1-1234567890ab';

-- 3. Função de Wipe Seletivo (Manter Emails Selecionados + Trilhas)
CREATE OR REPLACE FUNCTION public.reset_selective(preserved_emails text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- A. Limpar Todo o Conteúdo (Idêntico ao reset_only_content)
  TRUNCATE TABLE public.submissions CASCADE;
  TRUNCATE TABLE public.perguntas CASCADE;
  TRUNCATE TABLE public.comments CASCADE;
  TRUNCATE TABLE public.micro_articles CASCADE;
  TRUNCATE TABLE public.messages CASCADE;
  TRUNCATE TABLE public.entanglement_messages CASCADE;
  TRUNCATE TABLE public.reports CASCADE;
  TRUNCATE TABLE public.feedback_reports CASCADE;
  TRUNCATE TABLE public.notifications CASCADE;
  TRUNCATE TABLE public.quiz_attempts CASCADE;
  TRUNCATE TABLE public.reading_history CASCADE;
  TRUNCATE TABLE public.analytics_plays CASCADE;
  TRUNCATE TABLE public.challenge_submissions CASCADE;

  -- B. Apagar usuários que NÃO estão na lista de preservados.
  -- O delete no auth.users tem CASCADE para public.profiles.
  -- Se o array for vazio ou nulo, não apaga ninguém para evitar acidentes (ou deve apagar todos?). 
  -- Se a intenção é apagar todos quando vazio, seria: DELETE FROM auth.users WHERE array_length(preserved_emails, 1) IS NULL OR email != ALL(preserved_emails);
  DELETE FROM auth.users WHERE array_length(preserved_emails, 1) IS NULL OR email != ALL(preserved_emails);
  
  -- Nota: learning_trails NÃO é truncada, logo as trilhas são mantidas integralmente.
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_selective(text[]) TO postgres;

-- 4. Suporte para Cache de Sincronização do Júpiter
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS jupiter_subjects_cache JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_jupiter_sync TIMESTAMP WITH TIME ZONE;
