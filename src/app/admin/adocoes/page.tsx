'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
    fetchAdoptions, 
    updateAdoptionStatus, 
    fetchAllResearchAdoptions, 
    updateResearchAdoptionStatus 
} from '@/app/actions/profiles';
import { toast } from 'react-hot-toast';
import { 
    Loader2, 
    Check, 
    X, 
    Heart, 
    ArrowRight, 
    ExternalLink, 
    Microscope, 
    Sparkles, 
    UserPlus,
    CheckCircle2,
    Atom
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'adocoes' | 'match';

export default function AdminAdoptionsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('adocoes');
    const [adoptions, setAdoptions] = useState<any[]>([]);
    const [researchAdoptions, setResearchAdoptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
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

    const loadAdocoes = async () => {
        const res = await fetchAdoptions();
        if (res.success) {
            setAdoptions(res.data.filter((a: any) => a.status === 'pending'));
        } else {
            toast.error(res.error || 'Erro ao carregar adoções');
        }
    };

    const loadMatch = async () => {
        const res = await fetchAllResearchAdoptions();
        if (res.success) {
            setResearchAdoptions(res.data.filter((a: any) => a.status === 'pending'));
        } else {
            toast.error(res.error || 'Erro ao carregar validações de IC');
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadAdocoes(), loadMatch()]);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdoptionAction = async (id: string, status: 'approved' | 'rejected') => {
        setIsProcessing(id);
        setIsSyncing(true);
        const res = await updateAdoptionStatus(id, status);
        if (res.success) {
            toast.success(status === 'approved' ? 'Adoção aprovada!' : 'Adoção rejeitada.');
            setAdoptions(prev => prev.filter(a => a.id !== id));
        } else {
            toast.error(res.error || 'Erro ao processar ação');
        }
        setIsProcessing(null);
        setIsSyncing(false);
    };

    const handleMatchAction = async (id: string, status: 'approved' | 'rejected') => {
        setIsProcessing(id);
        setIsSyncing(true);
        const res = await updateResearchAdoptionStatus(id, status);
        if (res.success) {
            toast.success(status === 'approved' ? 'Assistente aprovado!' : 'Assistente rejeitado.');
            setResearchAdoptions(prev => prev.filter(a => a.id !== id));
        } else {
            toast.error(res.error || 'Erro ao processar ação');
        }
        setIsProcessing(null);
        setIsSyncing(false);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    const currentCount = activeTab === 'adocoes' ? adoptions.length : researchAdoptions.length;

    return (
        <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-brand-blue" />
                        Validação do Match
                    </h1>
                    <p className="text-gray-400 font-medium italic">Sistema de moderação acadêmica e integração.</p>
                </div>
                
                <div className="flex bg-neutral-900 border border-white/5 p-1.5 rounded-[24px]">
                    <button
                        onClick={() => setActiveTab('adocoes')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'adocoes'
                                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Heart className="w-4 h-4" />
                        Adoções {adoptions.length > 0 && <span className="bg-white/20 px-1.5 rounded-full ml-1">{adoptions.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('match')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'match'
                                ? 'bg-brand-yellow text-[#121212] shadow-lg shadow-brand-yellow/20'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Microscope className="w-4 h-4" />
                        Match IC {researchAdoptions.length > 0 && <span className="bg-black/20 px-1.5 rounded-full ml-1">{researchAdoptions.length}</span>}
                    </button>
                </div>
            </header>

            {currentCount === 0 ? (
                <div className="bg-neutral-900/50 border border-white/5 rounded-[32px] p-20 text-center animate-in fade-in duration-700">
                    <div className="w-24 h-24 mb-6 rounded-full border-2 border-white/10 flex items-center justify-center mx-auto bg-white/5">
                        <Check className="w-12 h-12 text-gray-600" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-2 uppercase">Interface Limpa</h2>
                    <p className="text-gray-500 font-medium italic max-w-xs mx-auto">
                        Não há solicitações de {activeTab === 'adocoes' ? 'adoção' : 'IC'} aguardando validação no momento.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'adocoes' ? (
                        adoptions.map((adoption) => (
                            <div key={adoption.id} className="bg-neutral-900 border border-white/5 rounded-[32px] overflow-hidden hover:border-brand-red/30 transition-all group shadow-2xl">
                                <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 overflow-hidden">
                                    <div className="flex-1 flex items-center gap-4 lg:gap-6 min-w-0 w-full">
                                        <div className="shrink-0">
                                            <Avatar src={adoption.mentor?.avatar_url} name={adoption.mentor?.full_name} size="lg" xp={adoption.mentor?.xp} level={adoption.mentor?.level} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1 truncate">Mentor / Veterano</p>
                                            <h3 className="text-xl font-display font-bold text-white truncate">{adoption.mentor?.full_name}</h3>
                                            <p className="text-xs text-brand-blue font-bold uppercase truncate">{adoption.mentor?.course}</p>
                                        </div>
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center shrink-0">
                                        <ArrowRight className="w-10 h-10 text-brand-red animate-pulse" />
                                    </div>
                                    <div className="flex-1 flex items-center gap-4 lg:gap-6 min-w-0 w-full lg:text-right lg:flex-row-reverse">
                                        <div className="shrink-0">
                                            <Avatar src={adoption.freshman?.avatar_url} name={adoption.freshman?.full_name} size="lg" xp={adoption.freshman?.xp} level={adoption.freshman?.level} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-1 truncate">Bixo / Adotado</p>
                                            <h3 className="text-xl font-display font-bold text-white truncate">{adoption.freshman?.full_name}</h3>
                                            <p className="text-xs text-brand-yellow font-bold uppercase truncate">{adoption.freshman?.entrance_year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 lg:gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto shrink-0 justify-center">
                                        <button onClick={() => handleAdoptionAction(adoption.id, 'rejected')} disabled={isProcessing === adoption.id} className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-brand-red/10 text-gray-400 hover:text-brand-red rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                                            <X className="w-4 h-4" /> Rejeitar
                                        </button>
                                        <button onClick={() => handleAdoptionAction(adoption.id, 'approved')} disabled={isProcessing === adoption.id} className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 whitespace-nowrap">
                                            <Check className="w-4 h-4" /> Aprovar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        researchAdoptions.map((ra) => (
                            <div key={ra.id} className="bg-neutral-900 border border-white/5 rounded-[32px] overflow-hidden hover:border-brand-yellow/30 transition-all group shadow-2xl">
                                <div className="p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 overflow-hidden">
                                    <div className="flex-1 flex items-center gap-4 lg:gap-6 min-w-0 w-full">
                                        <div className="shrink-0">
                                            <Avatar src={ra.researcher?.avatar_url} name={ra.researcher?.full_name} size="lg" xp={ra.researcher?.xp} level={ra.researcher?.level} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-1 truncate">Pesquisador Responsável</p>
                                            <h3 className="text-xl font-display font-bold text-white truncate">{ra.researcher?.full_name}</h3>
                                            <p className="text-xs text-brand-yellow font-bold uppercase truncate">{ra.researcher?.laboratory_name || 'Lab Div'}</p>
                                        </div>
                                    </div>
                                    <div className="relative flex flex-col items-center justify-center shrink-0">
                                        <div className="absolute inset-0 bg-brand-yellow/5 blur-3xl rounded-full"></div>
                                        <ArrowRight className="w-10 h-10 text-brand-yellow animate-pulse" />
                                    </div>
                                    <div className="flex-1 flex items-center gap-4 lg:gap-6 min-w-0 w-full lg:text-right lg:flex-row-reverse">
                                        <div className="shrink-0">
                                            <Avatar src={ra.student?.avatar_url} name={ra.student?.full_name} size="lg" xp={ra.student?.xp} level={ra.student?.level} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1 truncate">Estudante (Ajudante IC)</p>
                                            <h3 className="text-xl font-display font-bold text-white truncate">{ra.student?.full_name}</h3>
                                            <p className="text-xs text-brand-blue font-bold uppercase truncate">{ra.student?.course}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 lg:gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8 w-full lg:w-auto shrink-0 justify-center">
                                        <button onClick={() => handleMatchAction(ra.id, 'rejected')} disabled={isProcessing === ra.id} className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-brand-red/10 text-gray-400 hover:text-brand-red rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap">
                                            <X className="w-4 h-4" /> Rejeitar
                                        </button>
                                        <button onClick={() => handleMatchAction(ra.id, 'approved')} disabled={isProcessing === ra.id} className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 whitespace-nowrap">
                                            <Check className="w-4 h-4" /> Validar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence>
                {isSyncing && (
                    <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className="fixed top-24 right-6 z-[200] bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,163,255,0.15)]">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-blue-500/30 rounded-full" />
                            <div className="relative">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_10px_#00A3FF]" />
                                <Atom className="absolute -top-3 -left-3 w-8 h-8 text-white/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col pr-2">
                            <h2 className="text-[10px] font-black font-mono text-white uppercase tracking-[0.2em]">Sinc_Atômico</h2>
                            <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">Atualizando_Partículas...</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-2xl overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} className="h-full bg-brand-blue shadow-[0_0_10px_#3b82f6]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
