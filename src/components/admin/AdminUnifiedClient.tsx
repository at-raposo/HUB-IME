'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
    deleteProfile,
    impersonateUser,
    toggleProfileVisibility,
    toggleLabdivMember,
    updateProfileAsAdmin
} from '@/app/actions/profiles';
import { 
    executeNuclearReset, 
    executeProfileWipe, 
    executeContentWipe, 
    executeSpecificUserWipe,
    executeTrailsWipe,
    executeSelectiveWipe
} from '@/app/actions/reset';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { TelemetryManager } from './settings/TelemetryManager';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_usp_member: boolean;
    is_labdiv: boolean;
    is_visible: boolean;
    created_at: string;
}

const ROLES = [
    { value: 'user', label: 'Usuário Padrão', color: 'gray-500' },
    { value: 'moderator', label: 'Moderador', color: 'brand-yellow' },
    { value: 'admin', label: 'Administrador Geral', color: 'brand-red' }
];

export function AdminUnifiedClient() {
    const [activeTab, setActiveTab] = useState<'papeis' | 'perigo' | 'telemetria'>('papeis');
    
    // Profiles State
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Danger Zone State
    const [secretKey, setSecretKey] = useState('');
    const [targetUid, setTargetUid] = useState('');
    const [preservedEmails, setPreservedEmails] = useState('');
    const [isDangerLoading, setIsDangerLoading] = useState(false);

    // Modals State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: '',
        name: ''
    });

    const [editModal, setEditModal] = useState<{ isOpen: boolean; profile: Profile | null }>({
        isOpen: false,
        profile: null
    });

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Erro ao carregar perfis.");
        } else {
            setProfiles(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'papeis') {
            fetchProfiles();
        }
    }, [activeTab]);

    // Roles Actions
    const handleRoleChange = async (id: string, newRole: string) => {
        const { error } = await updateProfileAsAdmin(id, { role: newRole });
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
            toast.success('Papel atualizado!');
        }
    };

    const handleToggleLabdiv = async (id: string, current: boolean) => {
        const { error } = await toggleLabdivMember(id, !current);
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_labdiv: !current } : p));
            toast.success(current ? 'Removido do Lab-Div' : 'Adicionado ao Lab-Div');
        }
    };

    const handleToggleVisibility = async (id: string, current: boolean) => {
        const { error } = await toggleProfileVisibility(id, !current);
        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_visible: !current } : p));
            toast.success(current ? 'Perfil oculto' : 'Perfil visível');
        }
    };

    const handleImpersonate = async (id: string, name: string) => {
        toast.loading(`Assumindo identidade de ${name}...`);
        const { error } = await impersonateUser(id);
        if (error) {
            toast.dismiss();
            toast.error(error);
        } else {
            window.location.href = '/lab';
        }
    };

    const handleDeleteConfirm = async () => {
        const { id } = deleteModal;
        toast.loading('Deletando usuário...');
        const { error } = await deleteProfile(id);
        toast.dismiss();
        setDeleteModal({ ...deleteModal, isOpen: false });

        if (error) {
            toast.error(error);
        } else {
            setProfiles(prev => prev.filter(p => p.id !== id));
            toast.success('Usuário removido permanentemente.');
        }
    };

    // Danger Zone Actions
    const handleNuclearReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirm('VOCÊ TEM CERTEZA? Isso destruirá TODO o banco de dados e arquivos.')) return;
        
        setIsDangerLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await executeNuclearReset(formData) as any;
        
        if (result.success) {
            toast.success(result.message || 'Reset Nuclear Concluído');
        } else {
            toast.error(result.error || 'Erro no Reset Nuclear');
        }
        setIsDangerLoading(false);
    };

    const handleProfileWipe = async () => {
        if (!secretKey) return toast.error('Insira a chave secreta.');
        if (!confirm('Apagar todos os usuários? As trilhas serão mantidas.')) return;

        setIsDangerLoading(true);
        const formData = new FormData();
        formData.append('secret_key', secretKey);
        const result = await executeProfileWipe(formData) as any;

        if (result.success) {
            toast.success(result.message || 'Wipe de Perfis Concluído');
        } else {
            toast.error(result.error || 'Erro no Wipe de Perfis');
        }
        setIsDangerLoading(false);
    };

    const handleContentWipe = async () => {
        if (!secretKey) return toast.error('Insira a chave secreta.');
        if (!confirm('Apagar todas as submissões, logs e perguntas?')) return;

        setIsDangerLoading(true);
        const formData = new FormData();
        formData.append('secret_key', secretKey);
        const result = await executeContentWipe(formData) as any;

        if (result.success) {
            toast.success(result.message || 'Wipe de Conteúdo Concluído');
        } else {
            toast.error(result.error || 'Erro no Wipe de Conteúdo');
        }
        setIsDangerLoading(false);
    };

    const handleSpecificWipe = async () => {
        if (!secretKey || !targetUid) return toast.error('Insira a chave e o UID.');
        if (!confirm(`Apagar todos os dados do usuário ${targetUid}?`)) return;

        setIsDangerLoading(true);
        const result = await executeSpecificUserWipe(targetUid, secretKey) as any;

        if (result.success) {
            toast.success(result.message || 'Usuário Removido com Sucesso');
            setTargetUid('');
        } else {
            toast.error(result.error || 'Erro na Remoção do Usuário');
        }
        setIsDangerLoading(false);
    };

    const handleTrailsWipe = async () => {
        if (!secretKey) return toast.error('Insira a chave secreta.');
        if (!confirm('Apagar TODAS AS TRILHAS do sistema? (Usuários e posts serão mantidos)')) return;

        setIsDangerLoading(true);
        const formData = new FormData();
        formData.append('secret_key', secretKey);
        const result = await executeTrailsWipe(formData) as any;

        if (result.success) {
            toast.success(result.message || 'Wipe de Trilhas Concluído');
        } else {
            toast.error(result.error || 'Erro no Wipe de Trilhas');
        }
        setIsDangerLoading(false);
    };

    const handleSelectiveWipe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!secretKey) return toast.error('Insira a chave secreta na seção de ações manuais primeiro.');
        if (!confirm('VOCÊ TEM CERTEZA? O Wipe Seletivo apagará TODO o conteúdo e os perfis, deixando APENAS as trilhas e as contas dos e-mails digitados.')) return;
        
        setIsDangerLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('secret_key', secretKey);
        
        const result = await executeSelectiveWipe(formData) as any;
        
        if (result.success) {
            toast.success(result.message || 'Wipe Seletivo Concluído');
            setPreservedEmails('');
        } else {
            toast.error(result.error || 'Erro no Wipe Seletivo');
        }
        setIsDangerLoading(false);
    };

    const filteredProfiles = profiles.filter(p =>
        (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[10px] font-black uppercase tracking-widest mb-4">
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Configurações Avançadas
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Gerência <span className="text-brand-yellow">Administrativa</span>
                </h1>
                <p className="text-gray-500 mt-4 text-sm font-medium max-w-2xl leading-relaxed">
                    Controle de autorizações de usuários e protocolos de manutenção crítica do sistema.
                </p>
            </header>

            {/* Custom Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] mb-12 w-fit">
                <button
                    onClick={() => setActiveTab('papeis')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'papeis'
                            ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/20'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    Controle de Papéis
                </button>
                <button
                    onClick={() => setActiveTab('perigo')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'perigo'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                            : 'text-gray-500 hover:text-red-500 hover:bg-neutral-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">dangerous</span>
                    Zona de Perigo
                </button>
                <button
                    onClick={() => setActiveTab('telemetria')}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'telemetria'
                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                            : 'text-gray-500 hover:text-white hover:bg-neutral-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    Telemetria & Dados
                </button>
            </div>

            {activeTab === 'papeis' ? (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8">
                        <div className="relative max-w-md">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-brand-yellow/50 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <span className="material-symbols-outlined text-4xl animate-spin text-brand-yellow">progress_activity</span>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">group_off</span>
                            <p className="text-gray-500 font-medium">Nenhum perfil encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Usuário</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Vínculo</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">Acesso (Role)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredProfiles.map(profile => (
                                        <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm">{profile.full_name || 'Usuário Sem Nome'}</span>
                                                    <span className="text-xs text-gray-500">{profile.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${profile.is_usp_member ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'bg-white/5 text-gray-600'}`}>
                                                    {profile.is_usp_member ? 'Membro USP' : 'Curioso'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={profile.role || 'user'}
                                                            onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-brand-yellow/50 transition-colors w-full cursor-pointer"
                                                        >
                                                            {ROLES.map(role => (
                                                                <option key={role.value} value={role.value} className="bg-neutral-900">
                                                                    {role.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleToggleLabdiv(profile.id, profile.is_labdiv)}
                                                            className={`p-2 rounded-xl border transition-all ${profile.is_labdiv ? 'bg-brand-blue/20 border-brand-blue/50 text-brand-blue' : 'bg-white/5 border-white/10 text-gray-600 hover:text-brand-blue'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">verified_user</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleToggleVisibility(profile.id, profile.is_visible)}
                                                            className={`p-1.5 rounded-lg border transition-all ${profile.is_visible ? 'border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white' : 'border-white/10 text-gray-600 hover:text-white'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-xs">{profile.is_visible ? 'visibility' : 'visibility_off'}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleImpersonate(profile.id, profile.full_name)}
                                                            className="flex-1 py-1 px-2 rounded-lg bg-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-black text-[9px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-1"
                                                        >
                                                            Entrar como
                                                        </button>
                                                        <button
                                                            onClick={() => setEditModal({ isOpen: true, profile })}
                                                            className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-brand-blue transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({ isOpen: true, id: profile.id, name: profile.full_name })}
                                                            className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-xs">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ) : activeTab === 'perigo' ? (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Reset Nuclear */}
                        <section className="p-8 bg-red-950/10 border border-red-900/30 rounded-[32px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[120px] text-red-500">nuclear_power</span>
                            </div>
                            <h2 className="text-2xl font-black text-red-500 mb-4 flex items-center gap-3">
                                <span className="material-symbols-outlined">warning</span>
                                Reset Nuclear
                            </h2>
                            <p className="text-sm text-red-200/50 mb-8 leading-relaxed">
                                Limpeza total e absoluta. Deleta perfis, posts, storage e reseta o banco de dados para o vácuo inicial. Esta ação é IRREVERSÍVEL.
                            </p>
                            <form onSubmit={handleNuclearReset} className="space-y-4">
                                <input
                                    name="secret_key"
                                    type="password"
                                    placeholder="Chave de Admin"
                                    required
                                    className="w-full bg-black/40 border border-red-900/30 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-red-500 transition-colors"
                                />
                                <input
                                    name="confirm_phrase"
                                    type="text"
                                    placeholder="ESTOU CIENTE DA DESTRUIÇÃO TOTAL"
                                    required
                                    className="w-full bg-black/40 border border-red-900/30 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-red-500 transition-colors text-[10px] uppercase font-black"
                                />
                                <button
                                    disabled={isDangerLoading}
                                    className="w-full py-5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-900 text-white font-black rounded-2xl shadow-2xl shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    EXECUTAR PROTOCOLO ZERO
                                </button>
                            </form>
                        </section>

                        {/* Resets Parciais */}
                        <div className="space-y-6">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px]">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block">Chave de Autorização</label>
                                <input
                                    type="password"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                    placeholder="Chave para ações manuais"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-yellow/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={handleProfileWipe}
                                    disabled={isDangerLoading}
                                    className="p-8 bg-orange-600/5 border border-orange-500/20 rounded-[32px] hover:bg-orange-500/10 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-black text-orange-500 uppercase tracking-widest text-sm">Wipe de Perfis</span>
                                        <span className="material-symbols-outlined text-orange-500">person_remove</span>
                                    </div>
                                    <p className="text-xs text-orange-200/40">Remove usuários mas mantém trilhas.</p>
                                </button>

                                <button
                                    onClick={handleContentWipe}
                                    disabled={isDangerLoading}
                                    className="p-8 bg-brand-yellow/5 border border-brand-yellow/20 rounded-[32px] hover:bg-brand-yellow/10 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-black text-brand-yellow uppercase tracking-widest text-sm">Wipe de Conteúdo</span>
                                        <span className="material-symbols-outlined text-brand-yellow">inventory_2</span>
                                    </div>
                                    <p className="text-xs text-brand-yellow/40">Limpa submissões, logs e feedback.</p>
                                </button>

                                <button
                                    onClick={handleTrailsWipe}
                                    disabled={isDangerLoading}
                                    className="p-8 bg-brand-blue/5 border border-brand-blue/20 rounded-[32px] hover:bg-brand-blue/10 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-black text-brand-blue uppercase tracking-widest text-sm">Wipe de Trilhas</span>
                                        <span className="material-symbols-outlined text-brand-blue">route</span>
                                    </div>
                                    <p className="text-xs text-brand-blue/40">Remove APENAS as trilhas do sistema.</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    <section className="mt-8 p-8 bg-white/5 border border-white/10 rounded-[32px]">
                        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-blue">target</span>
                            Busca & Destruição
                        </h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={targetUid}
                                onChange={(e) => setTargetUid(e.target.value)}
                                placeholder="UID do Usuário"
                                className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-blue transition-colors"
                            />
                            <button
                                onClick={handleSpecificWipe}
                                disabled={isDangerLoading}
                                className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                APAGAR USUÁRIO
                            </button>
                        </div>
                    </section>
                    
                    <section className="mt-8 p-8 bg-purple-900/10 border border-purple-500/30 rounded-[32px] group">
                        <h2 className="text-xl font-black text-purple-500 mb-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[24px]">filter_alt_off</span>
                            Wipe Seletivo
                        </h2>
                        <p className="text-xs text-purple-200/50 mb-6 leading-relaxed">
                            Apaga todo o conteúdo do sistema (posts, logs, feedbacks) e <b>todos os perfis</b> exceto as contas dos e-mails listados abaixo. As <b>Trilhas de Aprendizagem</b> serão mantidas intactas.
                        </p>
                        <form onSubmit={handleSelectiveWipe} className="flex flex-col gap-4">
                            <textarea
                                name="preserved_emails"
                                value={preservedEmails}
                                onChange={(e) => setPreservedEmails(e.target.value)}
                                placeholder="E-mails para preservar (ex: admin@usp.br, coordenacao@if.usp.br)"
                                rows={3}
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isDangerLoading}
                                className="py-4 bg-purple-600 disabled:bg-neutral-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-purple-500 shadow-lg shadow-purple-900/20 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">cleaning_services</span>
                                EXECUTAR WIPE SELETIVO
                            </button>
                        </form>
                    </section>
                </section>
            ) : (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <TelemetryManager />
                </section>
            )}

            <DeleteUserModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteConfirm}
                userName={deleteModal.name}
            />

            {editModal.profile && (
                <EditProfileModal
                    isOpen={editModal.isOpen}
                    onClose={() => setEditModal({ isOpen: false, profile: null })}
                    // @ts-ignore
                    adminMode={true}
                    adminUserId={editModal.profile?.id}
                    onSuccess={fetchProfiles}
                />
            )}
        </div>
    );
}
