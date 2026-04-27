'use client';

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { fetchParticlePreview, sendMessage, fetchMessages, getCurrentUserId } from '@/app/actions/submissions';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ParticleReference {
    id: string;
    type: 'article' | 'particle';
    title: string;
    author: string;
    energy: number;
}

interface ParticleEntanglementProps {
    recipientId?: string;
}

export const ParticleEntanglement = ({ recipientId }: ParticleEntanglementProps) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [attachment, setAttachment] = useState<ParticleReference | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchUser = async () => {
            const id = await getCurrentUserId();
            setCurrentUserId(id);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (recipientId && currentUserId) {
            const loadMessages = async () => {
                setIsLoading(true);
                const data = await fetchMessages(recipientId);
                setMessages(data);
                setIsLoading(false);
            };
            loadMessages();

            // Realtime setup
            const channel = supabase
                .channel(`chat:${recipientId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                }, (payload) => {
                    const newMessage = payload.new;
                    // Strict filter: belongs to this specific pair of users
                    const isRelevant =
                        (newMessage.sender_id === recipientId && newMessage.recipient_id === currentUserId) ||
                        (newMessage.sender_id === currentUserId && newMessage.recipient_id === recipientId);

                    if (isRelevant) {
                        setMessages((prev) => {
                            if (prev.find(m => m.id === newMessage.id)) return prev;
                            return [...prev, newMessage];
                        });
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [recipientId, currentUserId]);

    const handleAttach = async (id: string, type: 'article' | 'particle' = 'particle') => {
        const preview = await fetchParticlePreview(id);
        if (preview) {
            setAttachment({
                id,
                type,
                title: preview.title,
                author: preview.author,
                energy: preview.energy
            });
            setIsSelectorOpen(false);
        } else {
            toast.error('Partícula não encontrada no Colisor.');
        }
    };

    const handleSend = async () => {
        if (!recipientId || !message.trim()) return;

        setIsSending(true);
        const currentMessage = message;
        const currentAttachment = attachment;

        setMessage('');
        setAttachment(null);

        const res = await sendMessage(recipientId, currentMessage, currentAttachment?.id);

        if (!res.success) {
            toast.error(res.error || "Falha na conexão neural.");
            setMessage(currentMessage);
            setAttachment(currentAttachment);
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Emaranhamento</h3>
                <span className="material-symbols-outlined text-brand-blue text-sm">hub</span>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                        const isMine = msg.sender_id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`p-3 rounded-2xl max-w-[85%] text-xs border ${isMine
                                    ? 'bg-brand-blue/20 border-brand-blue/30 text-white rounded-tr-none'
                                    : 'bg-white/5 border-white/5 text-gray-300 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                    {msg.attachment_id && (
                                        <a
                                            href={`/arquivo/${msg.attachment_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-2 p-2 bg-black/20 rounded-lg flex items-center gap-2 border border-white/5 hover:bg-brand-blue/20 hover:border-brand-blue/30 transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[10px] text-brand-blue">link</span>
                                            <span className="text-[10px] font-bold uppercase truncate">Artigo Anexado</span>
                                        </a>
                                    )}
                                </div>
                                <span className="text-[8px] text-gray-600 mt-1 uppercase font-bold tracking-widest">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                        <span className="material-symbols-outlined text-3xl mb-2">bubble_chart</span>
                        <p className="text-[10px] uppercase font-black tracking-widest">Inicie o emaranhamento de ideias</p>
                    </div>
                )}
            </div>

            {/* Attachment Preview */}
            <AnimatePresence>
                {attachment && (
                    <m.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        className="px-4 py-2"
                    >
                        <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-1">
                                <button onClick={() => setAttachment(null)} className="material-symbols-outlined text-xs text-brand-blue/50 hover:text-brand-blue transition-colors">close</button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                    <span className="material-symbols-outlined text-xl">
                                        {attachment.type === 'article' ? 'hub' : 'grain'}
                                    </span>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[11px] font-black text-white uppercase truncate">
                                        {attachment.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">Autor: {attachment.author}</span>
                                        <div className="flex items-center gap-1 bg-brand-blue/20 px-1.5 py-0.5 rounded-full">
                                            <div className="w-1 h-1 rounded-full bg-brand-blue animate-pulse"></div>
                                            <span className="text-[8px] font-black text-brand-blue uppercase">{attachment.energy} EXCITAÇÃO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-black/20">
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        title="[🔗 Anexar Partícula] - Referenciar conteúdo técnico"
                    >
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">link</span>
                    </button>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mensagem emaranhada..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs outline-none focus:border-brand-blue/30 transition-all resize-none max-h-24 h-10"
                    />

                    <button
                        onClick={handleSend}
                        disabled={(!message.trim() && !attachment) || isSending}
                        className="p-2 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50 min-w-[40px] flex items-center justify-center"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        )}
                    </button>
                </div>

                <p className="mt-2 text-[9px] text-gray-500 uppercase font-black tracking-widest text-center">
                    (Use o ícone de elo para anexar um artigo técnico)
                </p>
            </div>

            {/* Attachment Selector */}
            <AnimatePresence>
                {isSelectorOpen && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-24 left-4 right-4 bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Selecionar Recurso</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleAttach('1')}
                                className="w-full text-left p-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10"
                            >
                                🔬 Grande Colisor: Artigo Exemplo
                            </button>
                            <button
                                onClick={() => handleAttach('2')}
                                className="w-full text-left p-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10"
                            >
                                🌌 Fluxo: Partícula Exemplo
                            </button>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};
