'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PostDTO, mapToPostDTO } from '@/dtos/media';
import { toast } from 'react-hot-toast';
import { MediaCard } from '@/components/MediaCard';
import { 
    Mic, RefreshCw, AlertCircle, 
    Loader2, Search, Check, 
    Clock, Type, Bookmark
} from 'lucide-react';

interface CarouselSectionProps {
    title: string;
    items: PostDTO[];
    onAction: (id: string, description: string) => void;
    icon: React.ReactNode;
}

function CarouselSection({ title, items, onAction, icon }: CarouselSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-brand-blue/10 rounded-lg text-brand-blue">
                    {icon}
                </div>
                <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter">
                    {title} <span className="text-brand-blue/40 ml-1">({items.length})</span>
                </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar scroll-smooth -mx-2 px-2">
                {items.length === 0 ? (
                    <div className="min-w-full py-12 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-gray-500">
                        <Bookmark className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">Nenhum item encontrado</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="min-w-[320px] max-w-[320px] bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-col gap-4 group hover:shadow-xl hover:scale-[1.01] transition-all">
                            <div className="relative rounded-2xl overflow-hidden aspect-video">
                                <MediaCard post={item} />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-blue/60 flex items-center gap-1.5">
                                        <Type className="w-3 h-3" /> Descritivo TTS
                                    </label>
                                    <span className="text-[9px] font-medium text-gray-400">Salva ao sair</span>
                                </div>
                                
                                <textarea
                                    className="w-full text-xs p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all resize-none h-32 leading-relaxed"
                                    defaultValue={item.description}
                                    onBlur={(e) => onAction(item.id, e.target.value)}
                                    placeholder="Descreva a obra com detalhes para acessibilidade..."
                                />
                                
                                <div className="flex items-center gap-2 pt-1">
                                    {item.description && item.description.length >= 10 ? (
                                        <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Regularizado
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-brand-yellow/10 text-brand-yellow text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Requer Texto
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export function NarrationManager() {
    const [submissions, setSubmissions] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .order('created_at', { ascending: false });
            
        setSubmissions((data || []).map(s => mapToPostDTO(s)));
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleUpdateDescription = async (id: string, description: string) => {
        // Only update if changed
        const original = submissions.find(s => s.id === id);
        if (original?.description === description) return;

        const { error } = await supabase
            .from('submissions')
            .update({ description })
            .eq('id', id);

        if (error) {
            toast.error('Erro ao atualizar descrição');
        } else {
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, description } : s));
            toast.success('Descrição atualizada!');
        }
    };

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => 
            s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.authors || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [submissions, searchTerm]);

    const pendentes = useMemo(() => filteredSubmissions.filter(s => !s.description || s.description.trim().length < 10), [filteredSubmissions]);
    const regularizadas = useMemo(() => filteredSubmissions.filter(s => s.description && s.description.trim().length >= 10), [filteredSubmissions]);

    return (
        <div className="space-y-10">
            {/* Busca */}
            <div className="relative group max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue w-5 h-5 transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar por título ou autor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-sm shadow-sm text-gray-900 dark:text-white"
                />
            </div>

            {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-card-dark/5 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando Biblioteca...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <CarouselSection 
                        title="Pendentes / Curtas" 
                        items={pendentes} 
                        onAction={handleUpdateDescription}
                        icon={<Clock className="w-5 h-5" />}
                    />
                    <CarouselSection 
                        title="Acervo Regularizado" 
                        items={regularizadas} 
                        onAction={handleUpdateDescription}
                        icon={<Check className="w-5 h-5" />}
                    />
                </div>
            )}
        </div>
    );
}
