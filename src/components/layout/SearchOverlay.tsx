'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ── Wiki content for deep keyword + body-text search ──
// `content` contains all text rendered on each wiki page for full-text search
const wikiEntries = [
    {
        title: 'Guia de Boas Práticas',
        href: '/wiki/guia-de-boas-praticas',
        desc: 'Diretrizes para produção de mídia: fotografia, vídeo e créditos.',
        keywords: ['guia', 'boas práticas', 'manual', 'foto', 'vídeo', 'créditos', 'qualidade', 'padrões'],
        content: 'Estrutura em 4 Etapas formulário Categoria Formato Detalhes Básicos obrigatórios Detalhes Complementares opcionais título impactante autor principal apelido acadêmico ano trabalho descrição upload arquivos 10MB link YouTube WhatsApp Tags Coautores Links Externos Drive GitHub Notion Detalhes Técnicos ISO Câmera Software Depoimento pessoal Apelidos Identidade Apelido Acadêmico nome exibição público Nomes ofensivos integridade comunidade Links Externos Grandes Arquivos limite upload 10MB datasets PDFs códigos campo Link Externo Google Drive Mini Quiz Gamificação Engajamento 2 perguntas conteúdo XP Hub recompensar comunidade Creative Commons CC-BY-SA conhecimento créditos',
    },
    {
        title: 'Emissão de Luz — Divulgação',
        href: '/wiki/divulgacao',
        desc: 'Toolkit de divulgação: VR, posters, design e impacto visual.',
        keywords: ['divulgação', 'design', '360', 'vr', 'poster', 'mídia', 'comunicação', 'impacto', 'toolkit'],
        content: 'Fotografia Essencial Regra dos Terços intersecções grade equilíbrio ângulos tridimensionalidade equipamentos Iluminação Modo Pro ISO baixo 100-400 ruído Tempo Obturador congelar fenômenos alta energia celular bloqueio foco exposição Redação Divulgação gancho porquê mecanismo impacto Divulgação científica transporte conceitos complexos mentes curiosas Recursos HUB IME KitDiv assets visuais tipografia oficial Mentoria equipe técnica comunicação',
    },
    {
        title: 'Interações de Fronteira — Extensão',
        href: '/wiki/extensao',
        desc: 'Extensão: grupos, eventos Física para Todos e projetos culturais.',
        keywords: ['extensão', 'cultura', 'eventos', 'física para todos', 'grupos', 'projetos'],
        content: 'Mapeamento Grupos USP coletivos transformam vivência acadêmica Vaca Esférica Rádio divulgação científica alunos HUB IME Laboratório Design Comunicação Show de Física experimentos público escolar Guia Integração Aquário vivência reuniões abertas colaboração força fundamental Amélia Império espaço Colisor HS Humanidades Debates éticos Síncrotron Pontes Docentes IC Professores pesquisadores Iniciação Científica proatividade email formal apresentar interesse sala conversar brevemente',
    },
    {
        title: 'Iniciação de Partículas — Calouro',
        href: '/wiki/calouro',
        desc: 'Guia de sobrevivência: bandejão, CRUSP, JúpiterWeb e vida no campus.',
        keywords: ['bandejão', 'crusp', 'matão', 'sobrevivência', 'calouro', 'ajuda', 'logística', 'jupiter', 'sas', 'campus'],
        content: 'Mobilidade Circulares BUSP 8082-10 8083-10 8084-10 8085-10 fins semana madrugadas 8012-10 8022-10 cartão BUSP obrigatório gratuidade tarifa cobrada Bilhete Único Guia Bandejão Física mais próximo Central mais preferido Prefeitura melhor avaliado recarregar créditos RU Card aplicativo Cardápio USP PIX PAPFE sistema carrega créditos automaticamente Esporte Lazer CEPEUSP CEPE piscinas quadras academia gratuitas exame médico carteirinha USP digital desintegrar estresse provas Burocracia Infraestrutura Seção de Alunos trancamentos matrículas Pró-Aluno hub computação imprimir trabalhos softwares técnicos laboratórios Networking Acadêmico Professores pesquisadores Iniciação Científica proatividade email formal sala conversar',
    },
    {
        title: 'Protocolos de Proteção',
        href: '/wiki/protecao',
        desc: 'Saúde mental, neurodiversidade (TEA), acolhimento e inclusão.',
        keywords: ['proteção', 'saúde mental', 'tea', 'neurodiversidade', 'acolhimento', 'suporte', 'inclusão', 'bem-estar', 'pcd', 'psicológico'],
        content: 'Acolhimento USP Portal orientação apoio conflito escuta instituto Física Acolhe iniciativa suporte direto alunos ambiente acadêmico saudável integrado Direitos Inclusão Autismo TEA Portaria PRIP 059 avaliações salas separadas fones ouvido abafadores ruído conforto sensorial Programa ECOS Bandejão Central escuta acolhimento conflitos orientação institucional escutas pontuais comunidade Sistema USP Acolhimento SUA PRIP denúncias assédio discriminação violações direitos humanos Hospital Universitário HU acompanhamento psiquiátrico comunidade USP triagem encaminhamento consulta',
    },
    {
        title: 'Vetores de Carreira',
        href: '/wiki/carreira',
        desc: 'Trajetórias pós-USP: academia, indústria, física médica e educação.',
        keywords: ['carreira', 'futuro', 'trabalho', 'indústria', 'academia', 'pós-graduação', 'ensino', 'vagas'],
        content: 'em desenvolvimento caminhos graduação formação carreiras acadêmicas mercado trabalho novas fronteiras físicos',
    },
    {
        title: 'Sistemas de Pesquisa',
        href: '/wiki/pesquisa',
        desc: 'Iniciação científica, laboratórios e sistema Ateneu.',
        keywords: ['pesquisa', 'ic', 'iniciação científica', 'laboratório', 'ateneu', 'orientador', 'ciência', 'partícula'],
        content: 'em desenvolvimento trajetória pesquisa científica softwares técnicos essenciais passo passo Iniciação Científica IC',
    },
    {
        title: 'Energia de Permanência — Bolsas',
        href: '/wiki/bolsas',
        desc: 'Auxílios PAPFE, editais de monitoria e suporte estudantil.',
        keywords: ['bolsas', 'papfe', 'permanência', 'monitoria', 'dinheiro', 'editais', 'auxílio'],
        content: 'PAPFE Programa Apoio Permanência Formação Estudantil auxílios fundamentais alimentação transporte manutenção vulnerabilidade socioeconômica inscrição anual PRIP CRUSP Moradia Estudantil Conjunto Residencial USP moradia gratuita campus convivência suporte Bolsas Docência Licenciatura PIBID iniciação docência escolas públicas PROIAD monitoria apoio pedagógico SEDUC rede estadual São Paulo PEEG Programa Estímulo Ensino Graduação monitoria acadêmica materiais didáticos PUB Programa Unificado Bolsas Ensino Pesquisa Extensão Cultura PIBIC Pesquisa Acadêmica iniciação científica metodologia pensamento crítico PIBITI Inovação Desenvolvimento Tecnológico protótipos Pro-Aluno apoios institucionais Seção Alunos PRIP Pró-Reitoria Inclusão Pertencimento editais chamadas abertas',
    },
    {
        title: 'Estrutura da Matéria — Cursos USP',
        href: '/wiki/USP',
        desc: 'Cursos, PPPs, departamentos e estrutura curricular.',
        keywords: ['ppp', 'bacharelado', 'licenciatura', 'física médica', 'grade', 'optativas', 'atpa', 'comissão'],
        content: 'em desenvolvimento Projetos Político-Pedagógicos PPPs manual habilitação créditos necessários grade matérias semestres horas Atividades Extensão AEx formar',
    },
    {
        title: 'O Instituto de Matemática e Estatística',
        href: '/wiki/instituto',
        desc: 'História, departamentos, espaços e organização do USP.',
        keywords: ['USP', 'instituto', 'física', 'departamento', 'auditório', 'história', 'mapa'],
        content: 'em desenvolvimento organização Instituto Física Diretoria Conselhos Comissões história pioneirismo excelência departamentos centros pesquisa cotidiano',
    },
    {
        title: 'Quiz — Teste de Radiação',
        href: '/wiki/quiz',
        desc: 'Desafie seus conhecimentos sobre o USP e a física.',
        keywords: ['quiz', 'teste', 'desafio', 'conhecimento', 'ranking'],
        content: 'Contador Geiger questões técnicas históricas explodir perfil Hub colidido impacto comunidade Curiosidades IF acelerador Pelletron inaugurado 1972 patrimônio científico Rua Matão Desafios Física problemas conceituais rápidos neurônios colisões mentais',
    },
];

// ── Navigation routes ──
const navRoutes = [
    { label: 'Grade Horária / Cronograma', href: '/ferramentas', icon: 'calendar_month', color: 'text-brand-blue-accent', desc: 'Monte seu cronograma semestral do Júpiter' },
    { label: 'Trilhas de Aprendizado', href: '/trilhas', icon: 'auto_stories', color: 'text-brand-yellow', desc: 'Descubra a ordem ideal de matérias' },
    { label: 'GCIME (Grande Colisor do IF)', href: '/gcime', icon: 'hub', color: 'text-brand-blue-accent', desc: 'Oportunidades de pesquisa e projetos' },
    { label: 'Meu Laboratório / Perfil', href: '/lab', icon: 'science', color: 'text-brand-red', desc: 'XP, conquistas e painel pessoal' },
    { label: 'Comunidade & Interações', href: '/', icon: 'forum', color: 'text-brand-red', desc: 'Mural público e networking' },
    { label: 'Submeter ou Editar Wiki', href: '/interacao', icon: 'edit_square', color: 'text-brand-blue-accent', desc: 'Colabore criando novas páginas' },
    { label: 'Ferramentas', href: '/ferramentas', icon: 'construction', color: 'text-brand-blue-accent', desc: 'Grade, Trilhas e sincronização Júpiter' },
];

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SubmissionResult {
    id: string;
    title: string;
    category?: string;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [dbResults, setDbResults] = useState<SubmissionResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setDbResults([]);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    // Debounced Supabase search
    const searchDatabase = useCallback(async (searchTerm: string) => {
        if (searchTerm.trim().length < 2) {
            setDbResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('submissions')
                .select('id, title, category')
                .eq('status', 'aprovado')
                .ilike('title', `%${searchTerm}%`)
                .limit(8);
            setDbResults((data as SubmissionResult[]) || []);
        } catch {
            setDbResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchDatabase(query), 350);
        return () => clearTimeout(timer);
    }, [query, searchDatabase]);

    // Filter navigation routes
    const q = query.toLowerCase().trim();
    const filteredNav = q === ''
        ? navRoutes
        : navRoutes.filter(r =>
            r.label.toLowerCase().includes(q) ||
            r.desc.toLowerCase().includes(q)
        );

    // Deep wiki search (title + description + keywords + body content)
    const filteredWiki = q === ''
        ? []
        : wikiEntries.filter(w =>
            w.title.toLowerCase().includes(q) ||
            w.desc.toLowerCase().includes(q) ||
            w.keywords.some(kw => kw.includes(q)) ||
            w.content.toLowerCase().includes(q)
        );

    // Extract a snippet around the matched term with highlight
    const getContentSnippet = (content: string, searchTerm: string): React.ReactNode | null => {
        const lowerContent = content.toLowerCase();
        const idx = lowerContent.indexOf(searchTerm);
        if (idx === -1) return null;

        // Extract a window around the match
        const snippetRadius = 40;
        const start = Math.max(0, idx - snippetRadius);
        const end = Math.min(content.length, idx + searchTerm.length + snippetRadius);
        
        // Find word boundaries to avoid cutting words
        let snippetStart = start;
        if (start > 0) {
            const spaceIdx = content.indexOf(' ', start);
            snippetStart = spaceIdx !== -1 && spaceIdx < idx ? spaceIdx + 1 : start;
        }
        let snippetEnd = end;
        if (end < content.length) {
            const spaceIdx = content.lastIndexOf(' ', end);
            snippetEnd = spaceIdx > idx + searchTerm.length ? spaceIdx : end;
        }

        const before = content.slice(snippetStart, idx);
        const match = content.slice(idx, idx + searchTerm.length);
        const after = content.slice(idx + searchTerm.length, snippetEnd);

        return (
            <span className="text-[10px] text-gray-500 leading-snug">
                {snippetStart > 0 && '…'}
                {before}
                <mark className="bg-brand-blue/30 text-brand-blue font-bold rounded px-0.5">{match}</mark>
                {after}
                {snippetEnd < content.length && '…'}
            </span>
        );
    };

    if (!isOpen) return null;

    const handleNavigate = (href: string, overrideQuery?: string) => {
        onClose();
        const searchTerm = overrideQuery || query.trim();
        const finalHref = searchTerm && href.startsWith('/wiki/') 
            ? `${href}?hl=${encodeURIComponent(searchTerm)}` 
            : href;
        router.push(finalHref);
    };

    const hasResults = filteredNav.length > 0 || filteredWiki.length > 0 || dbResults.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Overlay Panel */}
            <div className="fixed inset-x-0 top-0 z-[9999] flex justify-center pt-[72px] px-4 pointer-events-none">
                <div
                    className="w-full max-w-[640px] bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                        <span className="material-symbols-outlined text-brand-blue text-[22px]">search</span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Buscar páginas, artigos da Wiki, conteúdo..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm font-medium placeholder:text-gray-500 outline-none"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                        <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400 font-mono">
                            ESC
                        </kbd>
                    </div>

                    {/* Results Container */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="px-5 py-3 flex items-center gap-3 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                                <span className="material-symbols-outlined animate-spin text-brand-yellow text-[16px]">progress_activity</span>
                                Buscando conteúdo...
                            </div>
                        )}

                        {/* Section 1: Navegação Rápida */}
                        {filteredNav.length > 0 && (
                            <div className="px-3 pt-3 pb-1">
                                <h3 className="px-2 mb-2 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                    {q === '' ? '⚡ Navegação Rápida' : `🔗 Páginas (${filteredNav.length})`}
                                </h3>
                                <div className="flex flex-col">
                                    {filteredNav.map((route, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleNavigate(route.href)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all text-left group"
                                        >
                                            <div className={`size-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center ${route.color}`}>
                                                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">{route.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors block truncate">{route.label}</span>
                                                <span className="text-[11px] text-gray-500 block truncate">{route.desc}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-600 text-[16px] group-hover:text-gray-400 transition-colors">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 2: Wiki Articles (Deep Search) */}
                        {filteredWiki.length > 0 && (
                            <div className="px-3 pt-3 pb-1 border-t border-white/5">
                                <h3 className="px-2 mb-2 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                    📚 Wiki do Instituto ({filteredWiki.length})
                                </h3>
                                <div className="flex flex-col">
                                    {filteredWiki.map((wiki, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleNavigate(wiki.href)}
                                            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-yellow/5 active:bg-brand-yellow/10 transition-all text-left group"
                                        >
                                            <div className="size-8 shrink-0 rounded-lg bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mt-0.5">
                                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <span className="text-sm font-bold text-gray-200 group-hover:text-brand-yellow transition-colors block truncate">{wiki.title}</span>
                                                <span className="text-[11px] text-gray-500 block truncate">{wiki.desc}</span>
                                                {/* Content snippet with highlighted match */}
                                                {wiki.content.toLowerCase().includes(q) && (
                                                    <div className="mt-1.5 flex items-start gap-1.5 bg-brand-yellow/5 rounded-lg px-2.5 py-2 border border-brand-yellow/10">
                                                        <span className="material-symbols-outlined text-brand-yellow/60 text-[14px] mt-px shrink-0">format_quote</span>
                                                        {getContentSnippet(wiki.content, q)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="material-symbols-outlined text-gray-600 text-[16px] group-hover:text-brand-yellow transition-colors mt-1">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 3: Database Content (Submissions) */}
                        {dbResults.length > 0 && (
                            <div className="px-3 pt-3 pb-1 border-t border-white/5">
                                <h3 className="px-2 mb-2 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
                                    🧪 Conteúdo da Comunidade ({dbResults.length})
                                </h3>
                                <div className="flex flex-col">
                                    {dbResults.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavigate(`/particula/${item.id}`)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-blue/5 active:bg-brand-blue/10 transition-all text-left group"
                                        >
                                            <div className="size-8 shrink-0 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                                <span className="material-symbols-outlined text-[18px]">article</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-gray-200 group-hover:text-brand-blue transition-colors block truncate">{item.title}</span>
                                                {item.category && (
                                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{item.category}</span>
                                                )}
                                            </div>
                                            <span className="material-symbols-outlined text-gray-600 text-[16px] group-hover:text-brand-blue transition-colors">arrow_forward</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {q !== '' && !isLoading && !hasResults && (
                            <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
                                <span className="material-symbols-outlined text-[48px] text-gray-700">search_off</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-400">Nenhum resultado para &quot;{query}&quot;</span>
                                    <span className="text-xs text-gray-600 mt-1">Tente buscar por &quot;bolsas&quot;, &quot;calouro&quot; ou &quot;pesquisa&quot;</span>
                                </div>
                            </div>
                        )}

                        {/* Footer Hint */}
                        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600">
                            <span className="font-bold uppercase tracking-widest">Hub HUB IME — Busca Global</span>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↑↓</kbd> navegar</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/5 rounded font-mono">↵</kbd> abrir</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
