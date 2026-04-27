"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Zap, Atom, Microscope, Binary, LayoutGrid, Timer, Layers, ShieldCheck, Milestone, Sparkles, Link2, AlertTriangle, Play, CheckCircle2, Circle, GraduationCap, ArrowRight, User, Loader2, Globe, Network, Clock, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trail } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { updateProfile } from '@/app/actions/profiles';
import { Download, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { TrilhasFeedbackCard } from './TrilhasFeedbackCard';
import { JupiterEvolutionModal } from './JupiterEvolutionModal';

const COURSE_MAPS = [
    { id: 'bach', name: 'Bacharelado em Física', image: '/unnamed.jpg', pdf: '/Manual-Bacharelado-Fisica-USP-2025_0.pdf' },
    { id: 'lic', name: 'Licenciatura em Física', image: '/unnamed.jpg', pdf: '/Manual_Licenciatura_2022_0.pdf' },
    { id: 'med', name: 'Física Médica', image: '/unnamed.jpg', pdf: '/Jupiterweb-med.pdf' },
];

const AXIS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    bach: { label: 'Bacharelado', color: '#00A3FF', icon: Atom },
    med: { label: 'Física Médica', color: '#FF4B4B', icon: Microscope },
    lic: { label: 'Licenciatura', color: '#FFD700', icon: Binary },
    comum: { label: 'Ciclo Básico', color: '#888888', icon: Zap },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: any }> = {
    obrigatoria: { label: 'Obrigatória', icon: ShieldCheck },
    eletiva: { label: 'Eletiva', icon: Milestone },
    livre: { label: 'Livre', icon: Sparkles },
};


export default function TrilhasClient({
    initialTrails,
    cursandoTrails = [],
    completedTrailIds: initialCompletedIds = [],
    userProfile
}: {
    initialTrails: Trail[],
    cursandoTrails?: Trail[],
    completedTrailIds?: string[],
    userProfile?: any
}) {
    const [axisFilter, setAxisFilter] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [semesterFilter, setSemesterFilter] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(9); // Pagination: 3x3 block
    const [visibleCountDash, setVisibleCountDash] = useState(6);
    const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
    const [cursandoIds, setCursandoIds] = useState<string[]>(cursandoTrails.map(t => t.id));
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isSyncing, setIsSyncingState] = useState(false);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const setIsSyncing = useCallback((val: boolean) => {
        if (val) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            setIsSyncingState(true);
        } else {
            syncTimeoutRef.current = setTimeout(() => {
                setIsSyncingState(false);
            }, 4000);
        }
    }, []);
    const [dashboardTab, setDashboardTab] = useState<'faltam' | 'concluidas' | 'cursando'>('faltam');
    const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
    const [sortOrder, setSortOrder] = useState<'trending' | 'sem-asc' | 'sem-desc'>('sem-asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid');
    const [selectedCourseMap, setSelectedCourseMap] = useState(COURSE_MAPS[0]);
    const [isVisualMapOpen, setIsVisualMapOpen] = useState(false);
    const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
    const router = useRouter();

    const resolvePrereqName = (prereqCode: string) => {
        const isLic = userProfile?.course?.toLowerCase().includes('licenciatura');
        if (isLic && prereqCode === 'MAT0112') {
            return 'MAT0105'; // Geometria Analítica em vez de Vetores e Geometria
        }
        return prereqCode;
    };

    // 🧠 Motor de Equivalências (v4.20)
    const effectiveCompletedIds = useMemo(() => {
        const directIds = new Set(completedIds);
        const completedCodes = new Set(
            initialTrails.filter(t => directIds.has(t.id)).map(t => t.course_code)
        );

        const indirectIds = new Set<string>();

        initialTrails.forEach(trail => {
            if (directIds.has(trail.id)) return;

            // Caso 1: N-para-1 (Ex: Lic -> Bach) via equivalency_map
            if (trail.equivalency_map) {
                Object.entries(trail.equivalency_map).forEach(([_, config]) => {
                    const { codes, logic } = config;
                    const isSatisfied = logic === 'AND'
                        ? codes.every(c => completedCodes.has(c))
                        : codes.some(c => completedCodes.has(c));

                    if (isSatisfied) indirectIds.add(trail.id);
                });
            }

            // Caso 2: Bach -> Lic (Automático Descendente)
            // Se esta disciplina faz parte de um conjunto de origem de uma alvo que já foi concluída
            initialTrails.forEach(targetTrail => {
                if (completedCodes.has(targetTrail.course_code) && targetTrail.equivalency_map) {
                    Object.values(targetTrail.equivalency_map).forEach(config => {
                        if (config.codes.includes(trail.course_code || '')) {
                            indirectIds.add(trail.id);
                        }
                    });
                }
            });
        });

        return Array.from(new Set([...Array.from(directIds), ...Array.from(indirectIds)]));
    }, [completedIds, initialTrails]);

    const isUspUser = userProfile?.email ? userProfile.email.endsWith('@usp.br') : false;

    // Semester Options
    const availableSemesters = useMemo(() => {
        const semesters = new Set<number>();
        initialTrails.forEach(t => {
            if (t.excitation_level) semesters.add(t.excitation_level);
        });
        return Array.from(semesters).sort((a, b) => a - b);
    }, [initialTrails]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(9);
    }, [axisFilter, categoryFilter, semesterFilter, searchQuery]);

    // Sync modal course with user profile
    useEffect(() => {
        if (userProfile?.course) {
            const courseStr = userProfile.course.toLowerCase();
            let courseId = 'bach'; // default
            if (courseStr.includes('licenciatura')) {
                courseId = 'lic';
            } else if (courseStr.includes('médica') || courseStr.includes('medica')) {
                courseId = 'med';
            }
            
            const map = COURSE_MAPS.find(m => m.id === courseId);
            if (map) setSelectedCourseMap(map);
        }
    }, [userProfile, isVisualMapOpen]);

    // Filter Logic
    const filteredTrails = useMemo(() => {
        // Map of filter keys to database keys
        const contextAxisMap: Record<string, string> = {
            'bach': 'bacharelado',
            'lic': 'licenciatura',
            'med': 'fisica_medica'
        };

        return initialTrails.map(t => {
            let effectiveCategory = t.category;

            // Relatividade de Categoria (v4.20: Prioridade absoluta para o filtro ativo)
            if (t.category_map) {
                let contextAxis = axisFilter && axisFilter !== 'comum' ? contextAxisMap[axisFilter] : null;

                // Se não houver filtro ativo, usamos o curso do usuário
                if (!contextAxis && userProfile?.course) {
                    const courseStr = userProfile.course.toLowerCase();
                    contextAxis = courseStr.includes('licenciatura') ? 'licenciatura' :
                        courseStr.includes('médica') || courseStr.includes('medica') ? 'fisica_medica' :
                            courseStr.includes('bacharelado') ? 'bacharelado' : null;
                }

                if (contextAxis && t.category_map[contextAxis] && t.category_map[contextAxis] !== 'nao_se_aplica') {
                    effectiveCategory = t.category_map[contextAxis] as any;
                }
            }

            // O isEquivalencyOnly verifica se foi completado de forma efetiva mas não diretamente pelo usuário
            const isEquivalencyOnly = effectiveCompletedIds.includes(t.id) && !completedIds.includes(t.id);

            return { ...t, effectiveCategory, isEquivalencyOnly };
        }).filter(t => {
            // DIRETRIZ 1: Filtro de Curso baseado no category_map
            let axisMatch = true;
            if (axisFilter && axisFilter !== 'comum') {
                const dbKey = contextAxisMap[axisFilter];
                axisMatch = !!(t.category_map && t.category_map[dbKey] && t.category_map[dbKey] !== 'nao_se_aplica');
            }

            // DIRETRIZ 2: "Ciclo Básico" como filtro transversal (semester <= 4 + Obrigatória)
            if (axisFilter === 'comum') {
                const isBasicCycle = (t.excitation_level || 0) <= 4;
                const isMandatoryInContext = t.effectiveCategory === 'obrigatoria';
                axisMatch = isBasicCycle && isMandatoryInContext;
            }

            // Filtro de Categoria DEVE usar a effectiveCategory calculada
            const categoryMatch = !categoryFilter || t.effectiveCategory === categoryFilter;
            const semesterMatch = !semesterFilter || t.excitation_level === semesterFilter;
            const searchMatch = !searchQuery.trim() || 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.course_code || '').toLowerCase().includes(searchQuery.toLowerCase());
            return axisMatch && categoryMatch && semesterMatch && searchMatch;
        }).sort((a, b) => {
            if (sortOrder === 'sem-asc') {
                return (a.excitation_level || 99) - (b.excitation_level || 99);
            }
            if (sortOrder === 'sem-desc') {
                return (b.excitation_level || 0) - (a.excitation_level || 0);
            }
            // Default: trending (submissionCount)
            return (b.submissionCount || 0) - (a.submissionCount || 0);
        });
    }, [initialTrails, axisFilter, categoryFilter, semesterFilter, sortOrder, searchQuery, userProfile]);

    // Dashboard Stats Logic
    const stats = useMemo(() => {
        if (!userProfile) return null;

        // Fallback e Verificação Estrita: Apenas IME USP e com curso definido
        const isUSP = userProfile.institute?.toUpperCase() === 'USP' || userProfile.institute?.toUpperCase() === 'IME USP';
        if (!isUSP || !userProfile.course) return {
            percentage: 0,
            totalMandatory: 0,
            completedMandatoryCount: 0,
            missingMandatory: [],
            completedTotal: [],
            cursandoMandatory: [],
            isInvalid: true
        };

        const courseStr = userProfile.course?.toLowerCase() || '';
        const userAxisKey = courseStr.includes('licenciatura') ? 'licenciatura' :
            courseStr.includes('médica') || courseStr.includes('medica') ? 'fisica_medica' :
                courseStr.includes('bacharelado') ? 'bacharelado' : null;

        const userAxisFallback = courseStr.includes('licenciatura') ? 'lic' :
            courseStr.includes('médica') || courseStr.includes('medica') ? 'med' :
                courseStr.includes('bacharelado') ? 'bach' : null;

        // Filtro Estrito: Apenas obrigatórias do eixo ESPECÍFICO do usuário (exclui Ciclo Básico 'comum')
        const mandatoryTrails = initialTrails.filter(t => {
            if (!userAxisKey || !userAxisFallback) return false;

            // Requisito: Apenas matérias do eixo específico ou comum (CIC)
            if (t.axis !== userAxisFallback && t.axis !== 'comum') return false;

            // Prioriza category_map
            if (t.category_map && t.category_map[userAxisKey]) {
                if (t.category_map[userAxisKey] === 'obrigatoria') return true;
                if (t.category_map[userAxisKey] !== 'nao_se_aplica') return false;
            }

            // Fallback (apenas se nao tiver mapa)
            return t.category === 'obrigatoria';
        });

        // Cálculo de Progresso usando IDs Efetivos (v4.20)
        const completedTotal = initialTrails.filter(t => effectiveCompletedIds.includes(t.id));
        const cursandoTotal = initialTrails.filter(t => cursandoIds.includes(t.id));

        const mandatoryAll = initialTrails.filter(t => {
            if (!t.category_map || !userAxisKey) return false;
            return t.category_map[userAxisKey] === 'obrigatoria';
        });

        const completedMandatory = mandatoryAll.filter(t => effectiveCompletedIds.includes(t.id));

        const percentage = mandatoryAll.length > 0
            ? Math.round((completedMandatory.length / mandatoryAll.length) * 100)
            : 0;

        // "A Fazer" should ideally be ALL mandatories the user hasn't done + any eletiva they have explicitly marked as 'cursando'??? 
        // No, "A Fazer" is usually just the required track. But let's show all valid courses for the axis if requested, 
        // wait, showing all (165+) is too much. Keep "missing" as mandatory, but "cursando" as ALL courses user marked.
        const missingMandatory = mandatoryAll.filter(t => !effectiveCompletedIds.includes(t.id) && !cursandoIds.includes(t.id))
            .sort((a, b) => (a.excitation_level || 99) - (b.excitation_level || 99));

        return {
            percentage,
            totalMandatory: mandatoryAll.length,
            completedMandatoryCount: completedMandatory.length,
            missingMandatory,
            completedTotal,
            cursandoMandatory: cursandoTotal, // Renaming key for compatibility, but holds ALL cursando
            isInvalid: false
        };
    }, [initialTrails, completedIds, cursandoIds, userProfile, effectiveCompletedIds]);

    const toggleCompletion = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);
        setIsSyncing(true);

        try {
            const { data, error } = await supabase.rpc('toggle_trail_completion', { field_trail_id: trailId });
            if (error) throw error;

            if (data === true) {
                setCompletedIds(prev => [...prev, trailId]);
                // Se concluir, remove do cursando se estiver lá
                setCursandoIds(prev => prev.filter(id => id !== trailId));
                toast.success('Disciplina concluída! +10 XP', {
                    icon: '🚀',
                    style: { background: '#121212', color: '#fff', border: '1px solid #00A3FF' }
                });
            } else {
                setCompletedIds(prev => prev.filter(id => id !== trailId));
                toast('Disciplina removida da matriz pessoal', { icon: '♻️' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar progresso');
        } finally {
            setIsUpdating(null);
            setTimeout(() => {
                setIsSyncing(false);
                router.refresh(); // Soft reload para garantir sincronia do Server Component
            }, 2000);
        }
    };

    const toggleCursando = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);
        setIsSyncing(true);

        try {
            // Chama o RPC toggle_trail_status (que já lida com 'cursando')
            const { error } = await supabase.rpc('toggle_trail_status', {
                p_trail_id: trailId,
                p_status: 'cursando'
            });

            if (error) throw error;

            const isAlreadyCursando = cursandoIds.includes(trailId);
            if (isAlreadyCursando) {
                setCursandoIds(prev => prev.filter(id => id !== trailId));
                toast('Removida do radar atual', { icon: '📡' });
            } else {
                setCursandoIds(prev => [...prev, trailId]);
                // Se marcar como cursando, remove do concluído se estiver lá
                setCompletedIds(prev => prev.filter(id => id !== trailId));
                toast.success('Adicionada ao Radar Ativo!', { icon: '⚡' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar radar');
        } finally {
            setIsUpdating(null);
            setTimeout(() => {
                setIsSyncing(false);
                router.refresh();
            }, 2000);
        }
    };



    const slicedTrails = useMemo(() => {
        return filteredTrails.slice(0, visibleCount);
    }, [filteredTrails, visibleCount]);

    return (
        <>
            <TrilhasFeedbackCard className="block lg:hidden mt-6" />

            <div className="dark:text-white text-gray-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

                    {/* Header */}
                    <div className="mb-16 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-black tracking-tighter uppercase font-mono italic text-[#00A3FF]">
                                    Trilhas de Aprendizado
                                </h1>
                                <p className="dark:text-gray-400 text-gray-600 font-mono text-sm max-w-xl border-l-2 border-[#00A3FF] pl-4">
                                    [ACOMPANHAMENTO_CURRICULAR] &gt; Explore as disciplinas, requisitos e o progresso do seu curso no USP.
                                </p>
                            </div>

                            {/* Header mobile ja tem v3.1.2 superior */}

                            {userProfile && (
                                <div className="dark:bg-[#1E1E1E] bg-white border border-gray-300 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700 shadow-sm dark:shadow-none">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A3FF] to-[#0070FF]/20 flex items-center justify-center border border-gray-300 dark:border-white/10 shadow-[0_0_15px_rgba(0,163,255,0.3)]">
                                        <User className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono font-black uppercase text-[#00A3FF] tracking-widest flex items-center gap-2">
                                            Estudante_Identificado
                                            {['pesquisador', 'docente_pesquisador'].includes(userProfile.user_category) ? (
                                                <span className="px-1.5 py-0.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 rounded text-[8px] font-black uppercase tracking-widest">PESQUISADOR</span>
                                            ) : ['aluno_usp', 'licenciatura', 'bacharelado', 'pos_graduacao'].includes(userProfile.user_category) ? (
                                                <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/30 rounded text-[8px] font-black uppercase tracking-widest">ESTUDANTE USP</span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-brand-red/10 text-brand-red border border-brand-red/30 rounded text-[8px] font-black uppercase tracking-widest">CURIOSO</span>
                                            )}
                                        </div>
                                        <div className="text-xs font-bold dark:text-gray-200">
                                            {userProfile.course?.toUpperCase() || 'CIENTISTA'} @ {userProfile.institute?.toUpperCase() || 'USP'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Dashboard "Acompanhar Andamento" */}
                        {stats && (
                            <motion.div 
                                layout
                                initial={false}
                                animate={{ height: isDashboardCollapsed ? 160 : 'auto' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="dark:bg-[#121212]/50 bg-gray-100 dark:bg-white/50 backdrop-blur-xl border dark:border-white/5 border-gray-300 rounded-[2.5rem] overflow-hidden"
                            >
                                <div className="p-8 pb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                                                <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-gray-800" />
                                                <motion.circle
                                                    cx="48" cy="48" r="40" fill="transparent" stroke="#00A3FF" strokeWidth="4"
                                                    strokeDasharray={251}
                                                    initial={{ strokeDashoffset: 251 }}
                                                    animate={{ strokeDashoffset: 251 - (251 * stats.percentage / 100) }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                    className="drop-shadow-[0_0_10px_rgba(0,163,255,0.6)]"
                                                />
                                            </svg>
                                            <span className="absolute text-xl font-black font-mono text-gray-900 dark:text-white tracking-widest">{stats.percentage}%</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                                Acompanhar Andamento
                                            </h2>
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                                                {stats.completedMandatoryCount} de {stats.totalMandatory} disciplinas obrigatórias concluídas
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 py-1 px-3 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-300 dark:border-white/5 w-fit">
                                                <Network className="w-3 h-3 text-[#00A3FF]" />
                                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    Progresso para: <span className="text-gray-900 dark:text-white">{userProfile?.course || 'Geral'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEvolutionModalOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#00A3FF]/10 text-[#00A3FF] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00A3FF]/20 transition-all border border-[#00A3FF]/20 cursor-pointer"
                                        >
                                            <RefreshCw size={14} />
                                            Sincronizar Júpiter
                                        </button>
                                        <button
                                            onClick={() => setIsVisualMapOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-all border border-brand-blue/20 cursor-pointer"
                                        >
                                            <Network size={14} />
                                            Ver Árvore do Curso
                                        </button>
                                        <button
                                            onClick={() => setIsDashboardCollapsed(!isDashboardCollapsed)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 rounded-xl transition-all text-gray-400 border border-gray-300 dark:border-white/10 cursor-pointer text-[10px] font-black uppercase tracking-widest"
                                            title={isDashboardCollapsed ? 'Expandir' : 'Encolher'}
                                        >
                                            <Layers size={14} className={`transition-transform duration-300 ${isDashboardCollapsed ? 'rotate-180' : ''}`} />
                                            <span>{isDashboardCollapsed ? 'Expandir' : 'Encolher'}</span>
                                        </button>
                                    </div>
                                </div>

                                {!(stats as any).isInvalid ? (
                                    <div className="px-8 pb-8 space-y-6">
                                        {/* Progress Detail Bar */}
                                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-[#00A3FF] to-[#0070FF]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.percentage}%` }}
                                                transition={{ duration: 1.2 }}
                                            />
                                        </div>

                                        {/* Tabs for Lists */}
                                        <div className="flex gap-4 border-b border-gray-300 dark:border-white/5">
                                            <button
                                                onClick={() => setDashboardTab('faltam')}
                                                className={`pb-4 text-[10px] font-mono font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'faltam' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                A Fazer ({stats.missingMandatory.length})
                                                {dashboardTab === 'faltam' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A3FF]" />}
                                            </button>
                                            <button
                                                onClick={() => setDashboardTab('cursando')}
                                                className={`pb-4 text-[10px] font-mono font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'cursando' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                Cursando ({stats.cursandoMandatory.length})
                                                {dashboardTab === 'cursando' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4B4B]" />}
                                            </button>
                                            <button
                                                onClick={() => setDashboardTab('concluidas')}
                                                className={`pb-4 text-[10px] font-mono font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'concluidas' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                Concluídas ({stats.completedTotal.length})
                                                {dashboardTab === 'concluidas' && <motion.div layoutId="dashTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
                                            </button>


                                        </div>

                                        {/* Scrollable List Container (Strictly Mandatory) */}
                                        <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                            <AnimatePresence mode="wait">
                                                {dashboardTab === 'faltam' ? (
                                                    <motion.div
                                                        key="faltam"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                                    >
                                                        {stats.missingMandatory.length > 0 ? stats.missingMandatory.map(trail => (
                                                            <div key={trail.id} className="flex items-center gap-4 dark:bg-white/5 bg-gray-100 p-4 rounded-2xl border dark:border-white/5 border-gray-300 group">
                                                                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-black/40 flex items-center justify-center font-mono font-black text-xs text-gray-500 border border-gray-300 dark:border-gray-800">
                                                                    {trail.excitation_level}º
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 uppercase tracking-tighter">
                                                                            {trail.course_code}
                                                                        </span>
                                                                        <span
                                                                            className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-tighter"
                                                                            style={{
                                                                                backgroundColor: `${AXIS_CONFIG[trail.axis]?.color}15`,
                                                                                borderColor: `${AXIS_CONFIG[trail.axis]?.color}30`,
                                                                                color: AXIS_CONFIG[trail.axis]?.color
                                                                            }}
                                                                        >
                                                                            {AXIS_CONFIG[trail.axis]?.label.substring(0, 3)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{trail.title}</div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => toggleCompletion(e, trail.id)}
                                                                    disabled={isUpdating === trail.id}
                                                                    className="p-2 rounded-lg bg-[#00A3FF]/10 text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white transition-all disabled:opacity-50"
                                                                >
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-2 py-8 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                                ✨ Toda a matéria obrigatória foi capturada!
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : dashboardTab === 'cursando' ? (
                                                    <motion.div
                                                        key="cursando"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                                    >
                                                        {stats.cursandoMandatory.length > 0 ? stats.cursandoMandatory.map(trail => (
                                                            <div key={trail.id} className="flex items-center gap-4 dark:bg-[#FF4B4B]/5 bg-gray-100 p-4 rounded-2xl border dark:border-[#FF4B4B]/20 border-gray-300 group">
                                                                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-black/40 flex items-center justify-center font-mono font-black text-xs text-[#FF4B4B] border border-red-200 dark:border-[#FF4B4B]/30 animate-pulse">
                                                                    {trail.excitation_level}º
                                                                </div>
                                                                <div className="flex-1 min-w-0 text-left">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-500 uppercase tracking-tighter">
                                                                            {trail.course_code}
                                                                        </span>
                                                                        <span
                                                                            className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-tighter"
                                                                            style={{
                                                                                backgroundColor: `${AXIS_CONFIG[trail.axis]?.color}15`,
                                                                                borderColor: `${AXIS_CONFIG[trail.axis]?.color}30`,
                                                                                color: AXIS_CONFIG[trail.axis]?.color
                                                                            }}
                                                                        >
                                                                            {AXIS_CONFIG[trail.axis]?.label.substring(0, 3)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{trail.title}</div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => toggleCursando(e, trail.id)}
                                                                    disabled={isUpdating === trail.id}
                                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                                    title="Remover do radar"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => toggleCompletion(e, trail.id)}
                                                                    disabled={isUpdating === trail.id}
                                                                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                                                                    title="Marcar como concluída"
                                                                >
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-full py-8 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                                📡 Nenhum radar ativo no momento.
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="concluidas"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                                                    >
                                                        {stats.completedTotal.length > 0 ? stats.completedTotal.map(trail => (
                                                            <div key={trail.id} className="flex items-center gap-3 dark:bg-green-500/5 bg-green-50 p-3 rounded-xl border border-green-500/10">
                                                                <CheckCircle2 className="text-green-500 shrink-0" size={14} />
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[6px] font-mono px-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/5 text-gray-500 uppercase">
                                                                            {trail.course_code}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200 truncate">{trail.title}</div>
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-full py-8 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                                                Nenhuma partícula registrada ainda.
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-8 pb-8">
                                        <div className={`p-6 border rounded-3xl text-center space-y-2 ${isUspUser ? 'dark:bg-brand-yellow/5 bg-brand-yellow/10 border-brand-yellow/20' : 'dark:bg-[#00A3FF]/5 bg-[#00A3FF]/10 border-[#00A3FF]/20'}`}>
                                            {isUspUser ? (
                                                <>
                                                    <AlertTriangle className="mx-auto text-brand-yellow" size={24} />
                                                    <p className="text-[10px] font-mono font-black uppercase text-brand-yellow tracking-[0.2em]">Fluxo Incompleto detectado</p>
                                                    <p className="text-xs text-gray-400 font-medium">Configure seu <span className="text-white">Curso</span> e <span className="text-white">Instituto (USP)</span> nas configurações de perfil para habilitar o rastreamento dinâmico de disciplinas obrigatórias.</p>
                                                    <Link href="/lab" className="inline-block mt-4 px-6 py-2 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-brand-yellow/30">
                                                        Configurar Perfil
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="mx-auto text-[#00A3FF]" size={24} />
                                                    <p className="text-[10px] font-mono font-black uppercase text-[#00A3FF] tracking-[0.2em]">Modo Visitante Ativo</p>
                                                    <p className="text-xs text-gray-400 font-medium">O rastreamento de disciplinas obrigatórias é exclusivo para alunos USP.</p>
                                                    <p className="text-[11px] text-gray-500 font-medium mt-1">Sinta-se livre para explorar todas as trilhas e materiais disponíveis na base Síncrotron abaixo.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Control Panel */}
                        <div className="space-y-6 dark:bg-[#1A1A1A]/70 bg-white/70 backdrop-blur-xl p-6 rounded-2xl dark:border-gray-800/60 border-gray-300 border shadow-2xl dark:shadow-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Layers size={120} />
                            </div>

                            {/* Row 1: Axis (Curso) — BOTÕES COLORIDOS */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Frequência_Curso</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setAxisFilter(null)}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border ${!axisFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        TODOS_OS_CURSOS
                                    </button>
                                    {Object.entries(AXIS_CONFIG).map(([key, cfg]) => (
                                        <button
                                            key={key}
                                            onClick={() => setAxisFilter(key)}
                                            className="px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2"
                                            style={axisFilter === key
                                                ? { backgroundColor: cfg.color, color: key === 'comum' || key === 'lic' ? '#121212' : '#FFFFFF', borderColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}60` }
                                                : { backgroundColor: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}40` }
                                            }
                                        >
                                            <cfg.icon size={12} />
                                            {cfg.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Row 2: Category — cores seguem eixo */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Amplitude_Tipo</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setCategoryFilter(null)}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border ${!categoryFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        TODAS_AS_CATEGORIAS
                                    </button>
                                    {Object.entries(CATEGORY_CONFIG).map(([key, catCfg]) => {
                                        const catColor = axisFilter ? AXIS_CONFIG[axisFilter]?.color || '#00A3FF' : '#00A3FF';
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setCategoryFilter(key)}
                                                className="px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2"
                                                style={categoryFilter === key
                                                    ? { backgroundColor: `${catColor}40`, color: catColor, borderColor: catColor, boxShadow: `0 0 15px ${catColor}30` }
                                                    : { backgroundColor: `${catColor}08`, color: `${catColor}90`, borderColor: `${catColor}20` }
                                                }
                                            >
                                                <catCfg.icon size={12} />
                                                {catCfg.label.toUpperCase()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Row 3: Semester */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Fase_Semestre</label>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        onClick={() => setSemesterFilter(null)}
                                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all border ${!semesterFilter
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        TODOS
                                    </button>
                                    {availableSemesters.map((sem) => {
                                        const semColor = axisFilter ? AXIS_CONFIG[axisFilter]?.color || '#00A3FF' : '#00A3FF';
                                        return (
                                            <button
                                                key={sem}
                                                onClick={() => setSemesterFilter(sem)}
                                                className="w-10 h-8 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center justify-center"
                                                style={semesterFilter === sem
                                                    ? { backgroundColor: `${semColor}50`, borderColor: semColor, color: semColor, boxShadow: `0 0 10px ${semColor}30` }
                                                    : { backgroundColor: `${semColor}08`, color: `${semColor}70`, borderColor: `${semColor}20` }
                                                }
                                            >
                                                {sem}º
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Row 4: Sort Order */}
                            <div className="space-y-3 relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1">Ordenação_Vetor</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSortOrder('sem-asc')}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2 ${sortOrder === 'sem-asc'
                                            ? 'bg-[#00A3FF] text-white border-transparent shadow-lg shadow-[#00A3FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        <Timer size={12} />
                                        PRIMEIROS_SEMESTRES
                                    </button>
                                    <button
                                        onClick={() => setSortOrder('sem-desc')}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2 ${sortOrder === 'sem-desc'
                                            ? 'bg-[#0070FF] text-white border-transparent shadow-lg shadow-[#0070FF]/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        <GraduationCap size={12} />
                                        ÚLTIMOS_SEMESTRES
                                    </button>
                                    <button
                                        onClick={() => setSortOrder('trending')}
                                        className={`px-4 py-2 rounded-lg font-mono text-[10px] font-bold transition-all border flex items-center gap-2 ${sortOrder === 'trending'
                                            ? 'bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/20'
                                            : 'dark:bg-[#121212] bg-gray-50 dark:text-gray-500 text-gray-500 dark:border-gray-800 border-gray-300 hover:border-gray-300'
                                            }`}
                                    >
                                        <Zap size={12} />
                                        TENDÊNCIAS
                                    </button>
                                </div>
                            </div>

                            {/* Row 5: Search */}
                            <div className="relative z-10">
                                <label className="font-mono text-[10px] dark:text-gray-500 text-gray-400 uppercase tracking-[0.3em] block ml-1 mb-3">Buscar_Disciplina</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Nome da disciplina ou código (ex: MAT0112)..."
                                        className="w-full pl-11 pr-4 py-3 rounded-xl font-mono text-sm dark:bg-[#121212] bg-gray-50 dark:text-white text-gray-900 dark:border-gray-800 border-gray-300 border outline-none focus:border-[#00A3FF]/50 focus:shadow-[0_0_15px_rgba(0,163,255,0.15)] transition-all placeholder:text-gray-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors text-xs font-mono"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="mb-8 overflow-hidden">
                        {/* Grid de Trilhas original */}
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                                <AnimatePresence mode='popLayout'>
                                    {slicedTrails.map((trail) => {
                                        const activeAxisKey = axisFilter && axisFilter !== 'comum' ? axisFilter : trail.axis;
                                        const axisCfg = AXIS_CONFIG[activeAxisKey] || AXIS_CONFIG.comum;
                                        const catCfg = CATEGORY_CONFIG[trail.effectiveCategory || trail.category] || CATEGORY_CONFIG.eletiva;
                                        const isBasicCycleFlag = (trail.excitation_level || 0) <= 4;
                                        const Icon = axisCfg.icon;
                                        const hasEquiv = !!trail.equivalence_group;
                                        const hasPrereqs = trail.prerequisites && trail.prerequisites.length > 0;

                                        return (
                                            <motion.div
                                                layout
                                                key={trail.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Link href={`/trilhas/${trail.id}`} className="group block h-full">
                                                    <div
                                                        className="relative rounded-xl p-6 border transition-all h-full flex flex-col dark:bg-[#1E1E1E] bg-white border-gray-300 dark:border-white/10 shadow-md dark:shadow-none hover:border-gray-400 dark:hover:border-white/20 group-hover:bg-gray-50/50 dark:group-hover:bg-[#252525] group-hover:shadow-2xl hover:scale-[1.02]"
                                                        style={{
                                                            borderColor: (axisFilter === trail.axis || !axisFilter) && trail.axis !== 'comum' ? `${axisCfg.color}60` : undefined,
                                                        }}
                                                    >
                                                        {/* Glow Border Effect on Hover */}
                                                        <div
                                                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                                            style={{
                                                                boxShadow: `inset 0 0 25px ${axisCfg.color}15`,
                                                                border: `1px solid ${axisCfg.color}40`
                                                            }}
                                                        ></div>

                                                        {/* Category Badge Row */}
                                                        <div className="flex justify-between items-start mb-4" style={{ minHeight: '24px' }}>
                                                            <div
                                                                className="px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1.5 uppercase border"
                                                                style={{
                                                                    backgroundColor: `${axisCfg.color}10`,
                                                                    borderColor: `${axisCfg.color}30`,
                                                                    color: axisCfg.color
                                                                }}
                                                            >
                                                                <catCfg.icon size={10} />
                                                                {catCfg.label}
                                                            </div>

                                                            {isBasicCycleFlag && (
                                                                <div
                                                                    className="px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1 uppercase border bg-gray-100 dark:bg-white/5 dark:text-gray-400 text-gray-500 dark:border-white/10 border-gray-300"
                                                                >
                                                                    <Zap size={8} fill="currentColor" />
                                                                    CICLO_BÁSICO
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* STATUS BUTTONS ROW */}
                                                        <div className="flex items-center gap-2 mb-6">
                                                            {effectiveCompletedIds.includes(trail.id) ? (
                                                                <button
                                                                    onClick={(e) => toggleCompletion(e, trail.id)}
                                                                    className="px-2 py-1.5 rounded-lg border bg-green-500/20 border-green-500/50 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all flex items-center gap-1.5 group/check"
                                                                    disabled={isUpdating === trail.id}
                                                                >
                                                                    {isUpdating === trail.id ? (
                                                                        <Loader2 size={10} className="animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 size={10} />
                                                                    ) }
                                                                    <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                        CONCLUÍDA
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => toggleCompletion(e, trail.id)}
                                                                        className="px-2 py-1.5 rounded-lg border dark:bg-white/5 bg-gray-100 dark:border-gray-800 border-gray-300 text-gray-500 hover:border-green-500/50 hover:text-green-500 transition-all flex items-center gap-1.5 group/check"
                                                                        disabled={isUpdating === trail.id}
                                                                    >
                                                                        {isUpdating === trail.id ? (
                                                                            <Loader2 size={10} className="animate-spin" />
                                                                        ) : (
                                                                            <Circle size={10} />
                                                                        )}
                                                                        <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                            PENDENTE
                                                                        </span>
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => toggleCursando(e, trail.id)}
                                                                        disabled={isUpdating === trail.id}
                                                                        className={`px-2 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 group/radar ${cursandoIds.includes(trail.id)
                                                                            ? 'bg-[#FF4B4B]/20 border-[#FF4B4B]/50 text-[#FF4B4B] shadow-[0_0_10px_rgba(255,75,75,0.2)]'
                                                                            : 'dark:bg-white/5 bg-gray-100 dark:border-gray-800 border-gray-300 text-gray-500 hover:border-[#FF4B4B]/50 hover:text-[#FF4B4B]'
                                                                            }`}
                                                                    >
                                                                        <Clock
                                                                            size={10}
                                                                            className={cursandoIds.includes(trail.id) ? "animate-pulse" : ""}
                                                                        />
                                                                        <span className="font-mono text-[8px] font-black uppercase tracking-widest">
                                                                            CURSANDO
                                                                        </span>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>

                                                {/* Course Info Row */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-2.5 rounded-lg dark:bg-[#121212] bg-gray-100 dark:border-gray-800 border-gray-300 border" style={{ borderColor: `${axisCfg.color}40` }}>
                                                        <Icon size={20} style={{ color: axisCfg.color }} />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="font-mono text-[10px] tracking-widest uppercase dark:text-gray-500 dark:text-white/40 text-gray-400 flex items-center gap-2">
                                                            {trail.course_code || 'HUB IME-CORE'}
                                                            {hasPrereqs && (
                                                                <div className="group/prereq relative flex items-center">
                                                                    <AlertTriangle size={12} style={{ color: `${axisCfg.color}90` }} />
                                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 dark:bg-[#1A1A1A] bg-white dark:border-gray-700 border-gray-300 border rounded-lg text-[9px] font-mono dark:text-gray-300 text-gray-600 opacity-0 group-hover/prereq:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                                                                        ⚠ Esta disciplina possui <strong className="dark:text-white text-gray-900">pré-requisitos</strong>.
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {hasEquiv && (
                                                                <div className="group/equiv relative flex items-center">
                                                                    <Link2 size={12} style={{ color: `${axisCfg.color}90` }} />
                                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 dark:bg-[#1A1A1A] bg-white dark:border-gray-700 border-gray-300 border rounded-lg text-[9px] font-mono dark:text-gray-300 text-gray-600 opacity-0 group-hover/equiv:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl">
                                                                        🔗 Esta disciplina possui <strong className="dark:text-white text-gray-900">equivalentes</strong>.
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="font-mono text-[9px] uppercase font-bold" style={{ color: axisCfg.color }}>
                                                            {axisCfg.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Title — hover usa cor do eixo */}
                                                <div className="space-y-2 flex-1" style={{ minHeight: '48px' }}>
                                                    <h2
                                                        className="text-xl font-bold font-display uppercase tracking-tight dark:text-white text-gray-900 leading-6 transition-colors"
                                                        style={{ '--hover-color': axisCfg.color } as React.CSSProperties}
                                                    >
                                                        <span className="group-hover:text-[var(--hover-color)] transition-colors">
                                                            {trail.title}
                                                        </span>
                                                    </h2>
                                                    {hasPrereqs && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {trail.prerequisites?.map(prereq => (
                                                                <span key={prereq} className="text-[9px] font-mono font-bold text-red-500 bg-red-500/10 px-1 rounded uppercase tracking-tighter">
                                                                    Exige: {resolvePrereqName(prereq)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {trail.description && (
                                                        <p className="text-[11px] dark:text-gray-500 text-gray-400 font-mono leading-relaxed line-clamp-2">
                                                            {trail.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Energy Bars */}
                                                <div className="mt-8 space-y-2 pt-4 dark:border-gray-800/50 border-gray-300 border-t" style={{ minHeight: '60px' }}>
                                                    <div className="flex items-center justify-between text-[9px] font-mono dark:text-gray-500 text-gray-400 uppercase" style={{ height: '16px' }}>
                                                        <span>Energia_Créditos</span>
                                                        <span>{trail.credits_aula + trail.credits_trabalho}U</span>
                                                    </div>
                                                    <div className="flex gap-1" style={{ height: '4px' }}>
                                                        {Array.from({ length: 8 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-sm ${i < (trail.credits_aula + trail.credits_trabalho) ? '' : 'dark:bg-gray-800 bg-gray-200 opacity-30'}`}
                                                                style={{ backgroundColor: i < (trail.credits_aula + trail.credits_trabalho) ? axisCfg.color : undefined }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-mono dark:text-gray-400 text-gray-500">
                                                        <Timer size={12} />
                                                        SEM_{trail.excitation_level || '?'}
                                                    </div>
                                                    <div className="text-[10px] font-mono dark:text-gray-600 text-gray-400">
                                                        {trail.submissionCount} MATERIAIS
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredTrails.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center border border-dashed dark:border-gray-800 border-gray-300 rounded-2xl"
                            >
                                <p className="font-mono dark:text-gray-500 text-gray-400 italic uppercase text-xs tracking-widest">[ERRO_NA_BUSCA] Nenhuma partícula detectada nesta combinação de filtros.</p>
                                <button
                                    onClick={() => { setAxisFilter(null); setCategoryFilter(null); setSemesterFilter(null); }}
                                    className="mt-4 font-mono text-[10px] text-[#00A3FF] underline underline-offset-4"
                                >
                                    RECALIBRAR_SENSORES
                                </button>
                            </motion.div>
                        )}
                        </motion.div>
                    </div>

                    {/* Pagination - Load More */}
                    {filteredTrails.length > visibleCount && (
                        <div className="mt-16 flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 9)}
                                className="group relative px-8 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200/50 dark:bg-white/10 dark:bg-white/5 dark:hover:bg-gray-200/50 dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-2xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 via-brand-red/10 to-brand-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] dark:text-gray-400 text-gray-500 relative z-10">Expandir_Matriz</span>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="text-sm font-bold dark:text-white text-gray-900">CARREGAR MAIS PARTICULAS</span>
                                    <LayoutGrid size={16} className="text-[#00A3FF] group-hover:rotate-90 transition-transform duration-500" />
                                </div>
                                <div className="flex gap-1 mt-1 relative z-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue/40 animate-pulse"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red/40 animate-pulse [animation-delay:200ms]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow/40 animate-pulse [animation-delay:400ms]"></div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Sync Overlay */}
            {/* Sincronizador Atômico (Canto Superior Direito) */}
            <AnimatePresence>
                {isSyncing && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className="fixed top-24 right-6 z-[200] bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,163,255,0.15)]"
                    >
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border border-blue-500/30 rounded-full"
                            />
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#00A3FF]"
                                />
                                <Atom className="absolute -top-3 -left-3 w-8 h-8 text-white/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col pr-2">
                            <h2 className="text-[10px] font-black font-mono text-white uppercase tracking-[0.2em]">
                                Sinc_Atômico
                            </h2>
                            <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                                Sincronizando_Grade_USP...
                            </p>
                        </div>

                        {/* Barra de Carregamento (4s) */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5 rounded-b-2xl overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4, ease: "linear" }}
                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visual Map Modal Card */}
            <AnimatePresence>
                {isVisualMapOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-[#121212] w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-gray-300 dark:border-white/10 flex flex-col max-h-[95vh]"
                        >
                            {/* Header Modal */}
                            <div className="p-6 sm:p-8 border-b border-gray-300 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-[20px] bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30 shadow-lg shadow-brand-blue/10">
                                        <Network className="text-brand-blue w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
                                            Árvore do Curso
                                        </h3>
                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Exibindo: <span className="text-brand-blue font-bold">{selectedCourseMap.name}</span></p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-row items-center gap-3 sm:gap-4 ml-auto lg:ml-0">
                                    <div className="relative group">
                                        <select 
                                            className="appearance-none bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 pr-10 sm:pr-12 outline-none focus:border-brand-blue/50 transition-all cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10"
                                            value={selectedCourseMap.id}
                                            onChange={(e) => {
                                                const map = COURSE_MAPS.find(m => m.id === e.target.value);
                                                if (map) setSelectedCourseMap(map);
                                            }}
                                        >
                                            {COURSE_MAPS.map(map => (
                                                <option key={map.id} value={map.id} className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white">{map.name.split(' ')[0]}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    <a 
                                        href={selectedCourseMap.pdf} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-blue text-white rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-blue/20 cursor-pointer"
                                        title="Baixar Manual PDF"
                                    >
                                        <Download className="w-3.5 sm:w-4 sm:h-4" />
                                        <span>Manual</span>
                                    </a>
                                </div>
                            </div>

                            {/* Modal Image Content */}
                            <div className="flex-1 overflow-y-auto hidden-scrollbar p-8 bg-gray-50/50 dark:bg-black/40">
                                <div className="relative group mx-auto max-w-5xl">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/30 via-transparent to-brand-red/30 opacity-20 -z-10 blur-[100px] rounded-full" />
                                    <div className="rounded-[40px] overflow-hidden border border-gray-300 dark:border-white/5 shadow-2xl bg-white dark:bg-[#1e1e1e]/50 relative">
                                        <div className="absolute top-8 left-8 z-10">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-full backdrop-blur-md">
                                                <Sparkles className="text-brand-yellow w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black text-brand-yellow uppercase tracking-[0.2em]">Arte Curatorial USP</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            <img 
                                                src={selectedCourseMap.image} 
                                                alt={selectedCourseMap.name}
                                                className="w-full h-auto object-contain rounded-[32px] hover:scale-[1.02] transition-transform duration-1000"
                                            />
                                        </div>

                                        {/* Overlay Info */}
                                        <div className="p-8 bg-gradient-to-t from-white dark:from-black/80 to-transparent">
                                            <div className="flex items-end justify-between gap-6">
                                                <div className="space-y-1">
                                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedCourseMap.name}</h4>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest opacity-80">Representação fractal das dependências curriculares v4.0</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Footer Modal */}
                            <div className="p-6 border-t border-gray-300 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] flex justify-center">
                                <button 
                                    onClick={() => setIsVisualMapOpen(false)}
                                    className="px-10 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-gray-200/50 dark:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                >
                                    Fechar Visualização
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <JupiterEvolutionModal
                isOpen={isEvolutionModalOpen}
                onClose={() => setIsEvolutionModalOpen(false)}
                onSuccess={() => {
                    setTimeout(() => {
                        router.refresh();
                    }, 500);
                }}
            />
        </>
    );
}

