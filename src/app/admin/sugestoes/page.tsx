'use client';

import { useEffect, useState } from 'react';
import { getKnowledgeSuggestions, updateKnowledgeSuggestionStatus } from '@/app/actions/knowledge';
import { 
    LayoutDashboard, Inbox, Check, X, 
    RotateCcw, Loader2, MessageSquare, 
    User, Calendar, Landmark, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useNotify } from '@/hooks/useNotify';

export default function AdminSuggestionsPage() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const notify = useNotify();

    const fetchSuggestions = async () => {
        setIsLoading(true);
        const res = await getKnowledgeSuggestions();
        if (res.success) {
            setSuggestions(res.data || []);
        } else {
            toast.error(res.error || 'Erro ao carregar sugestões');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'pendente' | 'analisado' | 'recusado') => {
        const { data: res } = await notify.promise(updateKnowledgeSuggestionStatus(id, status), {
            loading: 'Atualizando status...',
            success: 'Status atualizado!',
            error: 'Erro ao atualizar status'
        });

        if (res?.success) {
            setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pendente': return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
            case 'analisado': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
            case 'recusado': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    };

    const getTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'novo_laboratorio': return 'Novo Laboratório';
            case 'atualizar_pesquisador': return 'Atualizar Pesquisador';
            case 'alterar_linha': return 'Alterar Linha';
            case 'outro': return 'Outro';
            default: return tipo;
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <LayoutDashboard className="w-5 h-5" />
                        <Link href="/admin" className="hover:text-brand-blue transition-colors">Dashboard</Link>
                        <span className="text-gray-300 dark:text-gray-600">/</span>
                        <span className="text-brand-blue font-bold">Sugestões do Grafo</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Sugestões de Grafo</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Revise e aceite pedidos de novos laboratórios ou pesquisadores.</p>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-6" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando sugestões...</p>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="text-center py-20 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium font-display">Sem sugestões no momento</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">O Grafo está em equilíbrio</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-all">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-4 flex-1 min-w-[300px]">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(suggestion.status)}`}>
                                            {suggestion.status}
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                                            {getTypeLabel(suggestion.tipo)}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-gray-50 dark:bg-background-dark/30 p-4 rounded-xl border border-brand-blue/5">
                                        <MessageSquare className="w-5 h-5 text-brand-blue shrink-0 mt-1" />
                                        <p className="text-gray-700 dark:text-gray-200 text-sm italic font-medium">"{suggestion.conteudo}"</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-4 h-4 text-brand-blue" />
                                            <span className="font-bold">{suggestion.profiles?.full_name || suggestion.profiles?.email || 'Anônimo'}</span>
                                        </div>
                                        {suggestion.departments && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Landmark className="w-4 h-4 text-brand-blue" />
                                                <span>{suggestion.departments.nome} ({suggestion.departments.sigla})</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-4 h-4 text-brand-blue" />
                                            <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {suggestion.status === 'pendente' ? (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(suggestion.id, 'analisado')}
                                                className="px-4 py-2.5 bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                                            >
                                                <Check className="w-4 h-4" /> Resolver
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(suggestion.id, 'recusado')}
                                                className="px-4 py-2.5 bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                                            >
                                                <X className="w-4 h-4" /> Recusar
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => handleUpdateStatus(suggestion.id, 'pendente')}
                                            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Reabrir
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
