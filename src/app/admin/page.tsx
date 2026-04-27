'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface DashboardCounts {
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    comentariosPendentes: number;
    narracoesFaltantes: number;
    trilhasTotal: number;
    tagsTotal: number;
    perguntasPendentes: number;
    perguntasRespondidas: number;
    totalAutores: number;
    autoresFrequentes: number;
    autoresMestres: number;
    oportunidadesTotal: number;
    pendentesPerfis: number;
    reportsPendentes: number;
    logsPendentes: number;
    knowledgePendentes: number;
}

export default function AdminDashboardOverview() {
    const [counts, setCounts] = useState<DashboardCounts>({
        pendentes: 0, aprovados: 0, rejeitados: 0,
        comentariosPendentes: 0,
        narracoesFaltantes: 0, trilhasTotal: 0, tagsTotal: 0,
        perguntasPendentes: 0, perguntasRespondidas: 0,
        totalAutores: 0, autoresFrequentes: 0, autoresMestres: 0,
        oportunidadesTotal: 0,
        pendentesPerfis: 0,
        reportsPendentes: 0,
        logsPendentes: 0,
        knowledgePendentes: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            setIsLoading(true);

            const [
                pendentesRes, aprovadosRes, rejeitadosRes,
                comPendentesRes,
                narracoesRes, trilhasRes, tagsRes,
                pergPendentesRes, pergRespondidasRes,
                oportunidadesRes, subsWithAuthorsRes,
                profilesPendentesRes,
                reportsPendentesRes,
                logsPendentesRes,
                knowledgePendentesRes,
            ] = await Promise.all([
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejeitado'),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado').or('description.is.null,description.eq.'),
                supabase.from('learning_trails').select('*', { count: 'exact', head: true }),
                supabase.from('submissions').select('tags').eq('status', 'aprovado'),
                supabase.from('perguntas').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('perguntas').select('*', { count: 'exact', head: true }).eq('status', 'respondida'),
                supabase.from('oportunidades').select('*', { count: 'exact', head: true }),
                supabase.from('submissions').select('user_id').eq('status', 'aprovado'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('review_status', 'pending'),
                supabase.from('feedback_reports').select('*', { count: 'exact', head: true }).neq('status', 'closed'),
                supabase.from('micro_articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('knowledge_suggestions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
            ]);

            // Calculate unique tags from all approved submissions
            let uniqueTagCount = 0;
            if (tagsRes.data) {
                const allTags = new Set<string>();
                (tagsRes.data as { tags: string[] }[]).forEach(s => {
                    if (s.tags) s.tags.forEach(t => allTags.add(t));
                });
                uniqueTagCount = allTags.size;
            }

            // Calculate author metrics
            let totalAutores = 0, autoresFrequentes = 0, autoresMestres = 0;
            const approvedSubs = (subsWithAuthorsRes.data as { user_id: string }[]) || [];
            if (approvedSubs.length > 0) {
                const authorCounts: Record<string, number> = {};
                approvedSubs.forEach(s => {
                    if (s.user_id) authorCounts[s.user_id] = (authorCounts[s.user_id] || 0) + 1;
                });
                totalAutores = Object.keys(authorCounts).length;
                autoresFrequentes = Object.values(authorCounts).filter(c => c >= 3).length;
                autoresMestres = Object.values(authorCounts).filter(c => c >= 10).length;
            }

            setCounts({
                pendentes: pendentesRes.count || 0,
                aprovados: aprovadosRes.count || 0,
                rejeitados: rejeitadosRes.count || 0,
                comentariosPendentes: comPendentesRes.count || 0,
                narracoesFaltantes: narracoesRes.count || 0,
                trilhasTotal: trilhasRes.count || 0,
                tagsTotal: uniqueTagCount,
                perguntasPendentes: pergPendentesRes.count || 0,
                perguntasRespondidas: pergRespondidasRes.count || 0,
                totalAutores,
                autoresFrequentes,
                autoresMestres,
                oportunidadesTotal: oportunidadesRes.count || 0,
                pendentesPerfis: profilesPendentesRes.count || 0,
                reportsPendentes: reportsPendentesRes.count || 0,
                logsPendentes: logsPendentesRes.count || 0,
                knowledgePendentes: knowledgePendentesRes.count || 0,
            });

            setIsLoading(false);
        }

        fetchCounts();
    }, []);

    const controlCards = [
        {
            title: 'Perfis USP',
            subtitle: 'Aprovação de Acesso',
            count: counts.pendentesPerfis || 0,
            icon: 'manage_accounts',
            color: 'electric' as const,
            href: '/admin/profiles',
            urgent: (counts.pendentesPerfis || 0) > 0,
        },
        {
            title: 'Comentários',
            subtitle: 'Aguardando Aprovação',
            count: counts.comentariosPendentes,
            icon: 'chat_bubble',
            color: 'electric' as const,
            href: '/admin/moderacao?tab=comentarios',
            urgent: counts.comentariosPendentes > 0,
        },
        {
            title: 'Auditório Hub',
            subtitle: 'Gerenciador de Acervo',
            count: counts.aprovados,
            icon: 'collections_bookmark',
            color: 'electric' as const,
            href: '/admin/moderacao?tab=acervo',
            urgent: false,
        },
        {
            title: 'Trilhas',
            subtitle: 'De Aprendizagem',
            count: counts.trilhasTotal,
            icon: 'route',
            color: 'electric' as const,
            href: '/admin/trilhas',
            urgent: false,
        },
        {
            title: 'Anomalias',
            subtitle: 'Aguardando Análise',
            count: counts.reportsPendentes,
            icon: 'bug_report',
            color: 'red' as const,
            href: '/admin/reports',
            urgent: counts.reportsPendentes > 0,
        },
        {
            title: 'Tags',
            subtitle: 'Termos Ativos',
            count: counts.tagsTotal,
            icon: 'sell',
            color: 'red' as const,
            href: '/admin/moderacao?tab=acervo',
            urgent: false,
        },
        {
            title: 'Logs do IFUSP',
            subtitle: 'Aguardando Aprovação',
            count: counts.logsPendentes,
            icon: 'message',
            color: 'red' as const,
            href: '/admin/drops',
            urgent: counts.logsPendentes > 0,
        },
        {
            title: 'Sugestões Grafo',
            subtitle: 'Novos Laboratórios',
            count: counts.knowledgePendentes,
            icon: 'hub',
            color: 'yellow' as const,
            href: '/admin/sugestoes',
            urgent: counts.knowledgePendentes > 0,
        },
    ];

    const colorMap = {
        red: {
            bg: 'bg-brand-red/10',
            text: 'text-brand-red',
            border: 'hover:border-brand-red/30',
            glow: 'bg-brand-red/5',
            label: 'text-brand-red',
        },
        yellow: {
            bg: 'bg-brand-yellow/10',
            text: 'text-brand-yellow',
            border: 'hover:border-brand-yellow/30',
            glow: 'bg-brand-yellow/5',
            label: 'text-brand-yellow',
        },
        electric: {
            bg: 'bg-[#0055ff]/10',
            text: 'text-[#0055ff]',
            border: 'hover:border-[#0055ff]/30',
            glow: 'bg-[#0055ff]/5',
            label: 'text-[#0055ff]',
        },
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-[#0055ff]">Torre de Controle</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                            Torre de <span className="text-[#0055ff]">Controle</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Centro de comando do Hub Lab-Div v3.1.5</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#0055ff] animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse delay-150"></div>
                        <span className="text-xs font-semibold text-gray-400 ml-2 uppercase tracking-wider">Status: Online</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white/5 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#0055ff] mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando a Torre de Controle...</p>
                </div>
            ) : (
                <>
                    {/* ─── Submission Status Row ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/admin/moderacao?tab=submissoes" className="relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-yellow/30 transition-all overflow-hidden cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aguardando</span>
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${counts.pendentes > 0 ? 'bg-brand-yellow/20 text-brand-yellow animate-pulse' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                                        <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.pendentes}</span>
                                    <span className="text-sm font-medium text-brand-yellow mt-1 block">Submissões Pendentes</span>
                                </div>
                            </div>
                        </Link>

                        <div className="relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#0055ff]/30 transition-all overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055ff]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#0055ff]/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Públicos</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0055ff]/10 text-[#0055ff]">
                                        <span className="material-symbols-outlined text-2xl">verified</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.aprovados}</span>
                                    <span className="text-sm font-medium text-[#0055ff] mt-1 block">Submissões Aprovadas</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-red/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivados</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                                        <span className="material-symbols-outlined text-2xl">block</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.rejeitados}</span>
                                    <span className="text-sm font-medium text-brand-red mt-1 block">Submissões Rejeitadas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── TORRE DE CONTROLE: 6 Cards Grid ─── */}
                    <div className="pt-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#0055ff] text-2xl">security</span>
                            Moderação & Controle
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {controlCards.map((card) => {
                                const colors = colorMap[card.color];
                                return (
                                    <Link
                                        key={card.title}
                                        href={card.href}
                                        className={`relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl ${colors.border} transition-all overflow-hidden cursor-pointer`}
                                    >
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${colors.glow} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-50 transition-opacity`}></div>
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">{card.subtitle}</span>
                                                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colors.bg} ${colors.text} ${card.urgent ? 'animate-pulse' : ''}`}>
                                                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tight">{card.count}</span>
                                                    {card.urgent && (
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${colors.label}`}>⚡ Ação</span>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-bold mt-1 block ${colors.label}`}>{card.title}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Perguntas Section ─── */}
                    <div className="pt-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#0055ff] text-2xl">forum</span>
                            Pergunte a um Cientista
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href="/admin/perguntas" className="relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all overflow-hidden cursor-pointer">
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aguardando Resposta</span>
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${counts.perguntasPendentes > 0 ? 'bg-brand-red/20 text-brand-red animate-pulse' : 'bg-brand-red/10 text-brand-red'}`}>
                                            <span className="material-symbols-outlined text-2xl">mark_chat_unread</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.perguntasPendentes}</span>
                                        <span className="text-sm font-medium text-brand-red mt-1 block">
                                            {counts.perguntasPendentes > 0 ? '⚡ Perguntas para responder!' : 'Nenhuma pendente'}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div className="relative group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#0055ff]/30 transition-all overflow-hidden">
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Respondidas</span>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#0055ff]/10 text-[#0055ff]">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.perguntasRespondidas}</span>
                                        <span className="text-sm font-medium text-[#0055ff] mt-1 block">Perguntas Respondidas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Engajamento Section ─── */}
                    <div className="pt-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-red text-2xl">diversity_3</span>
                            Engajamento da Comunidade
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Autores</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.totalAutores}</div>
                                <div className="text-[10px] font-bold text-[#0055ff] mt-1">PESQUISADORES ATIVOS</div>
                            </div>
                            <div className="bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Frequentes (3+)</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.autoresFrequentes}</div>
                                <div className="text-[10px] font-bold text-brand-yellow mt-1">RUMO À MAESTRIA</div>
                            </div>
                            <div className="bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mestres (10+)</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.autoresMestres}</div>
                                <div className="text-[10px] font-bold text-brand-red mt-1">LÍDERES DE DIVULGAÇÃO</div>
                            </div>
                            <div className="bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Oportunidades</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.oportunidadesTotal}</div>
                                <div className="text-[10px] font-bold text-[#0055ff] mt-1">MURAL ATIVO</div>
                            </div>
                        </div>
                    </div>
                    {/* Footer da Torre */}
                    <div className="pt-8 mb-8 border-t border-gray-800 flex justify-center text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                        Sistema Lab-Div v3.1.5 • Torre de Controle
                    </div>
                </>
            )}
        </div>
    );
}
