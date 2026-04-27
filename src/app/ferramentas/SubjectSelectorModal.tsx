'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, GraduationCap, Clock, User, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Turma {
    codigo: string;
    professores: string[];
    horarios: string[]; // e.g., ["seg 08:00 10:00", "qui 08:00 10:00"]
}

interface Subject {
    codigo: string;
    nome: string;
    turmas: Turma[];
}

export function SubjectSelectorModal({
    isOpen,
    onClose,
    onAddTurma,
    onRemoveTurma,
    currentEvents = []
}: {
    isOpen: boolean;
    onClose: () => void;
    onAddTurma: (subject: Subject, turma: Turma) => void;
    onRemoveTurma: (subjectCode: string) => void;
    currentEvents: any[];
}) {
    const [institute, setInstitute] = useState<'IF' | 'IME' | 'FM'>('IF');
    const [searchQuery, setSearchQuery] = useState('');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchSubjects = async () => {
            setIsLoading(true);
            try {
                let url = '/data/if_subjects.json';
                if (institute === 'IME') url = '/data/ime_subjects.json';
                if (institute === 'FM') url = '/data/other_subjects.json';
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('Falha ao carregar disciplinas');
                const data = await response.json();
                setSubjects(data);
            } catch (err) {
                console.error(err);
                toast.error(`Erro ao carregar dados do ${institute}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubjects();
    }, [institute, isOpen]);

    const filteredSubjects = subjects.filter(sub => {
        const query = searchQuery.toLowerCase();
        return sub.codigo.toLowerCase().includes(query) || sub.nome.toLowerCase().includes(query);
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl max-h-[85vh] bg-[#121212] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00A3FF]/20 flex items-center justify-center border border-[#00A3FF]/30 text-[#00A3FF]">
                            <Map className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                Turmas disponíveis
                            </h2>
                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                Adicione matrículas diretamente na sua grade
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 shrink-0 space-y-4">
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                        <button
                            onClick={() => { setInstitute('IF'); setExpandedSubject(null); }}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${institute === 'IF' ? 'bg-[#00A3FF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            IFUSP
                        </button>
                        <button
                            onClick={() => { setInstitute('IME'); setExpandedSubject(null); }}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${institute === 'IME' ? 'bg-[#00A3FF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            IME
                        </button>
                        <button
                            onClick={() => { setInstitute('FM'); setExpandedSubject(null); }}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${institute === 'FM' ? 'bg-[#00A3FF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            FÍSICA MÉDICA
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por código (ex: MAC0110) ou nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 text-sm font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin text-[#00A3FF] mb-4" />
                            <p className="text-xs font-mono uppercase tracking-widest">Calculando matrizes Júpiter...</p>
                        </div>
                    ) : filteredSubjects.length > 0 ? (
                        <div className="space-y-3">
                            {filteredSubjects.map(sub => (
                                <div key={sub.codigo} className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden transition-colors hover:border-white/10">
                                    <div 
                                        onClick={() => setExpandedSubject(expandedSubject === sub.codigo ? null : sub.codigo)}
                                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="px-2.5 py-1 rounded bg-[#00A3FF]/10 border border-[#00A3FF]/20 text-[#00A3FF] font-mono text-[10px] uppercase font-black tracking-wider w-fit">
                                                {sub.codigo}
                                            </div>
                                            <div className="font-bold text-gray-200 text-sm">
                                                {sub.nome}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-[#00A3FF] uppercase font-black px-3 py-1 bg-[#00A3FF]/5 rounded-lg whitespace-nowrap hidden sm:block w-fit">
                                            {sub.turmas.length} {sub.turmas.length === 1 ? 'Turma' : 'Turmas'}
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {expandedSubject === sub.codigo && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-black/40"
                                            >
                                                <div className="p-4 space-y-4">
                                                    {(() => {
                                                        const isEnrolled = currentEvents.some(e => e.extendedProps?.sourceId === sub.codigo);
                                                        
                                                        return sub.turmas.length > 0 ? sub.turmas.map(turma => (
                                                            <div key={turma.codigo} className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-white/10 transition-colors">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase">
                                                                        <GraduationCap className="w-3 h-3" />
                                                                        <span>Turma {turma.codigo}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                                                                        <User className="w-3.5 h-3.5 text-brand-blue" />
                                                                        {turma.professores.join(', ') || 'A definir'}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[11px] font-mono font-black text-gray-400">
                                                                        <Clock className="w-3.5 h-3.5 text-brand-yellow" />
                                                                        {turma.horarios.join(' | ')}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (isEnrolled) {
                                                                            onRemoveTurma(sub.codigo);
                                                                        } else {
                                                                            onAddTurma(sub, turma);
                                                                        }
                                                                    }}
                                                                    className={`w-full sm:w-auto px-4 py-2 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 ${
                                                                        isEnrolled 
                                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10' 
                                                                        : 'bg-[#00A3FF]/10 text-[#00A3FF] border-[#00A3FF]/20 hover:bg-[#00A3FF] hover:text-white shadow-lg shadow-[#00A3FF]/10'
                                                                    }`}
                                                                >
                                                                    {isEnrolled ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                    {isEnrolled ? 'Remover' : 'Adicionar'}
                                                                </button>
                                                            </div>
                                                        )) : (
                                                            <div className="text-center text-xs text-gray-500 py-4 font-mono uppercase">
                                                                Nenhuma turma cadastrada neste semestre.
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-3">
                            <Search className="w-8 h-8 opacity-50" />
                            <p className="text-xs font-mono uppercase tracking-widest">Nenhuma disciplina encontrada</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
