'use client';

import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    X,
    Camera,
    Send,
    MessageSquare,
    MessageCircle,
    Mail,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';
import { toast } from 'react-hot-toast';
import { useNavigationStore } from '@/store/useNavigationStore';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
    const { reportType } = useNavigationStore();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [type, setType] = useState('bug');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync initial type when opening
    React.useEffect(() => {
        if (isOpen) {
            setStep('form');
            setDescription('');
            setType(reportType);
            setScreenshot(null);
            setPreviewUrl(null);
        }
    }, [isOpen, reportType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshot(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            toast.error('Por favor, descreva o ocorrido.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('type', type);
        formData.append('description', description);
        if (screenshot) formData.append('screenshot', screenshot);
        formData.append('user_agent', navigator.userAgent);
        formData.append('url', window.location.href);

        try {
            const result = await submitFeedback(formData);
            if (result.success) {
                setStep('success');
                toast.success('Report enviado com sucesso!');
            } else {
                toast.error('Erro ao enviar report. Tente novamente.');
            }
        } catch (error) {
            toast.error('Erro de conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <m.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#1E1E1E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        {step === 'form' ? (
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                                            <AlertCircle className="text-brand-red size-6" />
                                        </div>
                                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Reportar Pulsação</h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Type Selector */}
                                    <div className="flex gap-2">
                                        {['bug', 'sugestao', 'outro'].map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t
                                                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {t === 'bug' ? 'Falha' : t === 'sugestao' ? 'Sugestão' : 'Outro'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 px-1">O QUE HOUVE?</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Descreva o problema ou sugestão aqui..."
                                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-red/50 transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Screenshot Upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-white/5 transition-all"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg" />
                                        ) : (
                                            <>
                                                <Camera className="text-gray-600 group-hover:text-brand-red transition-colors mb-2" />
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Anexar Captura</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    <div className="flex gap-4 items-center py-4 border-t border-white/5">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">OU MANDE DIRETO:</span>
                                        <div className="flex gap-4">
                                            <a href="https://wa.me/5511968401823" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:scale-110 transition-transform">
                                                <MessageCircle size={20} />
                                            </a>
                                            <a href="mailto:contato@labdiv.com" className="text-brand-blue hover:scale-110 transition-transform">
                                                <Mail size={20} />
                                            </a>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                LANÇAR REPORT
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="size-20 bg-brand-yellow/10 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle2 className="text-brand-yellow size-10" />
                                </div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Pulsação Recebida!</h2>
                                <p className="text-gray-400 font-medium mb-12">Nossa equipe de manutenção já foi notificada sobre esta anomalia.</p>
                                <button
                                    onClick={onClose}
                                    className="w-full h-14 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    FECHAR HUB DE EMERGÊNCIA
                                </button>
                            </div>
                        )}
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
