'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, X, User, FileText, Globe, Link as LinkIcon, Building2, ShieldCheck, Star, Mail, Phone, FileUp, Info, Users, Microscope, Briefcase, Zap, Github, Linkedin, Youtube, Instagram } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { updateProfile, getProfileWithPseudonyms, uploadEnrollmentProof, updateProfileAsAdmin } from '@/app/actions/profiles';
import { getUserPseudonyms, createPseudonym } from '@/app/actions/submissions';
import { createServerSupabase } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

const profileSchema = z.object({
    email: z.string().optional(),
    full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
    bio: z.string().max(200, "Bio muito longa (máx 200)").default(''),
    username: z.string().max(30, "Apelido muito longo").default(''),
    use_nickname: z.boolean().default(false),
    institute: z.string().optional(),
    other_institute: z.string().optional(),
    course: z.string().optional(),
    education_level: z.string().optional(),
    external_institution: z.string().optional(),
    whatsapp: z.string().optional(),
    entrance_year: z.string().optional(),
    artistic_interests_str: z.string().default(''),
    lattes_url: z.string().url("Link do Lattes inválido").or(z.literal("")).default(''),
    linkedin_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    github_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    youtube_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    tiktok_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    instagram_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    portfolio_url: z.string().url("Link inválido").or(z.literal("")).default(''),
    new_nickname: z.string().max(30).default(''),
    available_to_mentor: z.boolean().default(false),
    seeking_mentor: z.boolean().default(false),
    research_line: z.string().max(100).optional(),
    office_room: z.string().max(100).optional(),
    laboratory_name: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    is_labdiv: z.boolean().optional(),
    is_visible: z.boolean().optional(),
    user_category: z.enum(['curioso', 'licenciatura', 'bacharelado', 'pos_graduacao', 'docente_pesquisador', 'aluno_usp', 'pesquisador']).default('curioso'),
    seeking_assistant: z.boolean().default(false),
    interest_area: z.string().max(100).optional(),
}).superRefine((data, ctx) => {
    const isUsp = data.email?.endsWith('@usp.br') || data.email?.endsWith('@ime.usp.br');
    if (isUsp) {
        if (!data.institute || data.institute.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione um instituto", path: ["institute"] });
        } else if (data.institute === 'Outros' && (!data.other_institute || data.other_institute.trim() === '')) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe o nome do instituto", path: ["other_institute"] });
        }
        if (!data.course || data.course.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe seu curso", path: ["course"] });
        }
    } else {
        if (!data.education_level || data.education_level.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione sua escolaridade", path: ["education_level"] });
        }
        if (!data.external_institution || data.external_institution.trim() === '') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe sua instituição de origem", path: ["external_institution"] });
        }
    }
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    adminMode?: boolean;
    adminUserId?: string;
}

export function EditProfileModal({ isOpen, onClose, onSuccess, adminMode = false, adminUserId }: EditProfileModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pseudonyms, setPseudonyms] = useState<any[]>([]);
    const [isCreatingNickname, setIsCreatingNickname] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
    const [showHobbiesHelp, setShowHobbiesHelp] = useState(false);

    const [isAddingNetwork, setIsAddingNetwork] = useState(false);
    const [selectedNetworkToAdd, setSelectedNetworkToAdd] = useState('');
    const [activeNetworks, setActiveNetworks] = useState<string[]>([]);

    const SOCIAL_NETWORKS = [
        { id: 'linkedin_url', label: 'LinkedIn', icon: Linkedin },
        { id: 'github_url', label: 'GitHub', icon: Github },
        { id: 'youtube_url', label: 'YouTube', icon: Youtube },
        { id: 'instagram_url', label: 'Instagram', icon: Instagram },
        { id: 'tiktok_url', label: 'TikTok', icon: TikTokIcon },
    ];

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            email: '',
            full_name: '',
            bio: '',
            username: '',
            use_nickname: false,
            institute: '',
            other_institute: '',
            course: '',
            education_level: '',
            external_institution: '',
            whatsapp: '',
            entrance_year: '',
            artistic_interests_str: '',
            lattes_url: '',
            linkedin_url: '',
            github_url: '',
            youtube_url: '',
            tiktok_url: '',
            instagram_url: '',
            new_nickname: '',
            available_to_mentor: false,
            seeking_mentor: false,
            research_line: '',
            office_room: '',
            laboratory_name: '',
            department: '',
            is_labdiv: false,
            is_visible: true,
            user_category: 'curioso',
            seeking_assistant: false,
            interest_area: '',
        }
    });

    const [profileData, setProfileData] = useState<Profile | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);

    const useNickname = watch('use_nickname');
    const seekingMentor = watch('seeking_mentor');
    const availableToMentor = watch('available_to_mentor');
    const selectedInstitute = watch('institute');

    const formEmail = watch('email');
    const isUspUser = formEmail ? (formEmail.endsWith('@usp.br') || formEmail.endsWith('@ime.usp.br')) : false;

    const institutes = ['IME USP', 'IME-USP', 'IQ-USP', 'FFLCH-USP', 'Outros'];
    const ifCourses = ['Bacharelado', 'Licenciatura', 'Física Médica'];

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (seekingMentor) {
            setValue('available_to_mentor', false);
        }
    }, [seekingMentor, setValue]);

    useEffect(() => {
        if (availableToMentor) {
            setValue('seeking_mentor', false);
        }
    }, [availableToMentor, setValue]);

    const loadInitialData = async () => {
        setIsLoading(true);

        // If admin mode, we might need a different way to fetch the profile since 
        // getProfileWithPseudonyms is for the "current" user.
        let profile: any;
        let pNames: any[] = [];

        if (adminMode && adminUserId) {
            const { data } = await supabase.from('profiles').select('*').eq('id', adminUserId).single();
            profile = data;
            const { data: ps } = await supabase.from('pseudonyms').select('*').eq('user_id', adminUserId);
            pNames = ps || [];
        } else {
            const res = await getProfileWithPseudonyms();
            if ('error' in res) {
                toast.error(res.error || 'Erro ao carregar dados');
                onClose();
                return;
            }
            profile = res.profile;
            pNames = res.pseudonyms || [];
        }

        if (profile) {
            setCurrentStatus(profile.review_status);
            setValue('email', profile.email || '');
            setValue('full_name', profile.full_name || '');
            setValue('bio', profile.bio || '');
            setValue('username', profile.username || '');
            setValue('use_nickname', profile.use_nickname || false);

            setValue('education_level', profile.education_level || '');
            setValue('external_institution', profile.external_institution || '');

            if (profile.institute && ['IME USP', 'IME-USP', 'IQ-USP', 'FFLCH-USP'].includes(profile.institute)) {
                setValue('institute', profile.institute);
                setValue('other_institute', '');
            } else if (profile.institute) {
                setValue('institute', 'Outros');
                setValue('other_institute', profile.institute);
            }

            setValue('course', profile.course || '');
            setValue('whatsapp', profile.whatsapp || '');
            setValue('entrance_year', profile.entrance_year?.toString() || new Date().getFullYear().toString());
            setValue('artistic_interests_str', profile.artistic_interests?.join(', ') || '');
            setValue('lattes_url', profile.lattes_url || '');
            setValue('linkedin_url', profile.linkedin_url || '');
            setValue('github_url', profile.github_url || '');
            setValue('youtube_url', profile.youtube_url || '');
            setValue('tiktok_url', profile.tiktok_url || '');
            setValue('instagram_url', profile.instagram_url || '');
            setValue('portfolio_url', profile.portfolio_url || '');

            const pNetworks = [];
            if (profile.linkedin_url) pNetworks.push('linkedin_url');
            if (profile.github_url) pNetworks.push('github_url');
            if (profile.youtube_url) pNetworks.push('youtube_url');
            if (profile.instagram_url) pNetworks.push('instagram_url');
            if (profile.tiktok_url) pNetworks.push('tiktok_url');
            setActiveNetworks(pNetworks);

            setValue('available_to_mentor', profile.available_to_mentor || false);
            setValue('seeking_mentor', profile.seeking_mentor || false);
            setValue('is_labdiv', profile.is_labdiv || false);
            setValue('is_visible', profile.is_visible ?? true);
            setValue('user_category', profile.user_category || 'curioso');
            setValue('seeking_assistant', profile.seeking_assistant || false);
            setValue('research_line', profile.research_line || '');
            setValue('office_room', profile.office_room || '');
            setValue('laboratory_name', profile.laboratory_name || '');
            setValue('department', profile.department || '');
            setValue('interest_area', profile.interest_area || profile.ic_research_area || '');
            setProfileData(profile);
            setPseudonyms(pNames);
        }
        setIsLoading(false);
    };

    const handleCreateNickname = async () => {
        const name = watch('new_nickname')?.trim();
        if (!name || name.length < 3) {
            toast.error("Apelido muito curto");
            return;
        }

        if (pseudonyms.length >= 2) {
            toast.error("Limite de 2 apelidos atingido");
            return;
        }

        setIsCreatingNickname(true);
        const res = await createPseudonym(name);
        if (res.success && res.data) {
            toast.success("Apelido criado!");
            setPseudonyms(prev => [...prev, res.data]);
            setValue('username', res.data.name);
            setValue('new_nickname', '');
        } else {
            toast.error(res.error || "Erro ao criar apelido");
        }
        setIsCreatingNickname(false);
    };

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSaving(true);

        let proofUrl = profileData?.usp_proof_url || null;

        if (proofFile) {
            const formData = new FormData();
            formData.append('proof', proofFile);
            const uploadRes = await uploadEnrollmentProof(formData);
            if (uploadRes.success && uploadRes.path) {
                proofUrl = uploadRes.path;
            } else {
                toast.error(uploadRes.error || 'Erro ao fazer upload do arquivo');
                setIsSaving(false);
                return;
            }
        }

        // Remove new_nickname and email (read-only) and map fields to profileData
        const { new_nickname, email, artistic_interests_str, entrance_year, other_institute, education_level, external_institution, research_line, interest_area, office_room, laboratory_name, department, ...restData } = data;

        const updatedProfileData: any = {
            ...restData,
            research_line,
            interest_area,
            office_room,
            laboratory_name,
            department,
            institute: data.institute === 'Outros' ? other_institute : data.institute,
            usp_proof_url: proofUrl,
            entrance_year: entrance_year ? parseInt(entrance_year, 10) : null,
            artistic_interests: artistic_interests_str
                ? artistic_interests_str.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [],
            education_level: education_level,
            external_institution: external_institution
        };

        if (adminMode && adminUserId) {
            const res = await updateProfileAsAdmin(adminUserId, updatedProfileData);
            if (res.success) {
                toast.success('Perfil atualizado pelo admin!');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao salvar alterações');
            }
        } else {
            const res = await updateProfile(updatedProfileData as any);
            if (res.success) {
                toast.success('Alterações enviadas para aprovação!');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao salvar alterações');
            }
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Editar Perfil</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Personalize seu Laboratório Pessoal</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-20 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto hidden-scrollbar">
                        {currentStatus === 'pending' && (
                            <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl flex items-center gap-3 animate-pulse">
                                <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                                <p className="text-[10px] font-bold text-brand-yellow uppercase tracking-tight">
                                    Seu perfil tem alterações pendentes de aprovação pelo administrador.
                                </p>
                            </div>
                        )}

                        {adminMode && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Membro HUB IME</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('is_labdiv')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Visibilidade</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('is_visible')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* 1. INFORMAÇÕES BÁSICAS (Locked for non-admin) */}
                        <div className="space-y-4">
                            <div className={`space-y-2 ${!adminMode && 'opacity-70'}`}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> E-mail {!adminMode && '(Bloqueado)'}
                                </label>
                                <input
                                    {...register('email')}
                                    readOnly={!adminMode}
                                    className={`w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm outline-none ${!adminMode ? 'cursor-not-allowed text-gray-400' : 'focus:border-brand-blue/50 text-gray-900 dark:text-white font-bold'}`}
                                />
                            </div>

                            <div className={`space-y-2 ${!adminMode && 'opacity-70'}`}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Nome Completo {!adminMode && '(Bloqueado)'}
                                </label>
                                <input
                                    {...register('full_name')}
                                    readOnly={!adminMode}
                                    className={`w-full bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm outline-none ${!adminMode ? 'cursor-not-allowed text-gray-400' : 'focus:border-brand-blue/50 text-gray-900 dark:text-white font-bold'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Bio
                                </label>
                                <textarea
                                    {...register('bio')}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Conte um pouco sobre você..."
                                />
                                {errors.bio && <p className="text-[10px] text-brand-red font-bold uppercase ml-1">{errors.bio.message}</p>}
                            </div>
                        </div>

                        {/* 2. IDENTIDADE PROTEGIDA */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                    <Users className="w-3 h-3" /> Sua Categoria
                                </label>
                                {adminMode ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            {...register('user_category')}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-brand-red/30 rounded-2xl px-4 py-3 text-sm focus:border-brand-red outline-none transition-all cursor-pointer font-black text-gray-900 dark:text-white uppercase tracking-tight"
                                        >
                                            <option value="curioso">Curioso / Visitante</option>
                                            <option value="licenciatura">Licenciatura</option>
                                            <option value="bacharelado">Bacharelado</option>
                                            <option value="pos_graduacao">Pós-Graduação</option>
                                            <option value="docente_pesquisador">Docente / Pesquisador</option>
                                        </select>
                                        <span className="text-[8px] font-black bg-brand-red/10 text-brand-red px-2 py-0.5 rounded uppercase font-mono h-fit shrink-0">Admin Edit</span>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            {watch('user_category').replace('_', ' ')}
                                        </span>
                                        <span className="text-[8px] font-black bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded uppercase font-mono">ID HUB IME</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-brand-blue" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Usar apelido publicamente</span>
                                            <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap overflow-hidden">Oculta seu nome real no seu perfil</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register('use_nickname')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                    </label>
                                </div>

                                {useNickname && (
                                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Seus Apelidos (Máx 2)</label>
                                        {pseudonyms.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {pseudonyms.map(pseudo => (
                                                    <button
                                                        key={pseudo.id}
                                                        type="button"
                                                        onClick={() => setValue('username', pseudo.name)}
                                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${watch('username') === pseudo.name
                                                            ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20'
                                                            : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5 hover:border-brand-blue/30'}`}
                                                    >
                                                        {pseudo.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {pseudonyms.length < 2 && (
                                            <div className="flex gap-2">
                                                <input
                                                    {...register('new_nickname')}
                                                    placeholder="Novo apelido..."
                                                    className="flex-1 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-blue/50 transition-all font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCreateNickname}
                                                    disabled={isCreatingNickname || !watch('new_nickname')}
                                                    className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase hover:bg-brand-blue/80 disabled:opacity-50 transition-all"
                                                >
                                                    {isCreatingNickname ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar'}
                                                </button>
                                            </div>
                                        )}
                                        <input type="hidden" {...register('username')} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. CONECTIVIDADE E INTERESSES */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> WhatsApp
                                    </label>
                                    <input
                                        {...register('whatsapp')}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                        <LinkIcon className="w-3 h-3" /> Currículo Lattes
                                    </label>
                                    <input
                                        {...register('lattes_url')}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                        placeholder="https://lattes.cnpq.br/..."
                                    />
                                    {errors.lattes_url && <p className="text-[10px] text-brand-red font-bold ml-1 uppercase">{errors.lattes_url.message}</p>}
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Site Pessoal / Portfólio
                                    </label>
                                    <input
                                        {...register('portfolio_url')}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                        placeholder="https://seu-site.com..."
                                    />
                                    {errors.portfolio_url && <p className="text-[10px] text-brand-red font-bold ml-1 uppercase">{errors.portfolio_url.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    Redes Sociais
                                </label>
                                
                                {activeNetworks.map(netId => {
                                    const network = SOCIAL_NETWORKS.find(n => n.id === netId)!;
                                    const Icon = network.icon;
                                    const errorMsg = (errors as any)[netId]?.message;
                                    
                                    return (
                                        <div key={netId} className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl shrink-0">
                                                    <Icon className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        {...register(netId as any)}
                                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400 font-bold text-gray-900 dark:text-white"
                                                        placeholder={`Link do seu ${network.label}...`}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveNetworks(prev => prev.filter(id => id !== netId));
                                                        setValue(netId as any, '');
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-2xl transition-colors"
                                                    title={`Remover ${network.label}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {errorMsg && <p className="text-[10px] text-brand-red font-bold ml-[52px] uppercase tracking-tight">{errorMsg as React.ReactNode}</p>}
                                        </div>
                                    );
                                })}

                                {/* Add Network Flow */}
                                {SOCIAL_NETWORKS.filter(n => !activeNetworks.includes(n.id)).length > 0 && (
                                    <div className="mt-2">
                                        {!isAddingNetwork ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNetwork(true)}
                                                className="w-full py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-blue hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all flex items-center justify-center gap-2"
                                            >
                                                + Vincular Rede Social
                                            </button>
                                        ) : (
                                            <div className="p-3 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                                <select
                                                    value={selectedNetworkToAdd}
                                                    onChange={(e) => setSelectedNetworkToAdd(e.target.value)}
                                                    className="flex-1 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-3 text-xs focus:border-brand-blue/50 outline-none font-bold cursor-pointer transition-all uppercase tracking-tight"
                                                >
                                                    <option value="" disabled>Escolha a rede...</option>
                                                    {SOCIAL_NETWORKS.filter(n => !activeNetworks.includes(n.id)).map(net => (
                                                        <option key={net.id} value={net.id}>{net.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedNetworkToAdd) {
                                                            setActiveNetworks(prev => [...prev, selectedNetworkToAdd]);
                                                            setSelectedNetworkToAdd('');
                                                            setIsAddingNetwork(false);
                                                        }
                                                    }}
                                                    disabled={!selectedNetworkToAdd}
                                                    className="px-5 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/80 disabled:opacity-50 transition-all border border-brand-blue shadow-lg shadow-brand-blue/20"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingNetwork(false);
                                                        setSelectedNetworkToAdd('');
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Star className="w-3 h-3" /> Hobbies e Artes
                                </div>
                                <button
                                    type="button"
                                    onMouseEnter={() => setShowHobbiesHelp(true)}
                                    onMouseLeave={() => setShowHobbiesHelp(false)}
                                    className="p-1 hover:bg-brand-blue/10 rounded-full transition-colors text-brand-blue"
                                >
                                    <Info className="w-3.5 h-3.5 transition-transform" />
                                </button>
                            </label>
                            <input
                                {...register('artistic_interests_str')}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all placeholder:text-gray-400"
                                placeholder="O que você faz nas horas vagas?"
                            />

                            <AnimatePresence>
                                {showHobbiesHelp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                        className="absolute left-0 right-0 z-50 mt-2 p-5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl"
                                    >
                                        <div className="space-y-3">
                                            <p className="text-[10px] text-gray-900 dark:text-white leading-relaxed font-bold uppercase tracking-tight">
                                                Inspiração para o Perfil:
                                            </p>
                                            <ul className="space-y-2 text-[9px] text-gray-500 font-mono">
                                                <li>• <span className="text-brand-blue font-black">Artes:</span> Fotografia, Desenho, Música, Cinema.</li>
                                                <li>• <span className="text-brand-blue font-black">Jogos:</span> RPG, Boardgames, Videogames, Xadrez.</li>
                                                <li>• <span className="text-brand-blue font-black">Maker:</span> Arduino, Impressão 3D, Game Dev.</li>
                                                <li>• <span className="text-brand-blue font-black">Outros:</span> Trilhas, Astronomia, Culinária.</li>
                                            </ul>
                                        </div>
                                        <div className="absolute -top-1 right-6 w-2 h-2 bg-white dark:bg-[#252525] rotate-45 border-l border-t border-gray-200 dark:border-white/10" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 4. SEÇÕES CONDICIONAIS POR CATEGORIA */}
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-white/5">
                            {watch('user_category') === 'curioso' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> Formação Acadêmica
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Escolaridade</label>
                                            <select
                                                {...register('education_level')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                            >
                                                <option value="" disabled>Selecione</option>
                                                <option value="Ensino Médio">Ensino Médio</option>
                                                <option value="Graduação (Em andamento)">Graduação (Em andamento)</option>
                                                <option value="Graduação (Concluída)">Graduação (Concluída)</option>
                                                <option value="Pós-graduação / Pesquisa">Pós-graduação / Pesquisa</option>
                                                <option value="Entusiasta / Autodidata">Entusiasta / Autodidata</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instituição</label>
                                            <input
                                                {...register('external_institution')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                                placeholder="Sua escola ou faculdade"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Área de Interesse</label>
                                        <input
                                            {...register('interest_area')}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all font-bold"
                                            placeholder="Ex: Astrofísica, Robótica, IA..."
                                        />
                                    </div>
                                </div>
                            )}

                            {watch('user_category') === 'aluno_usp' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="w-3 h-3" /> Protocolos USP
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instituto</label>
                                            <select
                                                {...register('institute')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                            >
                                                <option value="" disabled>Selecione</option>
                                                {institutes.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                            </select>
                                        </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Curso</label>
                                        {selectedInstitute === 'IME USP' ? (
                                            <select
                                                {...register('course')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                            >
                                                <option value="" disabled>Selecione seu curso</option>
                                                <option value="Bacharelado em Física">Bacharelado em Física</option>
                                                <option value="Licenciatura em Física">Licenciatura em Física</option>
                                                <option value="Física Médica">Física Médica</option>
                                            </select>
                                        ) : (
                                            <input
                                                {...register('course')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all font-bold"
                                                placeholder="Ex: Bacharelado em Matemática"
                                            />
                                        )}
                                    </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> Ano de Ingresso
                                        </label>
                                        <input
                                            type="number"
                                            {...register('entrance_year')}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                                            placeholder="Ex: 2022"
                                        />
                                    </div>

                                    {(() => {
                                        const entranceYear = parseInt(watch('entrance_year') || '0');
                                        const currentYear = new Date().getFullYear();
                                        const canMentor = currentYear - entranceYear >= 2;
                                        const isMentor = watch('available_to_mentor');
                                        const isBixo = watch('seeking_mentor');
                                        return (
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Bloco Mentor */}
                                                <button
                                                    type="button"
                                                    disabled={!canMentor}
                                                    onClick={() => { if (canMentor) { setValue('available_to_mentor', !isMentor); if (!isMentor) setValue('seeking_mentor', false); } }}
                                                    className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all text-left ${
                                                        !canMentor
                                                            ? 'opacity-40 cursor-not-allowed border-gray-700 bg-gray-900/30'
                                                            : isMentor
                                                                ? 'border-brand-blue bg-brand-blue/10 shadow-lg shadow-brand-blue/20 scale-[1.02]'
                                                                : 'border-gray-700 hover:border-brand-blue/50 bg-white/[0.02] hover:bg-brand-blue/5 cursor-pointer'
                                                    }`}
                                                >
                                                    {isMentor && <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-transparent pointer-events-none" />}
                                                    <div className="relative z-10 space-y-2">
                                                        <div className="text-2xl">🎓</div>
                                                        <div className="text-xs font-black uppercase tracking-tight text-brand-blue">Mentor</div>
                                                        <p className="text-[9px] text-gray-400 leading-relaxed">
                                                            {canMentor ? 'Adote um bixo e guie-o pelo USP' : 'Requer 2+ anos de curso'}
                                                        </p>
                                                        <div className={`mt-2 w-full h-1 rounded-full ${isMentor ? 'bg-brand-blue' : 'bg-gray-700'} transition-all`} />
                                                    </div>
                                                    <input type="checkbox" {...register('available_to_mentor')} className="sr-only" disabled={!canMentor} />
                                                </button>

                                                {/* Bloco Bixo */}
                                                <button
                                                    type="button"
                                                    onClick={() => { setValue('seeking_mentor', !isBixo); if (!isBixo) setValue('available_to_mentor', false); }}
                                                    className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all text-left ${
                                                        isBixo
                                                            ? 'border-brand-red bg-brand-red/10 shadow-lg shadow-brand-red/20 scale-[1.02]'
                                                            : 'border-gray-700 hover:border-brand-red/50 bg-white/[0.02] hover:bg-brand-red/5 cursor-pointer'
                                                    }`}
                                                >
                                                    {isBixo && <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent pointer-events-none" />}
                                                    <div className="relative z-10 space-y-2">
                                                        <div className="text-2xl">💛</div>
                                                        <div className="text-xs font-black uppercase tracking-tight text-brand-red">Sou Bixo</div>
                                                        <p className="text-[9px] text-gray-400 leading-relaxed">Quero ser adotado por um veterano</p>
                                                        <div className={`mt-2 w-full h-1 rounded-full ${isBixo ? 'bg-brand-red' : 'bg-gray-700'} transition-all`} />
                                                    </div>
                                                    <input type="checkbox" {...register('seeking_mentor')} className="sr-only" />
                                                </button>
                                            </div>
                                        );
                                    })()}

                                    <div className="space-y-3 p-4 bg-brand-red/5 border border-brand-red/10 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            <FileUp className="w-4 h-4 text-brand-red" />
                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-red">
                                                Comprovante USP
                                            </label>
                                        </div>
                                        <p className="text-[9px] text-brand-red/80 font-medium leading-relaxed">
                                            ⚠️ Para sua privacidade, a foto/documento será apagada permanentemente dos nossos servidores 60 segundos após a avaliação da moderação. Se não houver avaliação, o arquivo será excluído automaticamente da nuvem em alguns dias.
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                            className="w-full text-[10px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-red file:text-white hover:file:bg-brand-red/90 transition-all cursor-pointer"
                                        />
                                        {profileData?.usp_proof_url && !proofFile && (
                                            <p className="text-[9px] text-brand-red font-bold uppercase mt-1 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Validado no HUB IME
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {watch('user_category') === 'pesquisador' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <h3 className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Microscope className="w-3 h-3" /> Configuração de Laboratório
                                    </h3>
                                    
                                    <div className="p-4 bg-brand-yellow/5 border border-brand-yellow/10 rounded-2xl flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">Buscando Ajudantes / ICs</span>
                                            <span className="text-[9px] text-gray-500 font-medium italic">Sinaliza recrutamento no Match Acadêmico</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" {...register('seeking_assistant')} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-yellow"></div>
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Linha de Pesquisa</label>
                                        <input
                                            {...register('research_line')}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-yellow/50 outline-none transition-all font-bold"
                                            placeholder="Ex: Física de Partículas..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Departamento</label>
                                            <input
                                                {...register('department')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-yellow/50 outline-none transition-all font-bold"
                                                placeholder="Ex: DFMA"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sala / Lab</label>
                                            <input
                                                {...register('office_room')}
                                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-yellow/50 outline-none transition-all font-bold"
                                                placeholder="Ex: 201"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instituição / Laboratório</label>
                                        <input
                                            {...register('laboratory_name')}
                                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:border-brand-yellow/50 outline-none transition-all"
                                            placeholder="Ex: Lab de Cristalografia"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-[2] px-6 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
