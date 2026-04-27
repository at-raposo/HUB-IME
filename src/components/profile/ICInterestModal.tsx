'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Microscope, X, Sparkles, Send, Loader2, Bold, Italic, Link2, Code, Sigma, List } from 'lucide-react';
import { updateProfile } from '@/app/actions/profiles';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ICInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        ic_research_area?: string;
        ic_preferred_department?: string;
        ic_preferred_lab?: string;
        ic_letter_of_interest?: string;
    };
}

export function ICInterestModal({ isOpen, onClose, initialData }: ICInterestModalProps) {
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const charLimit = 500;
    const currentChars = formData.ic_letter_of_interest?.length || 0;

    const insertSnippet = (snippet: string) => {
        const textarea = document.getElementById('ic_letter_textarea') as HTMLTextAreaElement;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = before + snippet + after;
        
        setFormData({ ...formData, ic_letter_of_interest: newText });
        
        // Return focus and set cursor
        setTimeout(() => {
            textarea.focus();
            const newPos = start + snippet.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 10);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateProfile({
                seeking_ic: true,
                ...formData
            });
            if (res.success) {
                toast.success('Interesse de IC enviado para a Arena!');
                router.refresh();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao salvar informações');
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado');
        } finally {
            setIsSaving(false);
        }
    };

    const toolbar = [
        { icon: <Bold className="w-3.5 h-3.5" />, label: 'Negrito', snippet: '**texto**' },
        { icon: <Italic className="w-3.5 h-3.5" />, label: 'Itálico', snippet: '*texto*' },
        { icon: <Link2 className="w-3.5 h-3.5" />, label: 'Link', snippet: '[título](url)' },
        { icon: <Code className="w-3.5 h-3.5" />, label: 'Código', snippet: '`código`' },
        { icon: <Sigma className="w-3.5 h-3.5" />, label: 'LaTeX', snippet: '$f(x) = x$' },
        { icon: <List className="w-3.5 h-3.5" />, label: 'Lista', snippet: '\n- Item' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden border border-brand-red/20 relative max-h-[95vh] flex flex-col"
                    >
                        {/* Radioactive Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-red/10 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="p-8 md:p-10 relative z-10 overflow-y-auto no-scrollbar flex-1 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center border border-brand-red/20">
                                        <Microscope className="text-brand-red w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Interesse de IC</h3>
                                        <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Sinalizar Interesse em Pesquisa</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic border-l-2 border-brand-red/20 pl-4 py-1 leading-relaxed">
                                "Ao preencher estes dados, seu perfil ficará em destaque na Arena do Pesquisador para que professores e orientadores te encontrem."
                            </p>

                            {/* Form */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Área de Pesquisa</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Física de Partículas, Nanotecnologia..."
                                        value={formData.ic_research_area || ''}
                                        onChange={(e) => setFormData({ ...formData, ic_research_area: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Departamento de Preferência</label>
                                    <select 
                                        value={formData.ic_preferred_department || ''}
                                        onChange={(e) => setFormData({ ...formData, ic_preferred_department: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold dark:text-white appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="dark:bg-[#1E1E1E]">Selecione um departamento...</option>
                                        <option value="DFMA" className="dark:bg-[#1E1E1E]">DFMA - Física Matemática</option>
                                        <option value="FEP" className="dark:bg-[#1E1E1E]">FEP - Física Experimental</option>
                                        <option value="FGE" className="dark:bg-[#1E1E1E]">FGE - Física Geral</option>
                                        <option value="FMA" className="dark:bg-[#1E1E1E]">FMA - Física dos Materiais e Mecânica</option>
                                        <option value="FMT" className="dark:bg-[#1E1E1E]">FMT - Física Aplicada (FAP/FMT)</option>
                                        <option value="FNC" className="dark:bg-[#1E1E1E]">FNC - Física Nuclear</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Laboratório Desejado</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Lab de Cristalografia, Síncrotron..."
                                        value={formData.ic_preferred_lab || ''}
                                        onChange={(e) => setFormData({ ...formData, ic_preferred_lab: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-bold dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Carta de Interesse</label>
                                        <span className={`text-[9px] font-black transition-colors ${currentChars > charLimit * 0.9 ? 'text-brand-red' : 'text-gray-400'}`}>
                                            {currentChars}/{charLimit}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-col border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-red/20 transition-all">
                                        {/* Toolbar */}
                                        <div className="flex flex-wrap gap-1 p-1.5 bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10">
                                            {toolbar.map((tool) => (
                                                <button
                                                    key={tool.label}
                                                    type="button"
                                                    onClick={() => insertSnippet(tool.snippet)}
                                                    className="p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 text-gray-400 hover:text-brand-red transition-all flex items-center gap-1.5"
                                                    title={tool.label}
                                                >
                                                    {tool.icon}
                                                    <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">{tool.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        <textarea 
                                            id="ic_letter_textarea"
                                            placeholder="Descreva brevemente por que você tem interesse nesta IC..."
                                            maxLength={charLimit}
                                            rows={6}
                                            value={formData.ic_letter_of_interest || ''}
                                            onChange={(e) => setFormData({ ...formData, ic_letter_of_interest: e.target.value })}
                                            className="w-full bg-white dark:bg-black/10 px-5 py-4 text-sm focus:outline-none transition-all font-bold dark:text-white resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Area inside scrollable for better overflow handling */}
                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || currentChars > charLimit}
                                    className="flex-[2] px-8 py-4 bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2 group/send disabled:opacity-50 disabled:grayscale"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 transition-transform group-hover/send:-translate-y-px group-hover/send:translate-x-px" />
                                            Lançar interesse
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-center gap-2 pt-2 pb-2">
                                <Sparkles className="w-3 h-3 text-brand-yellow animate-pulse" />
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Protocolo Match Acadêmico v3.2.1</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
