'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useDepartmentFilterStore } from '@/store/useDepartmentFilterStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface PostRecord {
    id: string;
    title: string;
    description: string;
    category: string;
    media_url: string;
    media_type: string;
    created_at: string;
    event_date: string | null;
    is_historical: boolean;
    is_golden_standard: boolean;
    authors: string;
    researcherIds: string[];
}

export function DepartmentFeedClient({ posts }: { posts: PostRecord[] }) {
    const { selectedResearchers } = useDepartmentFilterStore();
    const [isLoading, setIsLoading] = useState(true);

    // Skeleton UX Protection
    useEffect(() => {
        // Simulando hidratação e processamento para garantir zero layout shift brusco
        const t = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(t);
    }, []);

    // 1. Filtragem Central
    const filteredPosts = useMemo(() => {
        if (selectedResearchers.length === 0) return posts;
        return posts.filter(post => 
            // Mostra o post se houver interseção entre os pesquisadores selecionados e os pesquisadores do post
            post.researcherIds.some(id => selectedResearchers.includes(id))
        );
    }, [posts, selectedResearchers]);

    // 2. Separação: Hall da Fama vs Feed Geral
    const hallOfFame = filteredPosts.filter(p => p.is_golden_standard);
    const generalFeed = filteredPosts.filter(p => !p.is_golden_standard);

    // 3. Agrupamento em Semestres para o Hall da Fama
    const hallOfFameBySemester = useMemo(() => {
        const groups: Record<string, PostRecord[]> = {};
        hallOfFame.forEach(post => {
            const date = new Date(post.event_date || post.created_at);
            const year = date.getFullYear();
            const semester = date.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
            const label = `${semester} de ${year}`;
            if (!groups[label]) groups[label] = [];
            groups[label].push(post);
        });
        return groups;
    }, [hallOfFame]);

    const semesterKeys = Object.keys(hallOfFameBySemester).sort((a, b) => b.localeCompare(a)); // Descending by string works for "2º Semestre de 2026" > "1º Semestre de 2026"
    const [activeSemester, setActiveSemester] = useState<string>(semesterKeys[0] || '');

    useEffect(() => {
        if (semesterKeys.length > 0 && !semesterKeys.includes(activeSemester)) {
            setActiveSemester(semesterKeys[0]);
        }
    }, [semesterKeys, activeSemester]);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-card-dark rounded-3xl w-full"></div>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl w-full"></div>
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-3xl w-full"></div>
            </div>
        );
    }

    if (filteredPosts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-card-dark rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
                    science
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Nenhum registro encontrado
                </h3>
                <p className="text-gray-500 max-w-sm">
                    {selectedResearchers.length > 0 
                        ? 'O pesquisador selecionado ainda não possui publicações marcadas neste departamento.'
                        : 'O conhecimento está a ser forjado. Seja o primeiro a publicar usando o botão da direita!'}
                </p>
                {selectedResearchers.length > 0 && (
                    <button onClick={() => useDepartmentFilterStore.getState().clearFilters()} className="mt-4 px-4 py-2 bg-brand-red/10 text-brand-red font-bold text-xs uppercase rounded-full">
                        Limpar Filtros
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-12">
            
            {/* SEÇÃO 1: HALL DA FAMA (Padrão Ouro) */}
            {semesterKeys.length > 0 && (
                <div className="relative p-[2px] rounded-[34px] bg-gradient-to-br from-brand-yellow/50 via-brand-yellow/10 to-transparent shadow-lg shadow-brand-yellow/5">
                    <div className="bg-white dark:bg-[#121212] rounded-[32px] p-8 h-full w-full">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-yellow to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/30 text-white">
                                    <span className="material-symbols-outlined">emoji_events</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-brand-yellow uppercase tracking-tight">Hall da Fama</h3>
                                    <p className="text-sm font-bold text-gray-500">Padrão Ouro (Golden Standard)</p>
                                </div>
                            </div>

                            {/* Abas de Semestre */}
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-x-auto max-w-full no-scrollbar">
                                {semesterKeys.map(sem => (
                                    <button
                                        key={sem}
                                        onClick={() => setActiveSemester(sem)}
                                        className={`relative px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                            activeSemester === sem 
                                            ? 'text-gray-900 dark:text-brand-yellow' 
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {sem}
                                        {activeSemester === sem && (
                                            <motion.div 
                                                layoutId="semester-tab"
                                                className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-full -z-10"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conteúdo do Semestre Ativo */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSemester}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {hallOfFameBySemester[activeSemester]?.map(post => (
                                    <Link href={`/arquivo/${post.id}`} key={post.id} className="group relative break-inside-avoid bg-gray-50 dark:bg-card-dark p-6 rounded-3xl border border-gray-200 dark:border-white/5 hover:border-brand-yellow/50 transition-all flex flex-col gap-3">
                                        <div className="absolute top-4 right-4 text-brand-yellow opacity-50 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined">star</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg pr-8">{post.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400 capitalize">{post.authors}</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-brand-yellow">Ouro</span>
                                        </div>
                                    </Link>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* SEÇÃO 2: FEED GERAL */}
            {generalFeed.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Publicações Regulares</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {generalFeed.map(post => (
                            <Link href={`/arquivo/${post.id}`} key={post.id} className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-gray-200 dark:border-white/5 hover:shadow-lg transition-all flex flex-col gap-3">
                                {post.is_historical && (
                                    <span className="self-start text-[10px] font-black uppercase tracking-widest bg-brand-yellow/10 text-brand-yellow px-3 py-1 rounded-full mb-2">
                                        Marco Histórico
                                    </span>
                                )}
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{post.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-3">{post.description}</p>
                                <span className="text-xs font-medium text-gray-400 mt-auto pt-4">{new Date(post.created_at).toLocaleDateString()}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
