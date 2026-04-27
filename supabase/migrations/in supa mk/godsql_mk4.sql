-- ==========================================
-- GODSQL MK4: FULL CONSOLIDATED MIGRATION
-- HUB LAB-DIV - 2026-03-22
-- Includes: Profiles, Academic, Social, Admin, RLS Fixes
-- ==========================================

-- 1. BASE TABLES: RESEARCH ADOPTIONS (IC MATCH)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.research_adoptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    researcher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(researcher_id, student_id)
);

ALTER TABLE public.research_adoptions ENABLE ROW LEVEL SECURITY;

-- Baseline Policies
DROP POLICY IF EXISTS "Researchers can view their adoptions" ON public.research_adoptions;
CREATE POLICY "Researchers can view their adoptions" ON public.research_adoptions
    FOR SELECT USING (auth.uid() = researcher_id);

DROP POLICY IF EXISTS "Students can view their adoptions" ON public.research_adoptions;
CREATE POLICY "Students can view their adoptions" ON public.research_adoptions
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Researchers can manage adoptions" ON public.research_adoptions;
CREATE POLICY "Researchers can manage adoptions" ON public.research_adoptions
    FOR ALL USING (auth.uid() = researcher_id);

-- [CRITICAL FIX] Admins can manage all adoptions (Both IC and Freshman)
DROP POLICY IF EXISTS "Admins can manage all research adoptions" ON public.research_adoptions;
CREATE POLICY "Admins can manage all research adoptions" ON public.research_adoptions 
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'labdiv adm', 'moderador'))
    );

DROP POLICY IF EXISTS "Admins can manage all adoptions" ON public.adoptions;
CREATE POLICY "Admins can manage all adoptions" ON public.adoptions 
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'labdiv adm', 'moderador'))
    );

GRANT ALL ON public.research_adoptions TO authenticated;
GRANT ALL ON public.research_adoptions TO service_role;

-- ==========================================
-- 2. SUPABASE MIGRATIONS (CONTENT FROM AFFAAS.SQL)
-- ==========================================


-- ==========================================
-- MERGED FILE: 20240322_add_isotopes_to_submissions.sql
-- ==========================================

-- Migration: Add isotopes to submissions table
-- For sprint 11: Interest Analysis

-- 1. Add isotopes column
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS isotopes text[] DEFAULT '{}'::text[];

-- 2. Add index for better performance when querying by isotope
CREATE INDEX IF NOT EXISTS idx_submissions_isotopes ON public.submissions USING GIN (isotopes);

-- 3. Update RLS (if needed, but usually automatically handled by table permissions)
-- Profiles that can select/update/delete submissions can still do so.


-- ==========================================
-- MERGED FILE: 20260320_add_content_format.sql
-- ==========================================

-- Add content_format column to submissions and wiki_articles
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS content_format TEXT;
ALTER TABLE public.wiki_articles ADD COLUMN IF NOT EXISTS content_format TEXT;

-- Initialize content_format based on media_type in submissions
-- Using ::text to avoid enum comparison issues
UPDATE public.submissions 
SET content_format = CASE 
    WHEN media_type::text = 'image' THEN 'image'
    WHEN media_type::text = 'video' THEN 'video'
    ELSE 'text'
END
WHERE content_format IS NULL;

-- Set default for wiki_articles
UPDATE public.wiki_articles SET content_format = 'text' WHERE content_format IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.submissions.content_format IS 'Scientific Telemetry: text, audio, image, video, mixed';
COMMENT ON COLUMN public.wiki_articles.content_format IS 'Scientific Telemetry: text, audio, image, video, mixed';


-- ==========================================
-- MERGED FILE: 20260321_academic_rls_fix.sql
-- ==========================================

/*
  # Academic Visibility RLS Fix
  
  Enables authenticated users to view completed trails and trail progress.
  Required for the Arena / Match AcadÃªmico feature where researchers view student profiles.
*/

-- Unify SELECT access for authenticated users on academic tables
DROP POLICY IF EXISTS "Public can view completed trails" ON user_completed_trails;
CREATE POLICY "Public can view completed trails" 
ON user_completed_trails FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Public can view trail progress" ON user_trail_progress;
CREATE POLICY "Public can view trail progress" 
ON user_trail_progress FOR SELECT 
TO authenticated 
USING (true);


-- ==========================================
-- MERGED FILE: 20260321_admin_notifications.sql
-- ==========================================

-- Admin Notifications Management Table
-- Tracks notifications sent by moderators/admins to users

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  target_type TEXT NOT NULL CHECK (target_type IN ('broadcast', 'user', 'group')),
  target_value TEXT, -- user_id for 'user', category name for 'group', null for 'broadcast'
  recipients_count INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ, -- null = immediate send
  sent_at TIMESTAMPTZ, -- filled when actually sent
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'scheduled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- RLS
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only moderators and admins can manage
DROP POLICY IF EXISTS "Moderators and admins can manage admin_notifications" ON admin_notifications;
CREATE POLICY "Moderators and admins can manage admin_notifications"
  ON admin_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );


-- ==========================================
-- MERGED FILE: 20260321_enable_messages_realtime.sql
-- ==========================================

-- Enable Realtime for messages to allow sidebar and chat to update instantly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END
$$;


-- ==========================================
-- MERGED FILE: 20260321_focal_groups.sql
-- ==========================================

-- Migration: Add official and public flags to entangled groups
-- Path: ./supabase/migrations/newsqls/20260321_focal_groups.sql

ALTER TABLE entangled_groups 
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS focal_isotope TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Seed some official focal groups
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM entangled_groups WHERE name = 'FÃ­sica de PartÃ­culas') THEN
        INSERT INTO entangled_groups (name, is_official, is_public, focal_isotope, description)
        VALUES 
        ('FÃ­sica de PartÃ­culas', true, true, 'FÃ­sica de PartÃ­culas', 'Grupo dedicado ao estudo e discussÃµes sobre o modelo padrÃ£o e fÃ­sica subatÃ´mica.'),
        ('AstrofÃ­sica & Cosmologia', true, true, 'AstrofÃ­sica', 'Explorando as fronteiras do universo, de buracos negros Ã  expansÃ£o cÃ³smica.'),
        ('Fotografia CientÃ­fica', true, true, 'Fotografia', 'Unindo tÃ©cnica fotogrÃ¡fica e visualizaÃ§Ã£o de dados na ciÃªncia.'),
        ('EducaÃ§Ã£o e ExtensÃ£o', true, true, 'EducaÃ§Ã£o', 'Debates sobre mÃ©todos de ensino de fÃ­sica e divulgaÃ§Ã£o cientÃ­fica.');
    END IF;
END $$;


-- ==========================================
-- MERGED FILE: 20260321_granular_reset.sql
-- ==========================================

-- Migration: 20260321_granular_reset.sql
-- Description: FunÃ§Ãµes para resets granulares na Zona de Perigo.

-- 1. Reset de Perfis (MantÃ©m as trilhas, mas reseta usuÃ¡rios)
CREATE OR REPLACE FUNCTION public.reset_only_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncar profiles (isso cascateia para submissions, etc. se houver FK)
  TRUNCATE TABLE public.profiles CASCADE;
  
  -- Remover todos os usuÃ¡rios do auth
  DELETE FROM auth.users;
END;
$$;

-- 2. Reset de ConteÃºdo (MantÃ©m usuÃ¡rios e trilhas, apaga posts/perguntas/logs)
CREATE OR REPLACE FUNCTION public.reset_only_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  TRUNCATE TABLE public.adoption_validations CASCADE;
END;
$$;

-- 3. Busca e DestruiÃ§Ã£o (Deleta tudo de um usuÃ¡rio especÃ­fico)
CREATE OR REPLACE FUNCTION public.delete_specific_user(target_uid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- O delete em auth.users cascateia para public.profiles (via FK ON DELETE CASCADE)
  -- e do profiles para submissions, etc.
  DELETE FROM auth.users WHERE id = target_uid;
END;
$$;

-- 4. Reset de Trilhas (Apaga apenas as trilhas e suas dependÃªncias)
CREATE OR REPLACE FUNCTION public.reset_only_trails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  TRUNCATE TABLE public.learning_trails CASCADE;
END;
$$;

-- 5. Re-granting permissions if needed
GRANT EXECUTE ON FUNCTION public.reset_only_profiles() TO postgres;
GRANT EXECUTE ON FUNCTION public.reset_only_content() TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_specific_user(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION public.reset_only_trails() TO postgres;


-- ==========================================
-- MERGED FILE: godsqlmk4-5-5.sql
-- ==========================================



-- ==========================================
-- MERGED FILE: godsql_mk4-5.sql
-- ==========================================

-- ==========================================
-- GODSQL MK4: CONSOLIDAÃ‡ÃƒO TOTAL (HUB LAB-DIV)
-- Data: 2026-03-19
-- DescriÃ§Ã£o: Unifica Perfis, Drops, Grafo de Conhecimento e Telemetria NÃ­vel 2.
-- ==========================================

-- 1. BASE: TYPES & ENUMS
-- ------------------------------------------

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_category') THEN
        CREATE TYPE public.user_category AS ENUM ('curioso', 'licenciatura', 'bacharelado', 'pos_graduacao', 'docente_pesquisador');
    END IF;
END $$;

-- 2. EXTENSÃ•ES DE PERFIS (PROFILES)
-- ------------------------------------------

-- User Category
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_category public.user_category DEFAULT 'curioso';

-- Social Links
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(255) DEFAULT '',
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) DEFAULT '';

-- Portfolio & Hobbies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'portfolio_url') THEN
        ALTER TABLE public.profiles ADD COLUMN portfolio_url TEXT;
    END IF;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hobbies_gallery JSONB DEFAULT '[]'::jsonb;

-- 2. DROPS THREADS (MICRO_ARTICLES)
-- ------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'parent_id') THEN
        ALTER TABLE public.micro_articles ADD COLUMN parent_id UUID REFERENCES public.micro_articles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'status') THEN
        ALTER TABLE public.micro_articles ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'micro_articles' AND column_name = 'is_featured') THEN
        ALTER TABLE public.micro_articles ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_micro_articles_parent ON public.micro_articles(parent_id);

-- 3. GRAFO DE CONHECIMENTO: ENTIDADES
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    sigla TEXT UNIQUE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'laboratory_status') THEN
        CREATE TYPE public.laboratory_status AS ENUM ('ativo', 'inativo');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    status laboratory_status DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'researcher_status') THEN
        CREATE TYPE public.researcher_status AS ENUM ('ativo', 'emerito', 'inativo');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    avatar_url TEXT,
    lattes_url TEXT,
    status researcher_status DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.research_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TELEMETRIA NÃVEL 2: SCHEMA
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id UUID,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON public.telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.telemetry_events(created_at);

-- 5. GRAFO DE CONHECIMENTO: JUNÃ‡Ã•ES (N-N)
-- ------------------------------------------

CREATE TABLE IF NOT EXISTS public.department_laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(department_id, laboratory_id)
);

CREATE TABLE IF NOT EXISTS public.department_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(department_id, researcher_id)
);

CREATE TABLE IF NOT EXISTS public.laboratory_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(laboratory_id, researcher_id)
);

-- 6. INTEGRAÃ‡ÃƒO COM SUBMISSIONS (TRANSVERSAL)
-- ------------------------------------------

ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_golden_standard BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.submission_departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.submission_laboratories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    laboratory_id UUID REFERENCES public.laboratories(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, laboratory_id)
);

CREATE TABLE IF NOT EXISTS public.submission_researchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    researcher_id UUID REFERENCES public.researchers(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, researcher_id)
);

CREATE TABLE IF NOT EXISTS public.submission_research_lines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    research_line_id UUID REFERENCES public.research_lines(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(submission_id, research_line_id)
);

-- 7. SUGESTÃ•ES (KNOWLEDGE & ARENA)
-- ------------------------------------------

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_type') THEN
        CREATE TYPE public.suggestion_type AS ENUM ('novo_laboratorio', 'atualizar_pesquisador', 'alterar_linha', 'outro');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'suggestion_status') THEN
        CREATE TYPE public.suggestion_status AS ENUM ('pendente', 'analisado', 'recusado');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.knowledge_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    tipo suggestion_type NOT NULL,
    conteudo TEXT NOT NULL,
    status suggestion_status DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.arena_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    researcher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. SEGURANÃ‡A (RLS POLICIES)
-- ------------------------------------------

-- Enable RLS for all new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_research_lines ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Leitura PÃºblica Departments" ON public.departments;
CREATE POLICY "Leitura PÃºblica Departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select labs" ON public.laboratories;
CREATE POLICY "Public Select labs" ON public.laboratories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select researchers" ON public.researchers;
CREATE POLICY "Public Select researchers" ON public.researchers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Select lines" ON public.research_lines;
CREATE POLICY "Public Select lines" ON public.research_lines FOR SELECT USING (true);

-- Telemetry Policies
DROP POLICY IF EXISTS "Public can insert telemetry" ON public.telemetry_events;
CREATE POLICY "Public can insert telemetry" ON public.telemetry_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view telemetry" ON public.telemetry_events;
CREATE POLICY "Admins can view telemetry" ON public.telemetry_events FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'labdiv adm', 'moderator')
    )
);

-- Submission Restrictions
DROP POLICY IF EXISTS "RestriÃ§Ã£o Lab-Div Categoria" ON public.submissions;
CREATE POLICY "RestriÃ§Ã£o Lab-Div Categoria" ON public.submissions AS RESTRICTIVE FOR INSERT
WITH CHECK (category != 'Lab-Div' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'labdiv', 'moderator', 'labdiv adm')));

-- Knowledge Suggestions
DROP POLICY IF EXISTS "Qualquer usuÃ¡rio logado pode inserir sugestÃµes" ON public.knowledge_suggestions;
CREATE POLICY "Qualquer usuÃ¡rio logado pode inserir sugestÃµes" ON public.knowledge_suggestions FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Arena Policies
DROP POLICY IF EXISTS "Researchers can view their own suggestions" ON public.arena_suggestions;
CREATE POLICY "Researchers can view their own suggestions" ON public.arena_suggestions FOR SELECT USING (auth.uid() = researcher_id);

-- 9. MOCK DATA (SEED)
-- ------------------------------------------

-- Departamentos base
INSERT INTO public.departments (id, nome, sigla, descricao) VALUES
('d1000000-0000-0000-0000-000000000000', 'FÃ­sica Aplicada', 'FAP', 'Tecnologias a partir de princÃ­pios fÃ­sicos.'),
('d2000000-0000-0000-0000-000000000000', 'FÃ­sica dos Materiais', 'FMT', 'Estrutura e propriedades macroscÃ³picas.'),
('d3000000-0000-0000-0000-000000000000', 'FÃ­sica Experimental', 'FEP', 'InvestigaÃ§Ã£o empÃ­rica.'),
('d4000000-0000-0000-0000-000000000000', 'FÃ­sica Geral', 'FGE', 'Fundamentos e ensino.'),
('d5000000-0000-0000-0000-000000000000', 'FÃ­sica MatemÃ¡tica', 'FMA', 'MÃ©todos matemÃ¡ticos na fÃ­sica.'),
('d6000000-0000-0000-0000-000000000000', 'FÃ­sica Nuclear', 'FNC', 'NÃºcleos atÃ´micos.')
ON CONFLICT (sigla) DO NOTHING;

-- Mock Knowledge Graph
INSERT INTO public.laboratories (id, nome, descricao) VALUES
('1ab1ab1a-0000-0000-0000-000000000001', 'LAM - LaboratÃ³rio de AnÃ¡lise de Materiais', 'AnÃ¡lise multi-escala de materiais condensados.'),
('1ab1ab1a-0000-0000-0000-000000000002', 'LFF - LaboratÃ³rio de Filmes Finos', 'Crescimento e caracterizaÃ§Ã£o de filmes binÃ¡rios.'),
('2ab2ab2a-0000-0000-0000-000000000001', 'LCMat - LaboratÃ³rio de Cristalografia de Materiais', 'DifraÃ§Ã£o de raios-X e estrutura cristalina.'),
('6ab6ab6a-0000-0000-0000-000000000001', 'Pelletron - Acelerador de PartÃ­culas', 'FÃ­sica nuclear experimental de baixas energias.')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

INSERT INTO public.researchers (id, nome) VALUES
('1ee1ee1e-0000-0000-0000-000000000001', 'Prof. Dr. Newton Santos (FAP)'),
('1ee1ee1e-0000-0000-0000-000000000002', 'Profa. Dra. Maria Curie (FAP)'),
('6ee6ee6e-0000-0000-0000-000000000001', 'Prof. Dr. Enrico Fermi (FNC)')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

INSERT INTO public.research_lines (id, nome) VALUES
('33333333-0000-0000-0000-000000000001', 'Nanomateriais'),
('33333333-0000-0000-0000-000000000002', 'Supercondutividade'),
('33333333-0000-0000-0000-000000000003', 'FÃ­sica de Altas Energias'),
('33333333-0000-0000-0000-000000000004', 'Ã“ptica QuÃ¢ntica')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- Junctions
INSERT INTO public.department_laboratories (department_id, laboratory_id) VALUES
('d1000000-0000-0000-0000-000000000000', '1ab1ab1a-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000000', '1ab1ab1a-0000-0000-0000-000000000002'),
('d1000000-0000-0000-0000-000000000000', '2ab2ab2a-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO public.department_researchers (department_id, researcher_id) VALUES
('d1000000-0000-0000-0000-000000000000', '1ee1ee1e-0000-0000-0000-000000000001'),
('d1000000-0000-0000-0000-000000000000', '1ee1ee1e-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO public.laboratory_researchers (laboratory_id, researcher_id) VALUES
('1ab1ab1a-0000-0000-0000-000000000001', '1ee1ee1e-0000-0000-0000-000000000001'),
('2ab2ab2a-0000-0000-0000-000000000001', '1ee1ee1e-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- RELOAD CACHE
NOTIFY pgrst, 'reload schema';
-- Add Letter of Interest field for students seeking IC
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ic_letter_of_interest TEXT;

-- Update the comments for clarity
COMMENT ON COLUMN profiles.ic_letter_of_interest IS 'A short letter describing why the student wants an IC (max 500 chars requested in UI).';
ALTER TABLE admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_target_type_check;

ALTER TABLE admin_notifications ADD CONSTRAINT admin_notifications_target_type_check 
CHECK (target_type IN ('broadcast', 'user', 'group', 'automatic'));
