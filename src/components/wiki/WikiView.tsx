'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ShieldCheck,
    Zap,
    Atom,
    Coins,
    Telescope,
    Brain,
    ChevronRight,
    AlertCircle,
    ArrowLeft,
    HeartHandshake,
    Network,
    Microscope,
    Compass,
    Landmark
} from 'lucide-react';
import { WikiFeedbackCard } from '@/app/wiki/WikiFeedbackCard';

// --- DATA STRUCTURE (O Síncrotron) ---
export const wikiCells = [
    // --- Blue Group (Produção e Comunicação) ---
    {
        id: 'guia-de-boas-praticas',
        title: 'Guia de Boas Práticas',
        subtitle: 'Produção, Créditos e Qualidade.',
        icon: <ShieldCheck className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/guia-de-boas-praticas',
        description: 'Diretrizes oficiais para produção de mídia: como fotografar, filmar e creditar colaboradores no Hub.',
        details: [
            'Co-autoria e Créditos: Como marcar sua equipe',
            'Fotografia e Vídeo: Padrões de iluminação e enquadramento',
            'Padrões Técnicos: Tamanhos de arquivos e categorias'
        ],
        keywords: ['guia', 'boas práticas', 'manual', 'foto', 'vídeo', 'créditos', 'qualidade', 'padrões'],
        cta: 'Ver Guia de Produção'
    },
    {
        id: 'divulgacao',
        title: 'Emissão de Luz',
        subtitle: 'Toolkit de Divulgação HUB IME.',
        icon: <Telescope className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/divulgacao',
        description: 'Metodologia e ferramentas para transformar dados técnicos em impacto visual.',
        details: [
            'Mapeamento 360°, VR e vídeos imersivos',
            'Guia Visual HUB IME (Azul Elétrico) e MIT Style',
            'Toolkit de design para posters e redes sociais'
        ],
        keywords: ['divulgação', 'design', 'hub-ime', '360', 'vr', 'poster', 'mídia', 'comunicação', 'impacto', 'toolkit'],
        cta: 'Gerar Impacto'
    },
    {
        id: 'extensao',
        title: 'Interações de Fronteira',
        subtitle: 'Cultura, Eventos e Grupos.',
        icon: <Network className="w-8 h-8" />,
        color: 'brand-blue',
        href: '/wiki/extensao',
        description: 'Catálogo de grupos de extensão, eventos "Física para Todos" e projetos de cultura.',
        details: [
            'Catálogo de Grupos de Extensão USP',
            'Eventos: Física para Todos e Palestras',
            'Projetos de Cultura e Proposição de Ações'
        ],
        keywords: ['extensão', 'cultura', 'eventos', 'física para todos', 'grupos', 'projetos'],
        cta: 'Explorar Fronteiras'
    },

    // --- Yellow Group (Vivência e Suporte) ---
    {
        id: 'calouro',
        title: 'Iniciação de Partículas',
        subtitle: 'Guia de Sobrevivência USP/IF.',
        icon: <Zap className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/calouro',
        description: 'Logística do campus, serviços essenciais e moradia estudantil para novos ingressantes.',
        details: [
            'Localização: Edifício Principal, Ala Central e Didática',
            'Bandejão (SAS), Júpiter Web e e-mail institucional',
            'Moradia: CRUSP (Blocos A a G) e Vida no Campus'
        ],
        keywords: ['bandejão', 'crusp', 'matão', 'sobrevivência', 'calouro', 'ajuda', 'logística', 'jupiter', 'sas'],
        cta: 'Iniciar Trajetória'
    },
    {
        id: 'protecao',
        title: 'Protocolos de Proteção',
        subtitle: 'Inclusão, Saúde Mental e Apoio.',
        icon: <HeartHandshake className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/protecao',
        description: 'Políticas de permanência, suporte a neurodiversidade (TEA) e canais de acolhimento.',
        details: [
            'Neurodiversidade: Guia Portaria PRIP 059/2024 (TEA)',
            'Apoio Psicológico: Rotas de acolhimento (IP-USP)',
            'Canais de Escuta e Grupos de Afinidade USP'
        ],
        keywords: ['proteção', 'saúde mental', 'tea', 'neurodiversidade', 'acolhimento', 'prip', 'suporte', 'ajuda', 'inclusão', 'bem-estar', 'pcd'],
        cta: 'Solicitar Suporte'
    },
    {
        id: 'carreira',
        title: 'Vetores de Carreira',
        subtitle: 'O Futuro Pós-USP.',
        icon: <Compass className="w-8 h-8" />,
        color: 'brand-yellow',
        href: '/wiki/carreira',
        description: 'Trajetórias acadêmicas e profissionais: Academia, Indústria, Física Médica e Educação.',
        details: [
            'Pós-Graduação: Mestrado e Doutorado',
            'Mercado de Trabalho e Inovação',
            'Física Médica, Ensino e Setor Privado'
        ],
        keywords: ['carreira', 'futuro', 'trabalho', 'indústria', 'academia', 'pós-graduação', 'ensino', 'vagas'],
        cta: 'Mapear Futuro'
    },

    // --- Red Group (Institucional e Acadêmico) ---
    {
        id: 'pesquisa',
        title: 'Sistemas de Pesquisa',
        subtitle: 'Iniciação Científica e Labs.',
        icon: <Microscope className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/pesquisa',
        description: 'Guia de Iniciação Científica, Laboratórios do USP e navegação no sistema Ateneu.',
        details: [
            'Como encontrar um orientador de IC',
            'Laboratórios de Pesquisa e Infraestrutura',
            'Sistema Ateneu: Cadastro e Relatórios'
        ],
        keywords: ['pesquisa', 'ic', 'iniciação científica', 'laboratório', 'ateneu', 'orientador', 'ciência'],
        cta: 'Descobrir Labs'
    },
    {
        id: 'bolsas',
        title: 'Energia de Permanência',
        subtitle: 'Auxílios e Retenção Estudantil.',
        icon: <Coins className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/bolsas',
        description: 'Informações sobre programas de permanência, editais ativos e suporte estudantil.',
        details: [
            'PAPFE: Auxílio Permanência (PRIP)',
            'Editais 2026: Monitoria, Pró-Aluno e IC',
            'Inclusão: Apoio a grupos vulneráveis e PCDs'
        ],
        keywords: ['bolsas', 'papfe', 'permanência', 'monitoria', 'ic', 'iniciação científica', 'dinheiro', 'editais', 'auxílio', 'prip'],
        cta: 'Ver Editais Ativos'
    },
    {
        id: 'USP',
        title: 'Estrutura da Matéria',
        subtitle: 'Cursos, PPPs e Departamentos.',
        icon: <Atom className="w-8 h-8" />,
        color: 'brand-red',
        href: '/wiki/USP',
        description: 'Guia acadêmico sobre os cursos, governança e estrutura curricular do instituto.',
        details: [
            'Bacharelado, Licenciatura e Física Médica (PPP 2025)',
            'Governança: Papel da CG e CoCs',
            'Grade: Optativas, Eletivas e ATPAs'
        ],
        keywords: ['ppp', 'bacharelado', 'licenciatura', 'física médica', 'grade', 'optativas', 'atpa', 'comissão', 'cg', 'coc'],
        cta: 'Explorar Currículo'
    }
];

export const institutoCell = {
    id: 'instituto',
    title: 'O Instituto de Matemática e Estatística',
    subtitle: 'Estrutura, História e Espaços.',
    icon: <Landmark className="w-8 h-8" />,
    color: 'brand-blue-USP',
    href: '/wiki/instituto',
    description: 'Mergulhe na história do USP e entenda como um dos institutos de física mais respeitados do mundo é organizado atualmente.',
    details: [
        'Organização: Diretoria, Conselhos e Comissões',
        'História: Legado e Pioneirismo na Ciência',
        'Departamentos e Centros de Pesquisa'
    ],
    keywords: ['USP', 'instituto', 'física', 'departamento', 'auditório', 'história', 'alimentação', 'convivência', 'mapa'],
    cta: 'Aprender sobre o USP'
};

const quizCell = {
    id: 'quiz',
    title: 'Teste de Radiação',
    subtitle: 'Quiz de Conhecimento Hub.',
    icon: <Brain className="w-8 h-8" />,
    color: 'brand-red',
    href: '/wiki/quiz',
    description: 'Desafie seus conhecimentos e exploda o contador Geiger ao acertar os desafios.',
    details: [
        'Curiosidades históricas do USP',
        'Desafios de física e divulgação',
        'Ranking de colisão da comunidade'
    ],
    keywords: ['quiz', 'teste', 'desafio', 'conhecimento', 'história', 'ranking', 'geiger'],
    cta: 'Iniciar Varredura'
};


const renderUSP = (text: string) => {
    if (!text) return text;
    const standardized = text.replace(/IME USP|IF USP/gi, 'USP');
    const parts = standardized.split(/(USP)/gi);
    return parts.map((part, i) => {
        if (part.toUpperCase() === 'USP') {
            return (
                <span key={i} className="inline font-black tracking-tighter">
                    <span className="text-brand-yellow">IF</span><span className="text-brand-blue">USP</span>
                </span>
            );
        }
        return part;
    });
};

export function WikiView() {
    return (
        <div className="bg-transparent pb-12 overflow-x-hidden pt-8">
            <div className="max-w-6xl mx-auto">
                {/* --- Elite Header --- */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] mb-4 text-gray-900 dark:text-white">
                                WIKI <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">HUB</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl font-medium leading-relaxed">
                                {renderUSP('O Síncrotron de Conhecimento do USP. O repositório definitivo para sobrevivência, ética e divulgação científica.')}
                            </p>
                        </motion.div>


                    </div>
                </div>



                {/* --- Wiki Matrix (Grid de Elite 3x3) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <AnimatePresence mode="popLayout">
                        {wikiCells.map((cell: any, idx) => (
                            <motion.div
                                key={cell.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                            >
                                <Link
                                    href={cell.href}
                                    className={`relative block h-full group glass-card rounded-[40px] p-8 hover:border-${cell.color}/30 transition-all shadow-2xl overflow-hidden`}
                                >
                                    <div className={`absolute -right-20 -top-20 size-64 bg-${cell.color}/5 blur-[100px] group-hover:bg-${cell.color}/10 transition-colors`}></div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`size-16 rounded-[24px] bg-${cell.color}/10 text-${cell.color} flex items-center justify-center ring-1 ring-${cell.color}/20 group-hover:scale-110 group-hover:ring-${cell.color}/50 transition-all duration-500`}>
                                                {cell.icon}
                                            </div>
                                            <div className="h-2 w-12 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full bg-${cell.color}`}
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: '100%' }}
                                                    transition={{ duration: 1.5, delay: idx * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                        <h3 className={`text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-${cell.color} transition-colors italic uppercase tracking-tighter`}>
                                            {renderUSP(cell.title)}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                                            {cell.subtitle}
                                        </p>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2">
                                            {renderUSP(cell.description)}
                                        </p>
                                        <div className="space-y-2 mb-8">
                                            {cell.details.map((detail: string, dIdx: number) => (
                                                <div key={dIdx} className="flex items-start gap-2 text-[11px] text-gray-500 font-bold group-hover:text-gray-300 transition-colors">
                                                    <div className={`size-1.5 rounded-full bg-${cell.color}/40 mt-1 cursor-default`} />
                                                    <span>{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <span className={`text-[10px] font-black text-${cell.color} uppercase tracking-[0.2em]`}>{cell.cta}</span>
                                            <div className={`size-8 rounded-full bg-${cell.color}/10 flex items-center justify-center text-${cell.color} group-hover:translate-x-1 transition-transform`}>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>



                {/* --- Horizontal Instituto Banner --- */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="relative group w-full mb-12"
                >
                    <div className="absolute -inset-0.5 bg-brand-blue-USP/30 rounded-[32px] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Link
                        href={institutoCell.href}
                        className="relative flex flex-col md:flex-row items-center justify-between w-full p-8 md:p-12 rounded-[32px] bg-gradient-to-r from-brand-blue-USP/20 to-brand-blue/10 backdrop-blur-2xl border border-white/5 hover:border-brand-blue-USP/40 transition-all overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue-USP/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="size-20 bg-brand-blue-USP/10 text-brand-blue-USP rounded-[28px] flex items-center justify-center ring-1 ring-brand-blue-USP/20 group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-brand-blue-USP/20">
                                {institutoCell.icon}
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">
                                        {renderUSP(institutoCell.title)}
                                    </h3>
                                    <span className="hidden md:block px-3 py-1 bg-brand-blue-USP/20 border border-brand-blue-USP/30 text-brand-blue-USP text-[10px] font-black uppercase rounded-full italic">Institucional</span>
                                </div>
                                <p className="text-gray-400 font-medium max-w-md">
                                    {renderUSP(institutoCell.description)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 md:mt-0 relative z-10">
                            <div className="px-12 py-5 bg-brand-blue-USP text-white font-black rounded-[24px] group-hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-brand-blue-USP/30">
                                {institutoCell.cta} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* --- Horizontal Quiz Banner --- */}
                <motion.div
                    id="teste-radiacao"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative group w-full mb-4 scroll-mt-32"
                >
                    <div className="absolute -inset-0.5 bg-brand-blue/30 rounded-[32px] blur opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>
                    <Link
                        href={quizCell.href}
                        className="relative flex flex-col md:flex-row items-center justify-between w-full p-8 md:p-12 rounded-[32px] bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-2xl border border-white/5 hover:border-brand-blue/40 transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="size-20 bg-brand-red/10 text-brand-red rounded-[28px] flex items-center justify-center ring-1 ring-brand-red/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl shadow-brand-red/20">
                                {quizCell.icon}
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                    <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">
                                        {quizCell.title}
                                    </h3>
                                    <span className="hidden md:block px-3 py-1 bg-brand-red/20 border border-brand-red/30 text-brand-red text-[10px] font-black uppercase rounded-full">Gamificação</span>
                                </div>
                                <p className="text-gray-400 font-medium max-w-md">
                                    {quizCell.description} <span className="text-brand-blue font-bold">Exploda o contador Geiger.</span>
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 md:mt-0 relative z-10">
                            <div className="px-12 py-5 bg-brand-blue text-white font-black rounded-[24px] group-hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-brand-blue/30">
                                {quizCell.cta} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>

        </div>
    );
}
