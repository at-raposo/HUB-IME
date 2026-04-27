'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchArenaSuggestions, updateSuggestionStatus, createChallenge, fetchArenaFeedback } from '@/app/actions/arena';
import { 
    Trophy, Check, X, Clock, Loader2, Search, Inbox, 
    ShieldCheck, Calendar, MessageSquare, Microscope, User, Plus,
    Lightbulb, AlertCircle, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar } from '@/components/ui/Avatar';

interface Suggestion {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    researcher_id: string;
    researcher?: {
        full_name: string;
        username: string;
        avatar_url: string;
    };
}

interface Feedback {
    id: string;
    description: string;
    created_at: string;
    user?: {
        full_name: string;
        username: string;
        avatar_url: string;
    };
    metadata?: any;
    status: string;
}

export default function AdminChallengesPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'arena' | 'hub'>('arena');
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for creating challenge
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [suggestionsRes, feedbacksRes] = await Promise.all([
            fetchArenaSuggestions(),
            fetchArenaFeedback()
        ]);

        if (suggestionsRes.success && suggestionsRes.data) {
            setSuggestions(suggestionsRes.data);
        }
        if (feedbacksRes.success && feedbacksRes.data) {
            setFeedbacks(feedbacksRes.data);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateChallenge = async () => {
        if (!newTitle.trim() || !newDesc.trim()) {
            toast.error('Preencha título e descrição');
            return;
        }

        setIsCreating(true);
        const res = await createChallenge(newTitle, newDesc);
        if (res.success) {
            toast.success('Desafio criado com sucesso!');
            setIsCreateModalOpen(false);
            setNewTitle('');
            setNewDesc('');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao criar desafio');
        }
        setIsCreating(false);
    };

    const handleAction = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        const res = await updateSuggestionStatus(id, status);
        if (res.success) {
            toast.success(status === 'approved' ? 'Sugestão aprovada!' : status === 'rejected' ? 'Sugestão recusada.' : 'Status revertido.');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao processar ação');
        }
    };

    const filteredSuggestions = suggestions.filter((s: Suggestion) => {
        const matchesFilter = s.status === filter;
        const matchesSearch = 
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.researcher?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.researcher?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

    const filteredFeedbacks = feedbacks.filter((f: Feedback) => {
        const matchesSearch = 
            f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.user?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-[#121212]/50 rounded-[3rem] border border-white/5 backdrop-blur-sm relative">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4 group">
                        <div className="p-3 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20 group-hover:rotate-6 transition-transform">
                            <Trophy className="text-brand-yellow" size={32} />
                        </div>
                        <span className="underline decoration-brand-yellow/50 decoration-8 underline-offset-4">CURADORIA DA ARENA</span>
                    </h1>
                    <p className="text-gray-500 mt-4 font-medium max-w-xl border-l-4 border-brand-yellow/30 pl-4">
                        Gerencie propostas de desafios ou analise sugestões de melhoria enviadas pelos pesquisadores.
                    </p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-4 bg-brand-yellow text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-yellow/10 flex items-center gap-3 self-start md:self-auto"
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Novo Desafio
                </button>
            </header>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
                <button 
                    onClick={() => setActiveSection('arena')}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                        activeSection === 'arena' 
                        ? 'bg-brand-yellow text-black' 
                        : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                    <Trophy size={16} />
                    Sugestões de Desafios
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeSection === 'arena' ? 'bg-black/20' : 'bg-white/5'}`}>
                        {suggestions.length}
                    </span>
                </button>
                <button 
                    onClick={() => setActiveSection('hub')}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                        activeSection === 'hub' 
                        ? 'bg-brand-yellow text-black' 
                        : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                >
                    <Lightbulb size={16} />
                    Melhorias do HUB
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeSection === 'hub' ? 'bg-black/20' : 'bg-white/5'}`}>
                        {feedbacks.length}
                    </span>
                </button>
            </div>

            {/* Content Filters & Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                    <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 focus-within:border-brand-yellow/50 transition-all shadow-2xl">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-brand-yellow transition-colors z-10" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-[#1E1E1E] text-white outline-none font-mono text-xs placeholder:text-white/20 tracking-wider transition-all"
                        />
                    </div>
                </div>

                {activeSection === 'arena' && (
                    <div className="flex gap-2 p-1.5 bg-[#1E1E1E] rounded-2xl border border-white/5 shadow-2xl overflow-hidden shrink-0">
                        {(['pending', 'approved', 'rejected'] as const).map((f) => ( 
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                                    filter === f 
                                        ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20' 
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {f === 'pending' ? 'Pendentes' : f === 'approved' ? 'Aprovados' : 'Recusados'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="w-16 h-16 animate-spin text-brand-yellow" />
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.5em] mt-8 text-white animate-pulse">Consultando Redes Neuronais...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 pb-20">
                    {activeSection === 'arena' ? (
                        filteredSuggestions.length === 0 ? (
                            <EmptyState icon={Inbox} message="Nenhuma sugestão encontrada nesta categoria." />
                        ) : (
                            filteredSuggestions.map((suggestion: Suggestion) => (
                                <SuggestionCard 
                                    key={suggestion.id} 
                                    suggestion={suggestion} 
                                    onAction={handleAction} 
                                />
                            ))
                        )
                    ) : (
                        filteredFeedbacks.length === 0 ? (
                            <EmptyState icon={Sparkles} message="Nenhuma sugestão de melhoria encontrada." />
                        ) : (
                            filteredFeedbacks.map((feedback: Feedback) => (
                                <FeedbackCard key={feedback.id} feedback={feedback} />
                            ))
                        )
                    )}
                </div>
            )}

            {/* Create Challenge Modal */}
            {isCreateModalOpen && (
                <CreateModal 
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateChallenge}
                    title={newTitle}
                    setTitle={setNewTitle}
                    desc={newDesc}
                    setDesc={setNewDesc}
                    loading={isCreating}
                />
            )}
        </div>
    );
}

// Sub-components for cleaner code
function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 bg-[#1E1E1E]/50 rounded-[4rem] border-2 border-dashed border-white/5">
            <Icon className="w-16 h-16 text-gray-700 mb-6" />
            <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] italic">Nada por aqui.</p>
            <p className="text-gray-500 text-xs mt-2 font-medium">{message}</p>
        </div>
    );
}

function SuggestionCard({ suggestion, onAction }: { suggestion: Suggestion, onAction: any }) {
    return (
        <div className="group glass-card p-8 rounded-[3rem] border border-white/5 hover:border-brand-yellow/40 transition-all flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="shrink-0 relative">
                <Avatar 
                    src={suggestion.researcher?.avatar_url} 
                    name={suggestion.researcher?.username || suggestion.researcher?.full_name} 
                    size="lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-brand-yellow text-black p-1.5 rounded-lg border-4 border-[#121212] shadow-xl">
                    <Trophy size={14} />
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest ${
                        suggestion.status === 'pending' ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20' : 
                        suggestion.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                        {suggestion.status}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(suggestion.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{suggestion.title}</h3>
                    <p className="text-[10px] text-brand-yellow uppercase font-black tracking-widest mt-1">
                        Por {suggestion.researcher?.full_name} (@{suggestion.researcher?.username})
                    </p>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-white/10 pl-4 group-hover:border-brand-yellow/30 transition-colors">
                    {suggestion.description}
                </p>
            </div>

            <div className="flex flex-row md:flex-col gap-3">
                {suggestion.status === 'pending' ? (
                    <>
                        <button 
                            onClick={() => onAction(suggestion.id, 'approved')}
                            className="p-4 bg-white hover:bg-brand-yellow text-black rounded-2xl transition-all shadow-xl hover:scale-110"
                            title="Aprovar"
                        >
                            <Check size={20} strokeWidth={3} />
                        </button>
                        <button 
                            onClick={() => onAction(suggestion.id, 'rejected')}
                            className="p-4 bg-white/5 hover:bg-red-500 border border-white/10 hover:border-red-500 text-gray-400 hover:text-white rounded-2xl transition-all hover:scale-110"
                            title="Recusar"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => onAction(suggestion.id, 'pending')}
                        className="px-6 py-4 bg-white/5 text-gray-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 transition-all"
                    >
                        Reverter
                    </button>
                )}
            </div>
        </div>
    );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
    return (
        <div className="group glass-card p-8 rounded-[3rem] border border-white/5 hover:border-brand-yellow/40 transition-all flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="shrink-0 relative">
                <Avatar 
                    src={feedback.user?.avatar_url} 
                    name={feedback.user?.username || feedback.user?.full_name} 
                    size="lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-brand-yellow text-black p-1.5 rounded-lg border-4 border-[#121212] shadow-xl">
                    <Lightbulb size={14} />
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-[9px] font-black uppercase rounded-lg tracking-widest border border-brand-yellow/20">
                        Melhoria HUB
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(feedback.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                </div>
                
                <h3 className="text-xl font-bold text-white uppercase tracking-tight line-clamp-2">
                    {feedback.description}
                </h3>

                <p className="text-[10px] text-brand-yellow uppercase font-black tracking-widest mt-1">
                    Por {feedback.user?.full_name || 'Usuário'} (@{feedback.user?.username || 'user'})
                </p>
            </div>

            <div className="flex flex-row md:flex-col gap-3">
                <a 
                    href="/admin/reports" 
                    className="px-6 py-4 bg-white/5 text-gray-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                >
                    Ver na Central
                    <AlertCircle size={14} />
                </a>
            </div>
        </div>
    );
}

function CreateModal({ onClose, onSave, title, setTitle, desc, setDesc, loading }: any) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-xl rounded-[40px] border border-white/10 p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                            <Plus className="text-black w-6 h-6" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white uppercase italic">Novo Desafio</h2>
                            <p className="text-xs text-brand-yellow font-black uppercase tracking-widest">Publicar na Arena</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Título do Desafio</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Maratona de Física Quântica"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-all font-bold tracking-tight"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Descrição Completa</label>
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Descreva as regras, objetivos e premiação do desafio..."
                            className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-sm text-gray-300 focus:outline-none focus:border-brand-yellow/50 transition-all resize-none"
                        />
                    </div>

                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="w-full py-5 bg-brand-yellow text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-yellow/10"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy size={18} />}
                        Criar Desafio Agora
                    </button>
                </div>
            </div>
        </div>
    );
}
