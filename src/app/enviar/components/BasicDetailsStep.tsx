'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SubmissionFormData } from '../schema';
import { getUserPseudonyms, createPseudonym } from '@/app/actions/submissions';
import { HelpTooltip } from './HelpTooltip';
import { SelectedIndicators } from './SelectedIndicators';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function BasicDetailsStep() {
    const {
        mediaType, setStep, selectedFiles, setSelectedFiles, category
    } = useSubmissionStore();

    const {
        register,
        watch,
        setValue,
        formState: { errors },
        trigger
    } = useFormContext<SubmissionFormData>();

    const [realName, setRealName] = useState('');
    const [userPseudonyms, setUserPseudonyms] = useState<any[]>([]);
    const [isCreatingPseudonym, setIsCreatingPseudonym] = useState(false);

    const watchedValues = watch();
    const usePseudonym = watchedValues.use_pseudonym;
    const [tagInput, setTagInput] = useState('');
    const isInitialized = useRef(false);

    useEffect(() => {
        const initialize = async () => {
            const [, pseudonyms] = await Promise.all([
                // Fetch real name
                (async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('id', session.user.id)
                            .single();
                        if (profile?.full_name) {
                            setRealName(profile.full_name);
                            return profile.full_name;
                        }
                    }
                    return null;
                })(),
                // Fetch pseudonyms
                getUserPseudonyms().catch(() => [])
            ]);

            setUserPseudonyms(pseudonyms || []);

            if (!isInitialized.current) {
                if (pseudonyms && pseudonyms.length > 0) {
                    // User has a nickname — activate it by default
                    setValue('use_pseudonym', true);
                    setValue('pseudonym_id', pseudonyms[0].id);
                    setValue('authors', pseudonyms[0].name);
                }
                isInitialized.current = true;
            }
        };
        initialize();
    }, [setValue]);

    useEffect(() => {
        if (!usePseudonym && realName) {
            setValue('authors', realName);
            setValue('pseudonym_id', undefined);
        }
    }, [usePseudonym, realName, setValue]);

    const handleCreatePseudonym = async () => {
        const name = watch('new_pseudonym');
        if (!name || name.length < 2) return;

        setIsCreatingPseudonym(true);
        const res = await createPseudonym(name);
        if (res.success && res.data) {
            setUserPseudonyms(prev => [...prev, res.data]);
            setValue('pseudonym_id', res.data.id);
            setValue('authors', res.data.name);
            setValue('new_pseudonym', '');
            toast.success("Apelido criado!");
        } else {
            toast.error(res.error || "Erro ao criar apelido");
        }
        setIsCreatingPseudonym(false);
    };

    const handleSelectPseudonym = (p: any) => {
        setValue('pseudonym_id', p.id);
        setValue('authors', p.name);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const tag = tagInput.trim().replace(/^#/, '');
            if (tag && !(watchedValues.tags || []).includes(tag)) {
                setValue('tags', [...(watchedValues.tags || []), tag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', (watchedValues.tags || []).filter(t => t !== tagToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
            setSelectedFiles([...selectedFiles, ...validFiles].slice(0, 10));
        }
    };

    const handleContinue = async () => {
        const isValid = await trigger(['title', 'authors', 'event_year', 'description', 'read_guide', 'accepted_cc']);
        if (isValid) {
            // Central de Anotações mandatory tag check
            if (category === 'Central de Anotações' && (!watchedValues.tags || watchedValues.tags.length === 0)) {
                toast.error("Para a Central de Anotações, é obrigatório selecionar ao menos uma disciplina.");
                return;
            }

            // Validation Traps for Media
            const showFileUpload = ['image', 'pdf', 'zip', 'sdocx', 'audio'].includes(mediaType);
            const showVideoUrl = mediaType === 'video';

            if (showFileUpload && selectedFiles.length === 0) {
                toast.error("Por favor, selecione ao menos um arquivo para continuar.");
                return;
            }

            if (showVideoUrl && !watch('video_url')) {
                toast.error("Por favor, insira o link do vídeo do YouTube.");
                return;
            }

            setStep('optional');
        } else {
            toast.error("Por favor, preencha os campos obrigatórios corretamente.");
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const showFileUpload = ['image', 'pdf', 'zip', 'sdocx', 'audio'].includes(mediaType);
    const showVideoUrl = mediaType === 'video';
    const isTextMode = mediaType === 'text';
    const isAnontacoes = category === 'Central de Anotações';

    return (
        <div className="space-y-10 pb-20">
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                <SelectedIndicators />
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep('format')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes da Contribuição</h1>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Título */}
                <div className="space-y-3 lg:col-span-2">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-blue">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">title</span>
                            Título da Contribuição *
                            <HelpTooltip text="Títulos impactantes ajudam na descoberta. Seja específico sobre o experimento ou conceito abordado." />
                        </div>
                        <span className={`text-[10px] font-bold ${(watchedValues.title || '').length > 60 ? 'text-brand-red' : 'text-gray-400'}`}>
                            {(watchedValues.title || '').length}/60
                        </span>
                    </label>
                    <input
                        type="text" {...register('title')}
                        className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.title ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                        placeholder="Ex: Luz e Sombra no Lab de Óptica"
                    />
                    {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
                </div>

                {/* Autor Principal */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-red">
                            <span className="material-symbols-outlined text-xl">group</span>
                            Autor Principal *
                            <HelpTooltip text="O nome real garante o crédito acadêmico oficial. O apelido é útil se você já tem uma identidade consolidada no Hub." />
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" {...register('use_pseudonym')} className="peer sr-only" />
                            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-brand-blue relative transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usar Apelido</span>
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="text" {...register('authors')}
                            readOnly={true}
                            className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white 
                                opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/10
                                ${errors.authors ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-red focus:ring-brand-red/10'}`}
                            placeholder={usePseudonym ? "Escolha um apelido abaixo" : "Nome do Perfil"}
                        />
                        {!usePseudonym && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                NOME REAL
                            </div>
                        )}
                    </div>

                    {usePseudonym && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {userPseudonyms.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {userPseudonyms.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSelectPseudonym(p)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${watch('pseudonym_id') === p.id ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' : 'border-gray-100 dark:border-gray-800 hover:border-brand-blue/30'}`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userPseudonyms.length < 2 && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        {...register('new_pseudonym')}
                                        placeholder="Novo apelido..."
                                        className="flex-grow bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-blue transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreatePseudonym}
                                        disabled={isCreatingPseudonym || !watch('new_pseudonym')}
                                        className="bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-blue/80 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {isCreatingPseudonym ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">add</span>}
                                        Criar
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.authors && <p className="text-red-500 text-xs font-bold">{errors.authors.message}</p>}
                </div>

                {/* Ano */}
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-brand-blue">
                        <span className="material-symbols-outlined text-xl">event</span>
                        Ano do Trabalho *
                        <HelpTooltip text="Ajuda a organizar a linha do tempo histórica do Instituto de Física." />
                    </label>
                    <select
                        {...register('event_year')}
                        className={`w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4 focus:ring-4 outline-none transition-all dark:text-white ${errors.event_year ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus:border-brand-blue focus:ring-brand-blue/10'}`}
                    >
                        {Array.from({ length: new Date().getFullYear() - 1934 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags / Disciplinas (Mandatory for Central de Anotações) */}
            {isAnontacoes && (
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">sell</span>
                        Disciplina *
                        <HelpTooltip text="Para a Central de Anotações, é obrigatório associar pelo menos uma disciplina." />
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-form-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl ring-2 ring-brand-yellow/20">
                        {watchedValues.tags?.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-xl text-xs font-bold animate-in zoom-in-75 duration-200">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)}><span className="material-symbols-outlined text-[14px]">close</span></button>
                            </span>
                        ))}
                        <input 
                            value={tagInput} 
                            onChange={e => setTagInput(e.target.value)} 
                            onKeyDown={handleTagKeyDown} 
                            className="flex-grow bg-transparent outline-none text-sm px-2" 
                            placeholder="Adicionar disciplina (Pressione Enter)..." 
                        />
                    </div>
                </div>
            )}

            {/* Descrição */}
            <div className="space-y-3">
                <label className="text-sm font-black uppercase tracking-widest flex items-center justify-between text-brand-yellow">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">{isTextMode ? 'article' : 'description'}</span>
                        {isTextMode ? 'Seu Texto (Markdown & LaTeX) *' : 'Descrição e Contexto (Suporte a LaTeX) *'}
                        <HelpTooltip text="Explique o contexto técnico e humano. Use Markdown para formatar e LaTeX para fórmulas. Isso ajuda quem não é da área a entender o valor do seu trabalho." />
                    </div>
                </label>

                {/* Markdown Toolkit & Textarea Container */}
                <div className={`flex flex-col border-2 rounded-2xl overflow-hidden transition-all focus-within:ring-4 ${errors.description ? 'border-red-500 focus-within:ring-red-500/10' : 'border-gray-100 dark:border-gray-800 focus-within:border-brand-yellow focus-within:ring-brand-yellow/10'}`}>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                        {[
                            { icon: 'format_bold', label: 'Negrito', snippet: '**texto**', tooltip: 'Negrito (**text**)' },
                            { icon: 'format_italic', label: 'Itálico', snippet: '*texto*', tooltip: 'Itálico (*text*)' },
                            { icon: 'link', label: 'Link', snippet: '[título](url)', tooltip: 'Link ([title](url))' },
                            { icon: 'code', label: 'Código', snippet: '`código`', tooltip: 'Código (`code`)' },
                            { icon: 'functions', label: 'LaTeX', snippet: '$f(x) = x^2$', tooltip: 'Fórmula LaTeX ($...$)' },
                            { icon: 'format_list_bulleted', label: 'Lista', snippet: '\n- Item', tooltip: 'Lista (- Item)' },
                        ].map((tool) => (
                            <button
                                key={tool.label}
                                type="button"
                                onClick={() => {
                                    const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
                                    if (!textarea) return;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const after = text.substring(end);
                                    const newText = before + tool.snippet + after;
                                    setValue('description', newText);
                                    // Focus back and set cursor
                                    setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start + tool.snippet.length, start + tool.snippet.length);
                                    }, 10);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-brand-yellow transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                title={tool.tooltip}
                            >
                                <span className="material-symbols-outlined text-sm">{tool.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{tool.label}</span>
                            </button>
                        ))}
                    </div>

                    <textarea
                        {...register('description')}
                        rows={8}
                        className="w-full bg-white dark:bg-form-dark px-6 py-4 outline-none dark:text-white resize-none"
                        placeholder={isTextMode ? 'Utilize Markdown e LaTeX (ex: $E=mc^2$)...' : 'Explique do que se trata esse material, use LaTeX se necessário...'}
                    />
                </div>
                {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
            </div>

            {/* Mídia */}
            {showVideoUrl && (
                <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-red flex items-center">
                        Link do YouTube *
                        <HelpTooltip text="Vídeos devem ser hospedados no YouTube para garantir carregamento instantâneo e qualidade." />
                    </label>
                    <input type="url" {...register('video_url')} className="w-full bg-white dark:bg-form-dark border-2 rounded-2xl px-6 py-4" placeholder="https://youtu.be/..." />
                </div>
            )}

            {showFileUpload && (
                <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-brand-blue flex items-center">
                        Arquivos (Máx: 10MB cada) *
                        <HelpTooltip text="A qualidade técnica dos arquivos fortalece o rigor do acervo científico do Hub." />
                    </label>
                    <div className="border-4 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer border-gray-100 dark:border-gray-800" onClick={() => document.getElementById('file-upload')?.click()}>
                        <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                        <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
                        <p className="font-black text-gray-900 dark:text-white">Clique para selecionar arquivos</p>
                    </div>
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, i) => (
                                <div key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-bold flex items-center gap-2">
                                    {file.name}
                                    <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}>
                                        <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-5 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 hover:bg-brand-blue/10 transition-all">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('read_guide')}
                            className="peer appearance-none size-8 border-2 border-brand-blue rounded-lg checked:bg-brand-blue transition-all cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xl font-bold">check</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">Confirmo que li o Guia de Boas Práticas. *</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl bg-brand-red/5 border border-brand-red/10 hover:bg-brand-red/10 transition-all">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            {...register('accepted_cc')}
                            className="peer appearance-none size-8 border-2 border-brand-red rounded-lg checked:bg-brand-red transition-all cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xl font-bold">check</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider">Concordo com a licença Creative Commons. *</span>
                </label>
            </div>

            <div className="flex justify-between items-center pt-10">
                <button onClick={() => setStep('format')} className="text-gray-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">west</span> Voltar
                </button>
                <button
                    type="button"
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-brand-blue to-brand-red px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Continuar para Extras
                </button>
            </div>
        </div>
    );
}
