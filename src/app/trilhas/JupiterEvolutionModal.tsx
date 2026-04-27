'use client';

import React, { useState } from 'react';
import { X, Loader2, RefreshCw, Lock, Check, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { syncJupiterEvolution } from '@/app/actions/progress';

interface JupiterEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'auth' | 'loading' | 'review';

export function JupiterEvolutionModal({ isOpen, onClose, onSuccess }: JupiterEvolutionModalProps) {
    const [step, setStep] = useState<Step>('auth');
    const [nUsp, setNUsp] = useState('');
    const [password, setPassword] = useState('');
    
    // Scraped Data
    const [concluidas, setConcluidas] = useState<string[]>([]);
    const [cursando, setCursando] = useState<string[]>([]);
    
    // Submitting status for the final step
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleInitialSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('loading');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            const res = await fetch('/api/auth/jupiter-evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nUsp, password }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();

            if (!res.ok || !data.success) {
                toast.error(data.error || 'Erro ao sincronizar evolução com Júpiter');
                setStep('auth');
                return;
            }

            setConcluidas(data.concluidas || []);
            setCursando(data.cursando || []);
            setStep('review');
            toast.success('Histórico extraído! Revise suas disciplinas.');
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                toast.error('O JúpiterWeb parece estar instável no momento (típico, não é?). Tenta novamente mais tarde ou atualiza as tuas trilhas manualmente.', { duration: 6000, icon: '🐢' });
            } else {
                console.error('Jupiter Evolution Error:', error);
                toast.error('Erro de conexão ao servidor de extração.');
            }
            setStep('auth');
        }
    };

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            const res = await syncJupiterEvolution({
                concluidas,
                cursando
            });

            if (res.success) {
                toast.success(res.message || 'Evolução sincronizada com sucesso!');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao salvar histórico');
            }
        } catch (error) {
            toast.error('Erro ao finalizar sincronização do histórico.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-[32px] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-500">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-blue/10 rounded-xl">
                                <RefreshCw className={`w-5 h-5 text-brand-blue ${step === 'loading' ? 'animate-spin' : ''}`} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                                {step === 'auth' ? 'Sincronizar Evolução' : step === 'loading' ? 'Extraindo...' : 'Revisão do Histórico'}
                            </h2>
                        </div>
                        <button onClick={onClose} disabled={step === 'loading'} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors disabled:opacity-50 cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    {step === 'auth' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                                Conecte-se ao JúpiterWeb para mapear automaticamente as disciplinas que você <strong className="text-emerald-500 dark:text-emerald-400">já concluído</strong> e as que <strong className="text-amber-500 dark:text-amber-400">está cursando</strong>.
                            </p>

                            <form onSubmit={handleInitialSync} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.1em] ml-1">Número USP</label>
                                    <input
                                        type="text"
                                        value={nUsp}
                                        onChange={(e) => setNUsp(e.target.value)}
                                        placeholder="Seu NUSP"
                                        required
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.1em] ml-1">Senha Única</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all font-mono"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full group relative flex items-center justify-center gap-3 bg-brand-blue hover:bg-brand-blue-accent text-white font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-blue/20 mt-4 cursor-pointer"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    <span>Iniciar Resgate</span>
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-start gap-3 opacity-60">
                                <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                                    A sua senha Única da USP trafega criptografada e não será armazenada. Usada sob demanda e descartada em tempo de execução.
                                </p>
                            </div>
                        </div>
                    )}

                    {(step === 'loading' || step === 'review') && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                            <div className="max-h-[70vh] min-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                
                                {step === 'loading' ? (
                                    <>
                                        <div className="space-y-3">
                                            <div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mb-4"></div>
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <div key={`skel-c-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 animate-pulse"></div>
                                                    <div className="h-4 w-24 bg-gray-100 dark:bg-white/10 rounded animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded-full animate-pulse mb-4"></div>
                                            {[1, 2, 3].map(i => (
                                                <div key={`skel-a-${i}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                                    <div className="w-8 h-8 rounded-full bg-brand-yellow/20 animate-pulse"></div>
                                                    <div className="h-4 w-24 bg-gray-100 dark:bg-white/10 rounded animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest flex items-center gap-2 mb-4">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                Matérias Concluídas ({concluidas.length})
                                            </h3>
                                            
                                            {concluidas.length === 0 ? (
                                                 <p className="text-sm text-gray-400 dark:text-gray-600 italic px-2">Nenhuma detectada nesta extração.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {concluidas.map(code => (
                                                        <div key={code} className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-100 tracking-widest font-mono">{code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                                            <h3 className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest flex items-center gap-1 mb-4">
                                                <Clock className="w-4 h-4 text-brand-yellow" />
                                                Cursando / Andamento ({cursando.length})
                                            </h3>

                                            {cursando.length === 0 ? (
                                                 <p className="text-sm text-gray-400 dark:text-gray-600 italic px-2">Nenhuma detectada nesta extração.</p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {cursando.map(code => (
                                                        <div key={code} className="flex items-center gap-2 p-2.5 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl">
                                                            <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></div>
                                                            <span className="text-xs font-bold text-brand-yellow/80 dark:text-brand-yellow tracking-widest font-mono">{code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleFinalConfirm}
                                disabled={isSubmitting || step === 'loading'}
                                className={`w-full group relative flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer
                                    ${step === 'loading' ? 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 pointer-events-none' : 'bg-brand-blue hover:bg-brand-blue-accent text-white shadow-brand-blue/20'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Consolidando...</span>
                                    </>
                                ) : step === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Buscando na USP...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        <span>Confirmar Sincronização</span>
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
