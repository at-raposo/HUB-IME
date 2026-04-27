'use client';

import { supabase } from '@/lib/supabase';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import toast from 'react-hot-toast';


function LoginContent() {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleLogin = async (track: 'usp' | 'external', category?: 'aluno_usp' | 'pesquisador') => {
        setIsLoading(true);
        try {
            const next = searchParams.get('next') || '/';
            let redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}&track=${track}`;
            
            if (category) {
                redirectTo += `&category=${category}`;
            }

            const options: any = {
                redirectTo,
                queryParams: {
                    prompt: 'select_account',
                },
            };

            // Hard-Lock Domain Hint for Aluno USP track
            if (track === 'usp' && category === 'aluno_usp') {
                options.queryParams.hd = 'usp.br';
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options,
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error logging in:', error.message);
            setIsLoading(false);
        }
    };

    const errorParam = searchParams.get('error');
    const hasConflict = searchParams.get('conflict') === 'true';
    const conflictEmail = searchParams.get('email');

    const handleConflictChoice = async (choice: 'visitor' | 'switch') => {
        if (choice === 'switch') {
            handleLogin('usp');
        } else {
            const next = searchParams.get('next') || '/';
            router.push(`/onboarding?track=external&next=${encodeURIComponent(next)}`);
        }
    };

    useEffect(() => {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear local storage:', error);
        }
    }, []);

    return (
        <main className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50 dark:bg-background-dark/30">
            <div className="max-w-md w-full bg-white dark:bg-card-dark rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="p-8 sm:p-12 relative">
                    <Link
                        href="/"
                        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-brand-blue transition-colors text-[10px] font-black uppercase tracking-widest group"
                    >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">west</span>
                        Voltar
                    </Link>

                    <div className="flex flex-col items-center text-center space-y-4 mb-10">
                        <div className="mb-6">
                            <img src="/hub-ime-logo.png" alt="Hub HUB IME" className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-lg" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                            Bem-vindo à <span className="text-brand-blue">Comunidade</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-[260px]">
                            Conecte-se para compartilhar suas descobertas e acessar ferramentas exclusivas.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {errorParam === 'usp-domain-required' && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-bold animate-pulse">
                                Acesso Negado: E-mail @usp.br obrigatório.
                            </div>
                        )}

                        <button
                            onClick={() => handleLogin('usp', 'aluno_usp')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-4 bg-[#3B82F6] hover:bg-blue-600 text-white py-4 px-6 rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center gap-3 text-lg">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                                    </svg>
                                    Sou Aluno USP
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => handleLogin('usp', 'pesquisador')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-4 bg-transparent hover:bg-white/5 text-gray-300 border-2 border-brand-red hover:border-brand-red/70 py-4 px-6 rounded-2xl font-bold transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
                        >
                            <span className="flex items-center gap-3 text-lg text-brand-red">
                                <Trophy className="w-6 h-6" />
                                Sou Pesquisador USP
                            </span>
                        </button>

                        <button
                            onClick={() => handleLogin('external')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-4 bg-transparent hover:bg-white/5 text-gray-400 border-2 border-gray-100 dark:border-gray-800 py-3 px-6 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Curioso / Outras Instituições
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-400">
                                <span className="bg-white dark:bg-card-dark px-2">Acesso Seguro</span>
                            </div>
                        </div>

                        <p className="text-[10px] text-center text-gray-400 leading-relaxed px-4">
                            Ao entrar, você concorda em compartilhar sua experiência acadêmica de forma ética e colaborativa com o Hub HUB IME.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-background-dark/50 p-6 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500">
                        Não é um membro do IF? <span className="text-brand-blue font-bold">Sem problemas!</span> O Hub é aberto a toda a sociedade.
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {hasConflict && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-card-dark rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
                        >
                            <div className="w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-brand-yellow text-3xl">warning</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Conflito de Identidade</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Você logou com <span className="font-bold text-gray-900 dark:text-gray-100">{conflictEmail}</span>, que não é um e-mail institucional da USP.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleConflictChoice('visitor')}
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Continuar como Curioso
                                </button>
                                <button
                                    onClick={() => handleConflictChoice('switch')}
                                    className="w-full py-4 bg-transparent border-2 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}
