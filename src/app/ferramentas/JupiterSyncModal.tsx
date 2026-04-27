import React, { useState } from 'react';
import { X, Loader2, RefreshCw, Lock, Check, Calendar, BookOpen, Palette } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { syncJupiterData } from '@/app/actions/calendar';
import { useAuth } from '@/providers/AuthProvider';

interface JupiterSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'auth' | 'review' | 'cached';

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#06B6D4', // Cyan/Teal
    '#FFCC00', // Yellow
    '#F97316', // Orange
    '#EF4444', // Red
];

export function JupiterSyncModal({ isOpen, onClose, onSuccess }: JupiterSyncModalProps) {
    const { user, profile } = useAuth();
    const [step, setStep] = useState<Step>('auth');
    const [nUsp, setNUsp] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Auto-fill nUSP from email prefix
    React.useEffect(() => {
        if (isOpen && user?.email?.endsWith('@usp.br') && !nUsp) {
            const prefix = user.email.split('@')[0];
            if (!isNaN(Number(prefix))) {
                setNUsp(prefix);
            }
        }
    }, [isOpen, user, nUsp]);

    // [FAST SYNC] Check if cache exists on modal open
    React.useEffect(() => {
        if (isOpen && profile?.jupiter_subjects_cache?.subjects && step === 'auth') {
            setStep('cached');
        }
    }, [isOpen, profile, step]);
    
    // Scraped Data
    const [scrapedSubjects, setScrapedSubjects] = useState<any[]>([]);
    const [subjectsOptions, setSubjectsOptions] = useState<{
        [code: string]: {
            linkToCalendar: boolean;
            generateStudy: boolean;
            color: string;
            title: string;
        }
    }>({});

    if (!isOpen) return null;

    const handleInitialSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/jupiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nUsp, password })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || 'Erro ao sincronizar com Júpiter');
                return;
            }

            // Prepare Review Data
            const codes = Array.from(new Set(data.subjects.map((s: any) => s.code))) as string[];
            const initialOptions: any = {};
            
            codes.forEach((code, idx) => {
                initialOptions[code] = {
                    linkToCalendar: true,
                    generateStudy: true,
                    color: PRESET_COLORS[idx % PRESET_COLORS.length],
                    title: data.courseNames[code] || code
                };
            });

            setScrapedSubjects(data.subjects);
            setSubjectsOptions(initialOptions);
            setStep('review');
            toast.success('Disciplinas carregadas! Revise o que deseja importar.');
        } catch (error: any) {
            console.error('Jupiter Sync Error:', error);
            toast.error('Erro de conexão ao servidor de sincronização.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalConfirm = async () => {
        setIsLoading(true);
        try {
            const res = await syncJupiterData({
                subjects: scrapedSubjects,
                options: subjectsOptions
            });

            if (res.success) {
                toast.success('Grade sincronizada com sucesso!');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao salvar grade');
            }
        } catch (error) {
            toast.error('Erro ao finalizar sincronização');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOption = (code: string, field: 'linkToCalendar' | 'generateStudy') => {
        setSubjectsOptions(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                [field]: !prev[code][field]
            }
        }));
    };

    const changeColor = (code: string, color: string) => {
        setSubjectsOptions(prev => ({
            ...prev,
            [code]: {
                ...prev[code],
                color
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className={`bg-[#121212] w-full ${step === 'auth' ? 'max-w-md' : 'max-w-2xl'} rounded-[32px] border border-white/10 shadow-2xl overflow-hidden transition-all duration-500`}>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-yellow/10 rounded-xl">
                                <RefreshCw className={`w-5 h-5 text-brand-yellow ${isLoading ? 'animate-spin' : ''}`} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                                {step === 'auth' ? 'Sincronização Júpiter' : 
                                 step === 'review' ? 'Revisar Disciplinas' : 
                                 'Última Sincronização'}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {step === 'cached' && (
                        <div className="space-y-6">
                             <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-3">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <Check className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-tight">Sincronização Ativa</span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Você já possui {profile.jupiter_subjects_cache.subjects.length} disciplinas sincronizadas em {new Date(profile.last_jupiter_sync).toLocaleDateString('pt-BR')}.
                                </p>
                             </div>

                             <div className="flex flex-col gap-3">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all"
                                >
                                    Manter Grade Atual
                                </button>
                                <button
                                    onClick={() => setStep('auth')}
                                    className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-500 hover:text-brand-yellow font-black uppercase tracking-widest py-2 transition-all"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Refazer Sincronização Completa
                                </button>
                             </div>
                        </div>
                    )}

                    {step === 'auth' ? (
                        <>
                            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                                Conecte-se ao JúpiterWeb para importar sua grade horária oficial automaticamente para o cronograma do Hub.
                            </p>

                            <form onSubmit={handleInitialSync} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.1em] ml-1">Número USP</label>
                                    <input
                                        type="text"
                                        value={nUsp}
                                        onChange={(e) => setNUsp(e.target.value)}
                                        placeholder="Seu NUSP"
                                        required
                                        disabled={isLoading}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.1em] ml-1">Senha Única</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full group relative flex items-center justify-center gap-3 bg-brand-yellow hover:opacity-90 text-[#121212] font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/20 disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Conectando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            <span>Sincronizar Agora</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3 opacity-60">
                                <Lock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    Sua senha não é armazenada. O sistema a utiliza apenas nesta sessão para comunicação segura com os servidores da USP.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 space-y-3">
                            {Object.keys(subjectsOptions).length > 0 ? (
                                Object.keys(subjectsOptions).map(code => {
                                    const opt = subjectsOptions[code];
                                    return (
                                        <div key={code} className="p-4 bg-white/5 border border-white/10 rounded-[24px] space-y-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest leading-none mb-1">{code}</p>
                                                        <h3 className="text-sm font-bold text-white truncate leading-tight">{opt.title}</h3>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {PRESET_COLORS.map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => changeColor(code, c)}
                                                            className={`w-4 h-4 rounded-full transition-transform ${opt.color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                                                            style={{ backgroundColor: c }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                                                <button
                                                    onClick={() => toggleOption(code, 'linkToCalendar')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${opt.linkToCalendar ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-500'}`}
                                                >
                                                    <Calendar className="w-3 h-3" />
                                                    Vincular Grade
                                                </button>
                                                <button
                                                    onClick={() => toggleOption(code, 'generateStudy')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${opt.generateStudy ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'}`}
                                                >
                                                    <BookOpen className="w-3 h-3" />
                                                    Gerar Estudo
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
                                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-1">Nenhuma disciplina encontrada</p>
                                    <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                        Não encontramos nenhuma matrícula ativa no Júpiter para o período selecionado.
                                    </p>
                                </div>
                            )}
                        </div>

                            <button
                                onClick={handleFinalConfirm}
                                disabled={isLoading}
                                className="w-full group relative flex items-center justify-center gap-3 bg-brand-yellow hover:opacity-90 text-[#121212] font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-yellow/20 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Sincronizando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Confirmar Grade</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
