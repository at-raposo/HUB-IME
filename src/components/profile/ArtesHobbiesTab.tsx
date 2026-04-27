'use client';

import { useState } from 'react';
import { Profile, HobbyCard } from '@/types';
import { updateProfile } from '@/app/actions/profiles';
import { toast } from 'react-hot-toast';
import { Plus, X, Image as ImageIcon, Video, FileText, Link as LinkIcon, Edit2, Trash2, Check, ExternalLink } from 'lucide-react';
import { parseMediaUrl, getYoutubeThumbnail } from '@/lib/media-utils';

interface ArtesHobbiesTabProps {
    profile: Profile;
    isOwner: boolean;
}

export function ArtesHobbiesTab({ profile, isOwner }: ArtesHobbiesTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Merge approved gallery with pending edits to show what the user is currently editing
    const currentGallery: HobbyCard[] = (isOwner && profile.pending_edits?.hobbies_gallery) 
        ? profile.pending_edits.hobbies_gallery 
        : (profile.hobbies_gallery || []);

    const [gallery, setGallery] = useState<HobbyCard[]>(currentGallery);
    const [newItem, setNewItem] = useState<{ type: HobbyCard['type']; url: string; title: string; description: string } | null>(null);

    const hasPendingEdits = isOwner && profile.pending_edits?.hobbies_gallery !== undefined;

    const handleSave = async () => {
        setIsSubmitting(true);
        const res = await updateProfile({ hobbies_gallery: gallery });
        if (res.success) {
            toast.success('Galeria atualizada! Aguardando aprovação.');
            setIsEditing(false);
        } else {
            toast.error(res.error || 'Erro ao salvar a galeria.');
        }
        setIsSubmitting(false);
    };

    const handleAddItem = () => {
        if (!newItem) return;
        if (!newItem.title.trim() || (!newItem.url.trim() && newItem.type !== 'text')) {
            toast.error('Preencha os campos obrigatórios (Título e Link/Mídia).');
            return;
        }

        const newCard: HobbyCard = {
            id: Math.random().toString(36).substring(7),
            ...newItem
        };

        setGallery(prev => [...prev, newCard]);
        setNewItem(null);
    };

    const handleRemoveItem = (id: string) => {
        setGallery(prev => prev.filter(item => item.id !== id));
    };

    const renderCardPreview = (item: HobbyCard) => {
        if (item.type === 'photo') {
            return (
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden relative">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                </div>
            );
        } else if (item.type === 'video') {
            const thumbUrl = getYoutubeThumbnail(item.url) || item.url;
            return (
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden relative group flex items-center justify-center">
                    <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                            <Video className="w-6 h-6 text-white fill-current" />
                        </div>
                    </div>
                </div>
            );
        } else if (item.type === 'link') {
            return (
                <div className="w-full h-32 bg-brand-blue/5 dark:bg-brand-blue/10 flex flex-col items-center justify-center p-4 rounded-t-xl text-center">
                    <LinkIcon className="w-12 h-12 text-brand-blue/50 mb-2" />
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-brand-blue uppercase tracking-widest leading-tight hover:underline flex items-center gap-1">
                        Acessar Link <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            );
        } else {
            return (
                <div className="w-full h-32 bg-brand-yellow/5 dark:bg-brand-yellow/10 flex flex-col items-center justify-center p-4 rounded-t-xl text-center">
                    <FileText className="w-12 h-12 text-brand-yellow/50 mb-2" />
                    <span className="text-[10px] font-medium text-brand-yellow/80 leading-tight px-4 line-clamp-3 italic">"{item.description}"</span>
                </div>
            );
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'photo': return 'Fotografia / Arte Visual';
            case 'video': return 'Vídeo';
            case 'music': return 'Música';
            case 'text': return 'Texto / Poema';
            case 'link': return 'Link Externo';
            default: return 'Outro';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'photo': return <ImageIcon className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'text': return <FileText className="w-4 h-4" />;
            case 'link': return <LinkIcon className="w-4 h-4" />;
            default: return <ImageIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {hasPendingEdits && !isEditing && (
                <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-brand-yellow" />
                        </div>
                        <div>
                            <h4 className="text-[12px] font-black text-brand-yellow uppercase tracking-widest">Edição Pendente</h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Sua galeria está aguardando aprovação dos administradores.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Minhas <span className="text-brand-blue">Artes & Hobbies</span>
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Mostre seu lado criativo fora do laboratório.</p>
                </div>

                {isOwner && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Edit2 className="w-3 h-3" />
                        Editar Galeria
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-6">
                    {/* Lista de Edição */}
                    <div className="space-y-4">
                        {gallery.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                    {getTypeIcon(item.type)}
                                </div>
                                <div className="flex-1 w-full text-center sm:text-left truncate">
                                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{getTypeLabel(item.type)}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-3 text-brand-red/70 hover:text-brand-red bg-brand-red/5 hover:bg-brand-red/10 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Formulário de Adição */}
                    {gallery.length < 3 && (
                        <div className="p-6 bg-white/5 border border-white/10 border-dashed rounded-[32px] space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Adicionar Nova Arte/Hobby ({gallery.length}/3)</h4>
                                {newItem && (
                                    <button onClick={() => setNewItem(null)} className="text-gray-500 hover:text-white text-[10px] font-bold uppercase transition-colors">Cancelar Adição</button>
                                )}
                            </div>

                            {!newItem ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { type: 'photo', icon: <ImageIcon className="w-5 h-5" />, label: 'Foto / Arte' },
                                        { type: 'video', icon: <Video className="w-5 h-5" />, label: 'Vídeo' },
                                        { type: 'link', icon: <LinkIcon className="w-5 h-5" />, label: 'Link' },
                                        { type: 'text', icon: <FileText className="w-5 h-5" />, label: 'Texto / Poema' }
                                    ].map(t => (
                                        <button
                                            key={t.type}
                                            onClick={() => setNewItem({ type: t.type as any, url: '', title: '', description: '' })}
                                            className="p-4 bg-white/5 hover:bg-brand-blue/10 border border-white/5 hover:border-brand-blue/30 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
                                        >
                                            <div className="text-gray-400 group-hover:text-brand-blue transition-colors">
                                                {t.icon}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-brand-blue uppercase tracking-widest">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue shrink-0">
                                            {getTypeIcon(newItem.type)}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Título da Arte ou Hobby"
                                                value={newItem.title}
                                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                                            />
                                            {newItem.type !== 'text' && (
                                                <input
                                                    type="url"
                                                    placeholder={newItem.type === 'photo' ? "URL da Imagem (Ex: upload do imgur, cloudinary)" : newItem.type === 'video' ? "URL do Vídeo (YouTube, Vimeo)" : "URL do Link"}
                                                    value={newItem.url}
                                                    onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                                                />
                                            )}
                                            <textarea
                                                placeholder="Descrição (Opcional)"
                                                value={newItem.description}
                                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                                rows={newItem.type === 'text' ? 4 : 2}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue resize-none"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleAddItem}
                                                    className="px-6 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-brand-blue/20"
                                                >
                                                    <Plus className="w-4 h-4" /> Adicionar à Galeria
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                        <button
                            onClick={() => {
                                setGallery(currentGallery);
                                setIsEditing(false);
                            }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-green/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Enviando...' : 'Salvar e Solicitar Aprovação'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentGallery.length > 0 ? (
                        currentGallery.map(item => (
                            <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden hover:border-white/20 transition-colors">
                                {renderCardPreview(item)}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-brand-blue shrink-0">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                    </div>
                                    {item.type !== 'text' && item.description && (
                                        <p className="text-xs text-gray-400 line-clamp-2 mt-auto">{item.description}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-3xl border-dashed">
                            <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs text-center px-6">
                                Nenhuma arte ou hobby adicionado.<br/>Mostre seu lado criativo!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
