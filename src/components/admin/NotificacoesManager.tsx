'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
    Send, 
    Users, 
    User, 
    Globe, 
    Clock, 
    History, 
    Search, 
    CheckCircle2, 
    AlertCircle,
    ChevronDown,
    Trash2,
    Calendar,
    Link as LinkIcon,
    Settings
} from 'lucide-react';
import { 
    sendAdminNotificationAction, 
    fetchAdminNotificationHistory, 
    searchUsersForNotification 
} from '@/app/actions/admin-notifications';
import { toast } from 'react-hot-toast';

interface HistoryItem {
    id: string;
    title: string;
    message: string;
    target_type: string;
    target_value: string | null;
    recipients_count: number;
    status: string;
    created_at: string;
    scheduled_at: string | null;
    sent_at: string | null;
    link: string | null;
    sender: {
        full_name: string;
        username: string;
    };
}

export default function NotificacoesManager() {
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showOnlyAutomatic, setShowOnlyAutomatic] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        link: '',
        targetType: 'broadcast' as 'broadcast' | 'user' | 'group',
        targetValue: '',
        isScheduled: false,
        scheduledAt: '',
    });

    // Load History
    const loadHistory = async () => {
        const data = await fetchAdminNotificationHistory();
        setHistory(data as any);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // User Search Logic
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (formData.targetType === 'user' && searchQuery.trim().length >= 1) {
                setIsSearching(true);
                const results = await searchUsersForNotification(searchQuery.trim());
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, formData.targetType]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.message) {
            toast.error('Preencha título e mensagem');
            return;
        }

        if (formData.targetType === 'user' && !formData.targetValue) {
            toast.error('Selecione um usuário');
            return;
        }

        if (formData.targetType === 'group' && !formData.targetValue) {
            toast.error('Selecione um grupo');
            return;
        }

        if (formData.isScheduled && !formData.scheduledAt) {
            toast.error('Selecione a data/hora do agendamento');
            return;
        }

        setIsLoading(true);
        try {
            const res = await sendAdminNotificationAction({
                ...formData,
                scheduledAt: formData.isScheduled ? formData.scheduledAt : undefined,
            });

            if (res.success) {
                toast.success(res.scheduled ? 'Notificação agendada!' : `Notificação enviada para ${res.count} usuários!`);
                // Reset Form
                setFormData({
                    title: '',
                    message: '',
                    link: '',
                    targetType: 'broadcast',
                    targetValue: '',
                    isScheduled: false,
                    scheduledAt: '',
                });
                setSearchQuery('');
                loadHistory();
            } else {
                toast.error(res.error || 'Erro ao enviar');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredHistory = showOnlyAutomatic ? history.filter(h => h.target_type === 'automatic') : history;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2 bg-brand-blue/20 rounded-xl">
                        <Send className="w-6 h-6 text-brand-blue" />
                    </div>
                    Central de Notificações
                </h2>
                <p className="text-gray-500 text-sm font-medium">Gerencie comunicados e alertas para a comunidade Lab-Div.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-7 space-y-6">
                    <form onSubmit={handleSend} className="bg-neutral-900/50 border border-white/5 rounded-[32px] p-8 space-y-6 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="space-y-4">
                            {/* Target Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'broadcast', label: 'Broadcast', icon: Globe, desc: 'Todos' },
                                    { id: 'group', label: 'Por Grupo', icon: Users, desc: 'Categorias' },
                                    { id: 'user', label: 'Individual', icon: User, desc: 'Um perfil' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, targetType: type.id as any, targetValue: '' })}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center group ${
                                            formData.targetType === type.id 
                                            ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                    >
                                        <type.icon className={`w-5 h-5 ${formData.targetType === type.id 
                                            ? 'text-white' 
                                            : 'text-gray-500 group-hover:text-gray-300'}`} />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
                                            <span className="text-[10px] opacity-60 font-bold leading-none mt-0.5">{type.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Specific Target Inputs */}
                            <AnimatePresence mode="wait">
                                {formData.targetType === 'group' && (
                                    <m.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block px-1">Selecionar Grupo</label>
                                        <select 
                                            value={formData.targetValue}
                                            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        >
                                            <option value="" disabled className="bg-neutral-900">Escolha um grupo...</option>
                                            <option value="aluno_usp" className="bg-neutral-900">Alunos USP</option>
                                            <option value="pesquisador" className="bg-neutral-900">Pesquisadores</option>
                                            <option value="curioso" className="bg-neutral-900">Curiosos (Externos)</option>
                                        </select>
                                    </m.div>
                                )}

                                {formData.targetType === 'user' && (
                                    <m.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 relative"
                                    >
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block px-1">Buscar Usuário</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                type="text" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Digite nome ou pseudônimo..."
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                            />
                                        </div>

                                        {/* Search Dropdown */}
                                        <AnimatePresence>
                                            {(searchResults.length > 0 || isSearching) && (
                                                <m.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 left-0 right-0 mt-2 bg-[#1E1E1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                                                >
                                                    {isSearching ? (
                                                        <div className="p-4 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">Buscando...</div>
                                                    ) : (
                                                        searchResults.map(u => (
                                                            <button
                                                                key={u.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, targetValue: u.id });
                                                                    setSearchQuery(`${u.full_name} (@${u.username})`);
                                                                    setSearchResults([]);
                                                                }}
                                                                className="w-full p-4 hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0 text-left group"
                                                            >
                                                                <div>
                                                                    <p className="text-sm font-bold text-white group-hover:text-brand-blue transition-colors">{u.full_name}</p>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-none mt-1">@{u.username} • {u.user_category}</p>
                                                                </div>
                                                                {formData.targetValue === u.id && <CheckCircle2 className="w-4 h-4 text-brand-blue" />}
                                                            </button>
                                                        ))
                                                    )}
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </m.div>
                                )}
                            </AnimatePresence>

                            {/* Main Content Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block px-1">Título da Notificação</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Novo material disponível!"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block px-1">Mensagem (Corpo)</label>
                                    <textarea 
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Descreva o conteúdo da notificação..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block px-1 flex items-center gap-1.5">
                                        <LinkIcon className="w-3 h-3" /> Link de Redirecionamento (Opcional)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            {/* Scheduling */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-brand-blue" />
                                        <span className="text-xs font-black uppercase tracking-widest text-white">Agendar Envio</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isScheduled: !formData.isScheduled })}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${formData.isScheduled ? 'bg-brand-blue' : 'bg-gray-700'}`}
                                    >
                                        <div className={`size-4 bg-white rounded-full transition-all shadow-sm ${formData.isScheduled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {formData.isScheduled && (
                                    <m.div 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="pt-2 border-t border-white/5"
                                    >
                                        <input 
                                            type="datetime-local" 
                                            value={formData.scheduledAt}
                                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-1 focus:ring-brand-blue text-sm"
                                        />
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 px-1">A notificação será processada assim que o horário chegar.</p>
                                    </m.div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-brand-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-[20px] shadow-xl shadow-brand-blue/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{formData.isScheduled ? 'Agendar Comunicado' : 'Disparar Notificação'}</span>
                                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-neutral-900/50 border border-white/5 rounded-[32px] p-6 backdrop-blur-xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Histórico Recente
                                </h3>
                                <button
                                    onClick={() => setShowOnlyAutomatic(!showOnlyAutomatic)}
                                    className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                        showOnlyAutomatic 
                                        ? 'bg-brand-yellow text-gray-900 border border-brand-yellow/50 shadow-md shadow-brand-yellow/10' 
                                        : 'bg-white/5 text-brand-yellow/60 border border-white/10 hover:bg-white/10 hover:text-brand-yellow'
                                    }`}
                                    title="Filtrar por automáticas"
                                >
                                    <Settings className={`w-3 h-3 ${showOnlyAutomatic ? 'animate-spin-slow' : ''}`} />
                                    Automáticas
                                </button>
                            </div>
                            <button onClick={loadHistory} className="text-[10px] font-bold text-brand-blue hover:underline">Atualizar</button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar max-h-[600px]">
                            {filteredHistory.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl">
                                        <AlertCircle className="w-8 h-8 text-gray-700 mb-2" />
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Nenhum envio registrado</p>
                                    </div>
                                ) : (
                                    filteredHistory.map((item) => (
                                    <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 relative group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-white truncate">{item.title}</p>
                                                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.message}</p>
                                            </div>
                                            <div className={`shrink-0 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                item.target_type === 'automatic' ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20' :
                                                item.status === 'sent' ? 'bg-green-500/10 text-green-500' : 
                                                item.status === 'scheduled' ? 'bg-brand-blue/10 text-brand-blue' : 
                                                'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {item.target_type === 'automatic' ? 'Auto-Trigger' : item.status === 'sent' ? 'Enviado' : item.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-3 bg-brand-blue rounded-full" />
                                                <span className="text-[10px] text-white font-bold">{item.recipients_count}</span>
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Recipientes</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3 h-3 text-gray-500" />
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {item.target_type === 'broadcast' ? 'Broadcast' : 
                                                     item.target_type === 'group' ? `${item.target_value}` : 
                                                     item.target_type === 'automatic' ? 'Sistema / Automática' :
                                                     'Personalizado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-gray-500" />
                                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                    {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {item.link && (
                                                <a 
                                                    href={item.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue/20 transition-all ml-auto"
                                                >
                                                    <LinkIcon className="w-2.5 h-2.5" />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">LINK</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Tip */}
                        <div className="mt-6 p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-wider leading-relaxed">
                                <span className="underline pr-1">DICA:</span> Use o campo link para levar os usuários diretamente para uma disciplina ou publicação específica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
