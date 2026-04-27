'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitKnowledgeSuggestion } from '@/app/actions/knowledge';
import { toast } from 'react-hot-toast';
import FocusLock from 'react-focus-lock';

interface Props {
    departmentId?: string;
    departmentName?: string;
}

export function KnowledgeSuggestionWidget({ departmentId, departmentName }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [tipo, setTipo] = useState<'novo_laboratorio' | 'atualizar_pesquisador' | 'alterar_linha' | 'outro'>('outro');
    const [conteudo, setConteudo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (conteudo.trim().length < 10) {
            toast.error("A justificação precisa ter no mínimo 10 caracteres.");
            return;
        }

        setIsSubmitting(true);
        const result = await submitKnowledgeSuggestion({
            department_id: departmentId,
            tipo,
            conteudo
        });

        if (result.success) {
            toast.success("Contribuição registrada! O Lab-Div analisará em breve.", {
                icon: '💡',
                duration: 4000
            });
            setIsOpen(false);
            setConteudo('');
        } else {
            toast.error(result.error || "Erro ao registrar a sugestão.");
        }
        setIsSubmitting(false);
    };

    return (
        <>
            {/* Widget Button na Coluna Direita */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-brand-yellow/10 to-brand-yellow/5 border border-brand-yellow/30 hover:border-brand-yellow/60 rounded-3xl transition-all shadow-md group"
                aria-label="Sugerir Atualização no Grafo do Departamento"
            >
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-black text-brand-yellow uppercase tracking-widest">
                        Grafo Aberto
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Sugerir Atualização
                    </h3>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-card-dark rounded-full flex items-center justify-center text-brand-yellow shadow-inner group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl animate-pulse">emoji_objects</span>
                </div>
            </button>

            {/* Modal Focus Trap */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Overlay translúcido dark */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md w-full h-full"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Box */}
                        <FocusLock disabled={!isOpen} returnFocus>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                role="dialog"
                                aria-modal="true"
                                className="relative w-full max-w-lg bg-white dark:bg-[#121212] rounded-[40px] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden z-10"
                                onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                            >
                                <div className="p-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-[900] text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                                <span className="material-symbols-outlined text-brand-yellow text-3xl">emoji_objects</span>
                                                Sugerir Atualização
                                            </h2>
                                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                                                {departmentName 
                                                    ? `Expansão do Grafo: ${departmentName}`
                                                    : 'Expansão do Grafo Institucional'
                                                }
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-brand-red transition-all"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Natureza da Sugestão</label>
                                            <select 
                                                value={tipo}
                                                onChange={(e) => setTipo(e.target.value as any)}
                                                className="w-full bg-gray-50 dark:bg-card-dark border-2 border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white font-bold focus:border-brand-yellow transition-all appearance-none cursor-pointer text-sm"
                                            >
                                                <option value="novo_laboratorio">1. Incluir Novo Laboratório/Grupo</option>
                                                <option value="atualizar_pesquisador">2. Atualizar Dados de Docente</option>
                                                <option value="alterar_linha">3. Alterar Linha de Pesquisa</option>
                                                <option value="outro">4. Outra Atualização Institucional</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Justificativa e Dados</label>
                                            <textarea 
                                                value={conteudo}
                                                onChange={(e) => setConteudo(e.target.value)}
                                                placeholder="Descreva a atualização. Ex: 'O Laboratório X mudou para o Depto Y' ou 'O Prof. Fulano agora coordena a linha Z'."
                                                required
                                                minLength={10}
                                                rows={5}
                                                className="w-full bg-gray-50 dark:bg-card-dark border-2 border-gray-100 dark:border-white/10 rounded-3xl px-5 py-4 text-gray-900 dark:text-white font-medium focus:border-brand-yellow transition-all resize-none text-sm leading-relaxed"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || conteudo.trim().length < 10}
                                            className="w-full py-5 bg-brand-yellow text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-yellow/20 hover:shadow-brand-yellow/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> Catalogando...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined">send</span> Enviar Contribuição
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </FocusLock>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
