'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { 
    MessageSquare, Check, X, Trash2, 
    Search, Filter, Clock, AlertCircle,
    Loader2, User as UserIcon, Calendar,
    ExternalLink, ChevronDown, CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
    id: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user_id: string;
    post_id: string;
    profiles: {
        full_name: string;
        email: string;
    };
    submissions: {
        title: string;
    };
}

export function CommentsManager() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles (full_name, email),
                submissions (title)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Erro ao carregar comentários.");
        } else {
            setComments(data as any || []);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('comments')
            .update({ status })
            .eq('id', id);

        if (error) {
            toast.error("Erro ao atualizar status.");
        } else {
            setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            toast.success(status === 'approved' ? "Comentário aprovado!" : "Comentário rejeitado.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir permanentemente este comentário?")) return;

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Erro ao excluir comentário.");
        } else {
            setComments(prev => prev.filter(c => c.id !== id));
            toast.success("Comentário excluído.");
        }
    };

    const handleBulkStatus = async (status: 'approved' | 'rejected') => {
        if (selectedIds.size === 0) return;
        
        const { error } = await supabase
            .from('comments')
            .update({ status })
            .in('id', Array.from(selectedIds));

        if (error) {
            toast.error("Erro no processamento em massa.");
        } else {
            setComments(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status } : c));
            setSelectedIds(new Set());
            toast.success(`${selectedIds.size} comentários atualizados.`);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Excluir permanentemente ${selectedIds.size} comentários?`)) return;

        const { error } = await supabase
            .from('comments')
            .delete()
            .in('id', Array.from(selectedIds));

        if (error) {
            toast.error("Erro ao excluir comentários.");
        } else {
            setComments(prev => prev.filter(c => !selectedIds.has(c.id)));
            setSelectedIds(new Set());
            toast.success("Comentários excluídos.");
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredComments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredComments.map(c => c.id)));
        }
    };

    const filteredComments = useMemo(() => {
        return comments.filter(c => {
            const matchesSearch = 
                c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.submissions?.title?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [comments, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        pending: comments.filter(c => c.status === 'pending').length,
        approved: comments.filter(c => c.status === 'approved').length,
        rejected: comments.filter(c => c.status === 'rejected').length,
    }), [comments]);

    return (
        <div className="space-y-6">
            {/* Filtros e Busca */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue w-5 h-5 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar em comentários, autores ou posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm shadow-sm text-gray-900 dark:text-white"
                        style={{'--tw-ring-color': 'rgba(37, 99, 235, 0.2)'} as any}
                    />
                </div>
                
                <div className="flex gap-2 p-1 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-[20px] shadow-sm">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === f 
                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                : 'text-gray-500 hover:text-brand-blue'
                            }`}
                        >
                            {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Rejeitados'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ações em Massa */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/40 dark:bg-card-dark/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-blue transition-colors"
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.size === filteredComments.length && filteredComments.length > 0 ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedIds.size === filteredComments.length && filteredComments.length > 0 && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                        Selecionar Todos
                    </button>
                    {selectedIds.size > 0 && (
                        <span className="text-sm font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
                            {selectedIds.size} selecionados
                        </span>
                    )}
                </div>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleBulkStatus('approved')} className="px-4 py-2 bg-brand-blue text-white hover:bg-brand-blue/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <Check className="w-4 h-4" /> Aprovar
                        </button>
                        <button onClick={() => handleBulkStatus('rejected')} className="px-4 py-2 bg-brand-red text-white hover:bg-brand-red/80 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <X className="w-4 h-4" /> Rejeitar
                        </button>
                        <button onClick={handleBulkDelete} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                )}
            </div>

            {/* Lista de Comentários */}
            {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando Comentários...</p>
                </div>
            ) : filteredComments.length === 0 ? (
                <div className="w-full text-center py-32 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum comentário encontrado para estes filtros.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredComments.map(comment => (
                        <div 
                            key={comment.id}
                            className={`group bg-white/40 dark:bg-card-dark/5 backdrop-blur-md border rounded-[28px] p-6 transition-all hover:shadow-xl hover:scale-[1.01] flex gap-6 ${
                                comment.status === 'pending' ? 'border-brand-yellow/30 bg-brand-yellow/5' :
                                comment.status === 'approved' ? 'border-brand-blue/20' :
                                'border-brand-red/20 opacity-60'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="pt-1">
                                <button 
                                    onClick={() => toggleSelect(comment.id)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.has(comment.id) ? 'bg-brand-blue border-brand-blue' : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20'}`}
                                >
                                    {selectedIds.has(comment.id) && <Check className="w-4 h-4 text-white" />}
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                <UserIcon className="w-4 h-4 text-brand-blue" />
                                                {comment.profiles?.full_name || 'Usuário Desconhecido'}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(comment.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-brand-blue font-bold uppercase tracking-wider">
                                            <ExternalLink className="w-3 h-3" />
                                            Post: {comment.submissions?.title || 'Relíquia do Tempo'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {comment.status === 'pending' && (
                                            <span className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" /> Pendente
                                            </span>
                                        )}
                                        {comment.status === 'approved' && (
                                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                                <Check className="w-3 h-3" /> Ativo
                                            </span>
                                        )}
                                        {comment.status === 'rejected' && (
                                            <span className="px-3 py-1 bg-brand-red/10 text-brand-red text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                                                <X className="w-3 h-3" /> Rejeitado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {comment.content}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        {comment.status !== 'approved' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(comment.id, 'approved')}
                                                className="px-4 py-2 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> Aprovar
                                            </button>
                                        )}
                                        {comment.status !== 'rejected' && (
                                            <button 
                                                onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                                                className="px-4 py-2 bg-brand-red/10 text-brand-red hover:bg-brand-red hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" /> Rejeitar
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(comment.id)}
                                        className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
