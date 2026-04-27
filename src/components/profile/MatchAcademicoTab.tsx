'use client';

import { useState, useEffect } from 'react';
import { 
    fetchFreshmenForAdoption, 
    fetchMyAdoptedFreshmen, 
    fetchStudentsSeekingIC, 
    fetchResearchersSeekingAssistants, 
    getStudentMiniPortfolio,
    approveStudentAsAssistant,
    fetchMyResearchAssistants,
    fetchMyResearchAdoptionStatus,
    requestAdoption
} from '@/app/actions/profiles';
import { fetchClassmates } from '@/app/actions/match';
import * as CalendarActions from '@/app/actions/calendar';
import { Avatar } from '@/components/ui/Avatar';
import { 
    GraduationCap, 
    ArrowRight, 
    CheckCircle2, 
    Loader2, 
    Phone, 
    Mail, 
    Star, 
    Microscope, 
    ShieldCheck, 
    Zap,
    Briefcase,
    Sparkles,
    UserPlus,
    Info,
    ExternalLink,
    X,
    BookOpen,
    FlaskConical,
    Github,
    Globe,
    FileText,
    Clock,
    HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Profile } from '@/types';
import { ICInterestModal } from './ICInterestModal';
import { useTelemetry } from '@/hooks/useTelemetry';
import ScientificContent from '@/components/ScientificContent';

interface MatchAcademicoTabProps {
    profile: Profile;
}

export function MatchAcademicoTab({ profile }: MatchAcademicoTabProps) {
    const [availableFreshmen, setAvailableFreshmen] = useState<any[]>([]);
    const [icPeople, setIcPeople] = useState<any[]>([]);
    const [myAdoptions, setMyAdoptions] = useState<any[]>([]);
    const [myAdoption, setMyAdoption] = useState<any>(null);
    const [isLoadingFreshmen, setIsLoadingFreshmen] = useState(false);
    const [isLoadingIC, setIsLoadingIC] = useState(false);
    const [isLoadingClassmates, setIsLoadingClassmates] = useState(false);
    const [adoptionSubTab, setAdoptionSubTab] = useState<'available' | 'mine'>('available');
    
    const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [classmates, setClassmates] = useState<any[]>([]);
    const { trackEvent } = useTelemetry();
    const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
    const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
    const [isICModalOpen, setIsICModalOpen] = useState(false);
    const [icSubTab, setIcSubTab] = useState<'students' | 'helpers'>('students');
    const [isApproving, setIsApproving] = useState(false);
    const [isAdopting, setIsAdopting] = useState(false);

    const isStudent = ['aluno_usp', 'licenciatura', 'bacharelado', 'pos_graduacao'].includes(profile.user_category);
    const isResearcher = ['pesquisador', 'docente_pesquisador'].includes(profile.user_category);
    const isMentor = profile.available_to_mentor;

    const loadFreshmen = async () => {
        if (!isStudent && !isMentor) return;
        setIsLoadingFreshmen(true);
        try {
            const res = await fetchFreshmenForAdoption();
            if (res?.success && res.data) setAvailableFreshmen(res.data);
            
            const resMine = await fetchMyAdoptedFreshmen();
            if (resMine.success && resMine.data) setMyAdoptions(resMine.data);
        } catch (e) { console.error(e); }
        finally { setIsLoadingFreshmen(false); }
    };

    const loadIC = async () => {
        setIsLoadingIC(true);
        try {
            let res;
            if (isResearcher) {
                if (icSubTab === 'students') {
                    res = await fetchStudentsSeekingIC();
                } else {
                    res = await fetchMyResearchAssistants();
                }
            } else {
                res = await fetchResearchersSeekingAssistants();
                
                // Fetch student's own adoption status
                const adoptionRes = await fetchMyResearchAdoptionStatus();
                if (adoptionRes.success && adoptionRes.data) {
                    setMyAdoption(adoptionRes.data);
                }
            }
            if (res?.success && res.data) setIcPeople(res.data);
            else if (res?.error) toast.error(res.error);
        } catch (e) { console.error(e); }
        finally { setIsLoadingIC(false); }
    };

    const loadClassmatesInfo = async () => {
        setIsLoadingClassmates(true);
        try {
            const calRes = await CalendarActions.getCalendarEvents();
            if (calRes.success && calRes.data) {
                const subjects = new Map();
                calRes.data.forEach((e: any) => {
                    const code = e.extendedProps?.sourceId;
                    if (code && !subjects.has(code)) {
                        subjects.set(code, { code, title: e.title.split(' - ')[0] });
                    }
                });
                const subjectList = Array.from(subjects.values());
                setEnrolledSubjects(subjectList);
                if (subjectList.length > 0 && !selectedSubject) {
                    setSelectedSubject(subjectList[0].code);
                }
            }
        } catch (e) { console.error(e); }
        finally { setIsLoadingClassmates(false); }
    };

    const loadData = async () => {
        await Promise.all([loadFreshmen(), loadIC(), loadClassmatesInfo()]);
    };

    const handleViewPortfolio = async (id: string) => {
        setIsPortfolioLoading(true);
        const res = await getStudentMiniPortfolio(id);
        if (res.success && res.data) {
            setSelectedPerson(res.data);
        } else {
            toast.error(res.error || 'Erro ao carregar portfólio');
        }
        setIsPortfolioLoading(false);
    };

    useEffect(() => {
        loadData();
        trackEvent('TAB_CHANGE', { tab: 'Match Acadêmico' });
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            const fetchClassmatesList = async () => {
                setIsLoadingClassmates(true);
                const res = await fetchClassmates(selectedSubject);
                if (res.success && res.data) {
                    setClassmates(res.data);
                }
                setIsLoadingClassmates(false);
            };
            fetchClassmatesList();
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (isResearcher) {
            loadIC();
        }
    }, [icSubTab]);

    const handleApproveAssistant = async (studentId: string) => {
        setIsApproving(true);
        try {
            const res = await approveStudentAsAssistant(studentId);
            if (res.success) {
                toast.success('Aluno aprovado como seu ajudante!');
                setSelectedPerson(null);
                loadIC();
            } else {
                toast.error(res.error || 'Erro ao aprovar ajudante');
            }
        } catch (e) {
            toast.error('Ocorreu um erro inesperado');
        } finally {
            setIsApproving(false);
        }
    };

    const handleRequestAdoption = async (freshmanId: string) => {
        setIsAdopting(true);
        try {
            const res = await requestAdoption(freshmanId);
            if (res.success) {
                toast.success('Solicitação de adoção enviada!');
                setSelectedPerson(null);
                loadFreshmen();
            } else {
                toast.error(res.error || 'Erro ao solicitar adoção');
            }
        } catch (e) {
            toast.error('Ocorreu um erro inesperado');
        } finally {
            setIsAdopting(false);
        }
    };

    if (!isStudent && !isResearcher && !isMentor) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 mb-6 rounded-full border-2 border-brand-blue/20 flex items-center justify-center bg-brand-blue/5">
                    <UserPlus className="w-12 h-12 text-brand-blue/40" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Match Acadêmico</h2>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium italic">
                    O Match Acadêmico conecta alunos interessados em IC, pesquisadores buscando ajudantes e bixos buscando mentores.
                    Ative suas preferências no perfil para começar!
                </p>
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl max-w-md mx-auto flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                    <p className="text-[11px] text-left font-bold text-brand-yellow uppercase tracking-tight leading-normal">
                        Dica: Se você é Aluno USP, use o botão "Sinalizar Interesse" para entrar no radar de IC. Se é Pesquisador, ative "Buscando Ajudantes" no seu perfil.
                    </p>
                </div>
            </div>
        );
    }

    // Helper component for person cards
    const PersonCard = ({ person, type }: { person: any, type: 'adoption' | 'ic' | 'classmate' }) => {
        const [showAdoptionTooltip, setShowAdoptionTooltip] = useState(false);
        const isMineAdoption = adoptionSubTab === 'mine' && type === 'adoption';
        const isMyHelper = isResearcher && icSubTab === 'helpers' && type === 'ic';
        const isPending = person.adoptionStatus === 'pending';
        const p = person.profile || person; 
        
        // New logic for adoption status
        const isAdopted = type === 'adoption' && person.adoptionStatus === 'approved';
        const isPendingAdoption = type === 'adoption' && person.adoptionStatus === 'pending';

        return (
            <div
                onClick={() => handleViewPortfolio(p.id)}
                className="group relative h-full flex flex-col cursor-pointer"
            >
                {/* Floating Badges & Tooltips (NOT FADED) */}
                {isPendingAdoption && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-gray-900 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-20 whitespace-nowrap flex items-center gap-2 border border-white/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Aguardando Validação</span>
                        <div className="relative inline-flex items-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAdoptionTooltip(!showAdoptionTooltip);
                                }}
                                className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                            >
                                <HelpCircle className="w-4 h-4 cursor-help text-gray-900/60 hover:text-gray-900 transition-colors" />
                            </button>
                            {showAdoptionTooltip && (
                                <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute left-full top-0 ml-4 w-72 p-6 bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 rounded-[32px] text-[11px] font-semibold leading-relaxed shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-gray-100 dark:border-white/10 z-[100] normal-case backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-200"
                                >
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-3 rounded-2xl bg-brand-yellow/20">
                                            <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-[11px] mb-1">Padrão de Segurança</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">Moderação LAB-DIV</p>
                                        </div>
                                    </div>
                                    <p className="mb-4 whitespace-normal text-gray-700 dark:text-gray-300 text-left">
                                        A moderação irá contactar o bixo e o veterano para ver se de fato houve um acolhimento. Se sim, a adoção é aprovada.
                                    </p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowAdoptionTooltip(false); }}
                                        className="w-full py-4 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-xl shadow-brand-blue/20"
                                    >
                                        Entendi
                                    </button>
                                    <div className="absolute left-0 top-6 -translate-x-1/2 border-8 border-transparent border-r-white dark:border-r-[#1E1E1E]" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {(isMyHelper && isPending) && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-gray-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-20 whitespace-nowrap flex items-center gap-1 border border-white/20">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Aguardando ADM
                    </div>
                )}

                {/* VISUAL CARD (MAY HAVE REDUCED OPACITY) */}
                <div 
                    className={`p-6 rounded-[32px] border transition-all h-full flex flex-col
                        ${isAdopted 
                            ? 'bg-brand-blue/10 border-brand-blue/40 shadow-lg shadow-brand-blue/10' 
                            : isPendingAdoption
                                ? 'bg-white/40 dark:bg-white/5 border-gray-300 dark:border-white/5 opacity-55 grayscale-[0.3] cursor-help shadow-sm'
                                : (isMyHelper && isPending)
                                    ? 'bg-white/40 dark:bg-white/5 border-gray-300 dark:border-white/5 opacity-55 grayscale-[0.1] shadow-sm'
                                    : 'bg-white dark:bg-[#1E1E1E] border-gray-300 dark:border-white/5 shadow-md dark:shadow-none hover:border-brand-blue/40 hover:shadow-2xl hover:shadow-brand-blue/15 hover:scale-[1.02]'
                        }
                    `}
                >
                
                    <div className={`flex items-center gap-4 mb-6 ${(isMyHelper && isPending) ? 'pointer-events-auto' : ''}`}>
                    <Avatar
                        src={p.avatar_url}
                        name={p.use_nickname ? p.username : p.full_name}
                        size="md"
                        xp={p.xp}
                        level={p.level}
                        isLabDiv={p.is_labdiv}
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-display font-medium text-gray-900 dark:text-white truncate">
                            {p.use_nickname ? p.username : p.full_name}
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {isPendingAdoption && (
                        <span className="px-3 py-1 bg-brand-yellow/20 text-brand-yellow rounded-full text-[10px] font-black uppercase tracking-tighter border border-brand-yellow/30 animate-pulse">
                            Aguardando Validação
                        </span>
                    )}
                    {isAdopted && (
                        <span className="px-3 py-1 bg-brand-blue/20 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-tighter border border-brand-blue/30">
                            Seu Bixo Adotado
                        </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {person.course}
                    </span>
                </div>

                {p.bio && (
                    <p className="text-[13px] text-gray-600 dark:text-gray-400 italic mb-6 line-clamp-3 leading-relaxed">
                        "{p.bio}"
                    </p>
                )}

                {(p.ic_research_area || p.ic_preferred_department || p.ic_preferred_lab || p.interest_area) && (
                    <div className="mb-6 p-4 rounded-2xl bg-brand-red/5 border border-brand-red/10 space-y-1 text-left">
                        <span className="text-[10px] font-black text-brand-red/80 uppercase tracking-widest block mb-1">Interesses IC:</span>
                        {(p.ic_research_area || p.interest_area) && (
                            <div className="flex items-baseline gap-1.5 overflow-hidden">
                                <span className="text-[8px] font-black text-gray-400 uppercase">ÁREA:</span>
                                <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase truncate">{p.ic_research_area || p.interest_area}</span>
                            </div>
                        )}
                        {p.ic_preferred_department && (
                            <div className="flex items-baseline gap-1.5 overflow-hidden">
                                <span className="text-[8px] font-black text-gray-400 uppercase">DEPTO:</span>
                                <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase truncate">{p.ic_preferred_department}</span>
                            </div>
                        )}
                        {p.ic_preferred_lab && (
                            <div className="flex items-baseline gap-1.5 overflow-hidden">
                                <span className="text-[8px] font-black text-gray-400 uppercase">LAB:</span>
                                <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase truncate">{p.ic_preferred_lab}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50 dark:border-white/5 mt-auto">
                    {p.email && (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(p.email);
                                toast.success('E-mail copiado!');
                                window.location.href = `mailto:${p.email}`;
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/90 transition-all shadow-sm"
                        >
                            <Mail className="w-4 h-4" /> E-mail
                        </button>
                    )}
                    <button
                        onClick={() => handleViewPortfolio(p.id)}
                        className="flex items-center justify-center p-2.5 bg-brand-red/10 text-brand-red rounded-2xl hover:bg-brand-red/20 transition-all shadow-sm group/btn"
                        title="Ir para o card"
                    >
                        {isPortfolioLoading && selectedPerson?.profile?.id === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* ═══════════════ SEÇÃO 1: SISTEMA DE ADOÇÃO ═══════════════ */}
            {(isStudent || isMentor) && (
                <section className="space-y-8 p-8 rounded-[40px] dark:bg-white/[0.02] bg-white/50 border border-gray-300 dark:border-white/5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Sistema de Adoção</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Adote um bixo e ajude na integração</p>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-300 dark:border-white/5">
                            <button
                                onClick={() => setAdoptionSubTab('available')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adoptionSubTab === 'available'
                                    ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Adote
                            </button>
                            <button
                                onClick={() => setAdoptionSubTab('mine')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adoptionSubTab === 'mine'
                                    ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Meus Bixos
                            </button>
                        </div>
                    </div>

                    {isLoadingFreshmen ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>
                    ) : (adoptionSubTab === 'available' ? availableFreshmen : myAdoptions).length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Nenhum bixo encontrado nesta categoria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(adoptionSubTab === 'available' ? availableFreshmen : myAdoptions).map((person) => (
                                <PersonCard key={person.id} person={person} type="adoption" />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ═══════════════ SEÇÃO 2: MATCH ACADÊMICO ═══════════════ */}
            <section className="space-y-8 p-8 rounded-[40px] dark:bg-white/[0.02] bg-white/50 border border-gray-300 dark:border-white/5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Match Acadêmico</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic leading-relaxed">
                            {isResearcher ? 'Encontre talentos para sua pesquisa' : 'Encontre oportunidades de Iniciação Científica'}
                        </p>
                    </div>

                    {isResearcher && (
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-300 dark:border-white/5">
                            <button
                                onClick={() => setIcSubTab('students')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${icSubTab === 'students'
                                    ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Alunos (IC)
                            </button>
                            <button
                                onClick={() => setIcSubTab('helpers')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${icSubTab === 'helpers'
                                    ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Meus Ajudantes
                            </button>
                        </div>
                    )}
                </div>

                {isStudent && (
                    myAdoption ? (
                        <div className={`glass-card p-8 rounded-[32px] border-2 relative overflow-hidden group ${
                            myAdoption.status === 'approved' ? 'border-brand-blue/40 bg-brand-blue/5 shadow-xl' : 'border-brand-yellow/40 bg-brand-yellow/5 shadow-xl'
                        }`}>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
                                {myAdoption.status === 'approved' ? <Sparkles size={100} className="text-brand-blue" /> : <Loader2 size={100} className="text-brand-yellow animate-spin-slow" />}
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h3 className={`text-2xl font-display font-black uppercase tracking-tight ${
                                        myAdoption.status === 'approved' ? 'text-brand-blue' : 'text-brand-yellow'
                                    }`}>
                                        {myAdoption.status === 'approved' ? 'Pesquisador Encontrado! 🎉' : 'Solicitação Enviada ⏳'}
                                    </h3>
                                    <p className="text-sm text-gray-400 font-bold max-w-2xl">
                                        {myAdoption.status === 'approved' 
                                            ? `Parabéns! Você foi aceito como Iniciação Científica no laboratório ${myAdoption.researcher.laboratory_name || 'Lab Div'} sob orientação de ${myAdoption.researcher.full_name}. Contate seu orientador pelo e-mail: ${myAdoption.researcher.email}`
                                            : `Você enviou um interesse ao pesquisador ${myAdoption.researcher.full_name}. Aguarde a análise ou entre em contato pelo e-mail: ${myAdoption.researcher.email}`
                                        }
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                                    <Avatar src={myAdoption.researcher.avatar_url} name={myAdoption.researcher.full_name} size="md" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Orientador(a)</p>
                                        <p className="text-sm font-bold text-white">{myAdoption.researcher.full_name}</p>
                                    </div>
                                    
                                    <div className="ml-auto flex items-center gap-2">
                                        <a 
                                            href="https://wa.me/5511968401823" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 hover:bg-brand-yellow/20 shadow-lg shadow-brand-yellow/10 hover:scale-[1.05]"
                                        >
                                            Suporte do HUB
                                        </a>
                                        <a href={`mailto:${myAdoption.researcher.email}`} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            myAdoption.status === 'approved' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:scale-[1.05]' : 'bg-brand-yellow text-gray-900 shadow-lg shadow-brand-yellow/20 hover:scale-[1.05]'
                                        }`}>
                                            Entrar em Contato
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card p-8 rounded-[32px] border-2 border-brand-red/30 bg-brand-red/5 relative overflow-hidden group shadow-xl">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                <Microscope size={80} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-2 text-center md:text-left">
                                        <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Sinalizar Interesse: IC</h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Mostre seu potencial para pesquisadores do IFUSP</p>
                                    </div>
                                    <button
                                        onClick={() => setIsICModalOpen(true)}
                                        className="px-8 py-4 bg-brand-red text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-brand-red/20 flex items-center gap-3"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Editar Interesses
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-brand-red/10">
                                    {[
                                        { label: 'Interesse', val: profile.ic_research_area || profile.interest_area || 'NÃO DEFINIDA' },
                                        { label: 'Departamento', val: profile.ic_preferred_department || 'NÃO DEFINIDO' },
                                        { label: 'Laboratório', val: profile.ic_preferred_lab || 'NÃO DEFINIDO' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[8px] font-black text-brand-red/60 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase truncate">{item.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                )}

                {isLoadingIC ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>
                ) : icPeople.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl">
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">
                            {isResearcher && icSubTab === 'helpers' ? 'Você ainda não tem ajudantes aprovados.' : 'Nenhuma oportunidade encontrada no momento.'}
                         </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {icPeople.map((person) => (
                            <PersonCard key={person.id} person={person} type="ic" />
                        ))}
                    </div>
                )}
            </section>

            {/* ═══════════════ SEÇÃO 3: GRUPO DE ESTUDOS ═══════════════ */}
            {isStudent && (
                <section className="space-y-8 p-8 rounded-[40px] dark:bg-white/[0.02] bg-white/50 border border-gray-300 dark:border-white/5 shadow-sm">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Grupo de Estudos</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">Pessoas nas mesmas turmas que você</p>
                    </div>

                    {isLoadingClassmates ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-blue animate-spin" /></div>
                    ) : (
                        <div className="space-y-8">
                            {enrolledSubjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {enrolledSubjects.map(sub => (
                                        <button
                                            key={sub.code}
                                            onClick={() => setSelectedSubject(sub.code)}
                                            className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                selectedSubject === sub.code 
                                                ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                            }`}
                                        >
                                            {sub.code}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Nenhuma matéria do IF/IME na sua grade.</p>
                                    <a href="/ferramentas" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                        <BookOpen className="w-4 h-4" /> Montar Grade
                                    </a>
                                </div>
                            )}

                            {selectedSubject && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classmates.length === 0 ? (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
                                            <UserPlus className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Ninguém mais nesta turma ainda.</p>
                                        </div>
                                    ) : (
                                        classmates.map((person) => (
                                            <PersonCard key={person.id} person={person} type="classmate" />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}

            <AnimatePresence>
                {selectedPerson && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/5 max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={selectedPerson.profile.avatar_url}
                                        name={selectedPerson.profile.use_nickname ? selectedPerson.profile.username : selectedPerson.profile.full_name}
                                        size="lg"
                                    />
                                    <div>
                                        <h2 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {selectedPerson.profile.use_nickname ? selectedPerson.profile.username : selectedPerson.profile.full_name}
                                        </h2>
                                        <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">
                                            {selectedPerson.profile.course} • {selectedPerson.profile.institute}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPerson(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto hidden-scrollbar space-y-8">
                                {/* Bio */}
                                 {selectedPerson.profile.bio && (
                                    <section className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                            <Info className="w-3 h-3" /> Bio / Trajetória
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                            "{selectedPerson.profile.bio}"
                                        </p>
                                    </section>
                                )}

                                {/* Detailed IC Interest (Students) */}
                                {(selectedPerson.profile.ic_research_area || selectedPerson.profile.ic_preferred_department || selectedPerson.profile.ic_preferred_lab || selectedPerson.profile.ic_letter_of_interest) && (
                                    <section className="p-6 rounded-3xl bg-brand-red/5 border border-brand-red/10 space-y-4 overflow-hidden">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red flex items-center gap-2">
                                            <Microscope className="w-3 h-3" /> Interesses: Iniciação Científica
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            {selectedPerson.profile.ic_research_area && (
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[8px] font-black font-mono text-brand-red/60 uppercase tracking-tighter">Interesse</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">{selectedPerson.profile.ic_research_area}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.ic_preferred_department && (
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[8px] font-black font-mono text-brand-red/60 uppercase tracking-tighter">Departamento</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">{selectedPerson.profile.ic_preferred_department}</p>
                                                </div>
                                            )}
                                            {selectedPerson.profile.ic_preferred_lab && (
                                                <div className="flex-1 space-y-1">
                                                    <span className="text-[8px] font-black font-mono text-brand-red/60 uppercase tracking-tighter">Laboratório</span>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">{selectedPerson.profile.ic_preferred_lab}</p>
                                                </div>
                                            )}
                                        </div>
                                        {selectedPerson.profile.ic_letter_of_interest && (
                                            <div className="pt-4 border-t border-brand-red/10 space-y-2 overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black text-brand-red uppercase tracking-widest">Carta de Interesse</span>
                                                    <span className="text-[7px] font-bold text-gray-400 uppercase">{selectedPerson.profile.ic_letter_of_interest.length}/500</span>
                                                </div>
                                                <div className="border-l-2 border-brand-red/20 pl-4 py-1 break-all overflow-hidden w-full">
                                                    <ScientificContent 
                                                        content={selectedPerson.profile.ic_letter_of_interest} 
                                                        className="text-xs text-gray-600 dark:text-gray-300 italic leading-relaxed !max-w-full" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                )}



                                {/* Interests */}
                                {(selectedPerson.profile.areas_of_interest?.length > 0 || selectedPerson.profile.artistic_interests?.length > 0) && (
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                            <Star className="w-3 h-3" /> Interesses e Habilidades
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPerson.profile.areas_of_interest?.map((area: string) => (
                                                <span key={area} className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-[10px] font-black uppercase rounded-full">
                                                    {area}
                                                </span>
                                            ))}
                                            {selectedPerson.profile.artistic_interests?.map((art: string) => (
                                                <span key={art} className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase rounded-full">
                                                    {art}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Professional Links */}
                                {(selectedPerson.profile.lattes_url || selectedPerson.profile.github_url || selectedPerson.profile.portfolio_url) && (
                                    <section className="space-y-4 pt-4 border-t border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-brand-blue" /> Conexões Acadêmicas & Portfólio
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedPerson.profile.lattes_url && (
                                                <a 
                                                    href={selectedPerson.profile.lattes_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 rounded-xl text-[10px] font-bold text-white transition-all hover:scale-105"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-brand-yellow" />
                                                    Lattes
                                                </a>
                                            )}
                                            {selectedPerson.profile.github_url && (
                                                <a 
                                                    href={selectedPerson.profile.github_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 rounded-xl text-[10px] font-bold text-white transition-all hover:scale-105"
                                                >
                                                    <Github className="w-3.5 h-3.5 text-white" />
                                                    GitHub
                                                </a>
                                            )}
                                            {selectedPerson.profile.portfolio_url && (
                                                <a 
                                                    href={selectedPerson.profile.portfolio_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-800 border border-white/5 rounded-xl text-[10px] font-bold text-white transition-all hover:scale-105"
                                                >
                                                    <Globe className="w-3.5 h-3.5 text-brand-blue" />
                                                    Portfolio
                                                </a>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Academic Portfolio */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    {/* Concluídas */}
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3" /> Disciplinas Concluídas
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedPerson.completed.length === 0 ? (
                                                <p className="text-[10px] text-gray-500 italic uppercase">Nenhuma concluída ainda</p>
                                            ) : (
                                                selectedPerson.completed.map((trail: any) => (
                                                    <div key={trail.id} className="p-3 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{trail.title}</p>
                                                            <p className="text-[9px] text-gray-500 font-mono uppercase">{trail.course_code}</p>
                                                        </div>
                                                        <ShieldCheck className="w-3 h-3 text-green-500 shrink-0" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    {/* Em Curso */}
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-2">
                                            <BookOpen className="w-3 h-3" /> Em Curso
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedPerson.current.length === 0 ? (
                                                <p className="text-[10px] text-gray-500 italic uppercase">Nenhuma em curso declarada</p>
                                            ) : (
                                                selectedPerson.current.map((trail: any) => (
                                                    <div key={trail.id} className="p-3 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">{trail.title}</p>
                                                            <p className="text-[9px] text-gray-500 font-mono uppercase">{trail.course_code}</p>
                                                        </div>
                                                        <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse shrink-0" />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-8 border-t border-gray-50 dark:border-white/5 flex flex-col gap-3">
                                {selectedPerson.profile.email && (
                                    <button
                                        onClick={() => {
                                            if (selectedPerson.profile.email) {
                                                navigator.clipboard.writeText(selectedPerson.profile.email);
                                                toast.success('E-mail copiado!');
                                                window.location.href = `mailto:${selectedPerson.profile.email}`;
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-brand-blue text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand-blue/20"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Entrar em Contato (E-mail)
                                    </button>
                                )}

                                {(selectedPerson.profile.id) && (
                                    <>
                                        {/* Botão de Visita ao Laboratório (Vermelho) */}
                                        <a
                                            href={`/lab?user=${selectedPerson.profile.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-red text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all border border-brand-red/10 shadow-xl shadow-brand-red/10"
                                        >
                                            <FlaskConical className="w-5 h-5" />
                                            Visitar Laboratório Pessoal
                                        </a>

                                        {/* Botão de Adoção / Ajudante (Amarelo) */}
                                        {isResearcher && icSubTab === 'students' ? (
                                            <button
                                                onClick={() => handleApproveAssistant(selectedPerson.profile.id)}
                                                disabled={isApproving}
                                                className="w-full flex items-center justify-center gap-3 py-4 bg-brand-yellow text-[#121212] rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/20 disabled:opacity-50"
                                            >
                                                {isApproving ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                )}
                                                Aprovar como Ajudante
                                            </button>
                                        ) : (
                                            /* Visível para Mentores na aba de bixos disponíveis */
                                            !isResearcher && availableFreshmen.some(f => f.id === selectedPerson.profile.id) && (
                                                <button
                                                    onClick={() => handleRequestAdoption(selectedPerson.profile.id)}
                                                    disabled={isAdopting}
                                                    className="w-full flex items-center justify-center gap-3 py-4 bg-brand-yellow text-[#121212] rounded-[24px] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-yellow/20 disabled:opacity-50"
                                                >
                                                    {isAdopting ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-5 h-5" />
                                                    )}
                                                    Adotar Bixo
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ICInterestModal 
                isOpen={isICModalOpen}
                onClose={() => setIsICModalOpen(false)}
                initialData={{
                    ic_research_area: profile.ic_research_area,
                    ic_preferred_department: profile.ic_preferred_department,
                    ic_preferred_lab: profile.ic_preferred_lab,
                    ic_letter_of_interest: profile.ic_letter_of_interest
                }}
            />
        </div>
    );
}
