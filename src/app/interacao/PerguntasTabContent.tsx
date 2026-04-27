'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Send, X, FlaskConical, HelpCircle } from 'lucide-react'; 
import { toast } from 'react-hot-toast';

interface Pergunta {
    id: string;
    nome: string;
    pergunta: string;
    resposta: string;
    respondido_por: string;
    created_at: string;
}

export function PerguntasTabContent() {
    const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [perguntaText, setPerguntaText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        async function fetchPerguntas() {
            const { data, error } = await supabase
                .from('perguntas')
                .select('id, nome, pergunta, resposta, respondido_por, created_at')
                .eq('status', 'respondida')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching perguntas:', error);
            } else {
                setPerguntas(data || []);
            }
            setIsLoading(false);
        }
        fetchPerguntas();
    }, []);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        if (!nome.trim() || !email.trim() || !perguntaText.trim()) {
            setSubmitError('Preencha todos os campos obrigatórios.');
            setIsSubmitting(false);
            return;
        }

        const { error } = await supabase.from('perguntas').insert([{
            nome: nome.trim(),
            email: email.trim(),
            pergunta: perguntaText.trim(),
            status: 'pendente',
        }]);

        if (error) {
            setSubmitError('Erro ao enviar pergunta. Tente novamente.');
            console.error(error);
        } else {
            // Send notification
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'question',
                    userName: nome.trim(),
                    question: perguntaText.trim()
                })
            }).catch(() => { });

            setSubmitSuccess(true);
            setNome('');
            setEmail('');
            setPerguntaText('');
            setTimeout(() => {
                setShowModal(false);
                setSubmitSuccess(false);
            }, 2500);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="max-w-xl">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Pergunte a um <span className="text-brand-blue">Cientista</span></h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tem uma dúvida sobre ciência? Envie sua pergunta e nossos pesquisadores do IME USP responderão!</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Enviar Pergunta
                </button>
            </div>

            {/* Q&A Feed */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
                    <p className="text-[10px] uppercase font-black tracking-widest">Acessando banco de dados científico...</p>
                </div>
            ) : perguntas.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                    <p className="text-xs uppercase font-black tracking-widest italic">Nenhuma pergunta respondida ainda.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {perguntas.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 rounded-3xl overflow-hidden transition-all group shadow-sm dark:shadow-none">
                            {/* Question Container */}
                            <div className="p-8 pb-4">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-xs">
                                        {p.nome.substring(0, 2)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{p.nome}</span>
                                            <span className="text-[9px] text-gray-600 font-bold uppercase">perguntou</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium italic">"{p.pergunta}"</p>
                                    </div>
                                </div>
                            </div>
                            {/* Answer Container */}
                            <div className="bg-brand-blue/5 p-8 border-t border-gray-200 dark:border-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                                        <span className="material-symbols-outlined text-xl">science</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">{p.respondido_por || 'Cientista IME USP'}</span>
                                            <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow rounded-full text-[8px] font-black uppercase tracking-widest">Resposta</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{p.resposta}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => !isSubmitting && setShowModal(false)}>
                    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-[32px] w-full max-w-lg p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-blue flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">quiz</span> Enviar Pergunta
                            </h2>
                            <button onClick={() => !isSubmitting && setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X className="size-5" /></button>
                        </div>

                        {submitSuccess ? (
                            <div className="text-center py-10">
                                <span className="material-symbols-outlined text-4xl text-green-500 mb-4 block">check_circle</span>
                                <h3 className="text-xs font-black uppercase text-white tracking-widest">Pergunta Enviada! 🎉</h3>
                                <p className="text-[10px] text-gray-500 mt-2 uppercase">Assim que um cientista responder, ela aparecerá aqui.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submitError && <p className="text-[10px] text-red-500 font-black uppercase bg-red-500/10 p-2 rounded-lg">{submitError}</p>}
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Seu Nome</label>
                                    <input value={nome} onChange={e => setNome(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-blue/50 transition-all font-bold" placeholder="Digite seu nome..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">E-mail</label>
                                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-blue/50 transition-all font-bold" placeholder="seu@email.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Sua Pergunta</label>
                                    <textarea value={perguntaText} onChange={e => setPerguntaText(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-blue/50 transition-all font-bold resize-none" placeholder="Qual sua dúvida científica?" />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'TRANSFERINDO DADOS...' : 'LANÇAR PERGUNTA'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
