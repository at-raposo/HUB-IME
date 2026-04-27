'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface RequireAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function RequireAuthModal({
    isOpen,
    onClose,
    title = 'Login Necessário',
    message = 'Você precisa estar logado para usar as Anotações Privadas e sugerir melhorias.'
}: RequireAuthModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <m.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                    <div className="p-6 sm:p-8 text-center">
                        <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-3xl text-brand-blue">lock</span>
                        </div>

                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {message}
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-4 px-6 bg-brand-blue hover:bg-brand-darkBlue text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Fazer Login
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </m.div>
            </div>
        </AnimatePresence>
    );
}
