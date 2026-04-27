'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmaranhamentoFeedbackCard } from './EmaranhamentoFeedbackCard';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Header } from '@/components/layout/Header';
import { getProfileById, fetchRecentEntanglements } from '@/app/actions/submissions';
import { searchUsersByName } from '@/app/actions/profiles';
import { createEntangledGroup, fetchMyGroups, fetchGroupMessages, sendGroupMessage, fetchOfficialGroups, joinGroup } from '@/app/actions/groups';
import { getUserInterest } from '@/app/actions/recommendations';
import { ParticleEntanglement } from '@/components/engagement/ParticleEntanglement';
import { User, Loader2, Search, X, Users, Plus, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function EmaranhamentoPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || searchParams.get('userID');
    const groupId = searchParams.get('groupId');

    const [targetProfile, setTargetProfile] = useState<any>(null);
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecentLoading, setIsRecentLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Group state
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [isGroupsLoading, setIsGroupsLoading] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
    const [isMemberSearching, setIsMemberSearching] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Active group chat
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [groupMessages, setGroupMessages] = useState<any[]>([]);
    const [groupMessage, setGroupMessage] = useState('');
    const [isSendingGroupMsg, setIsSendingGroupMsg] = useState(false);
    const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
    const groupChatRef = useRef<HTMLDivElement>(null);

    // Focal groups state
    const [officialGroups, setOfficialGroups] = useState<any[]>([]);
    const [isOfficialLoading, setIsOfficialLoading] = useState(false);
    const [userTopInterest, setUserTopInterest] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'conversas' | 'hubs'>('conversas');

    // Load user profile for 1-to-1 chat
    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            setActiveGroup(null);
            getProfileById(userId)
                .then(setTargetProfile)
                .finally(() => setIsLoading(false));
        } else if (groupId) {
            // Loading a group directly
            setTargetProfile(null);
        } else {
            setTargetProfile(null);
            setActiveGroup(null);
            setIsRecentLoading(true);
            fetchRecentEntanglements()
                .then(setRecentConversations)
                .finally(() => setIsRecentLoading(false));
        }
    }, [userId, groupId]);

    // Load groups
    useEffect(() => {
        setIsGroupsLoading(true);
        fetchMyGroups().then(res => {
            if (res.data) {
                setMyGroups(res.data);
                // If groupId in URL, open that group
                if (groupId) {
                    const g = res.data.find((g: any) => g.id === groupId);
                    if (g) openGroupChat(g);
                }
            }
        }).finally(() => setIsGroupsLoading(false));
    }, [groupId]);

    // Load official groups and user interest
    useEffect(() => {
        setIsOfficialLoading(true);
        Promise.all([
            fetchOfficialGroups(),
            getUserInterest()
        ]).then(([groupsRes, interest]) => {
            if (groupsRes.data) setOfficialGroups(groupsRes.data);
            if (interest) setUserTopInterest(interest);
        }).finally(() => setIsOfficialLoading(false));
    }, []);

    // Debounced user search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const res = await searchUsersByName(searchQuery);
            if (res.data) setSearchResults(res.data);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounced member search for group creation
    useEffect(() => {
        if (!memberSearchQuery || memberSearchQuery.trim().length < 2) {
            setMemberSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsMemberSearching(true);
            const res = await searchUsersByName(memberSearchQuery);
            if (res.data) {
                // Filter out already-selected members
                const filtered = res.data.filter((u: any) => !selectedMembers.find(m => m.id === u.id));
                setMemberSearchResults(filtered);
            }
            setIsMemberSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [memberSearchQuery, selectedMembers]);

    // Scroll to bottom on new group messages
    useEffect(() => {
        if (groupChatRef.current) {
            groupChatRef.current.scrollTop = groupChatRef.current.scrollHeight;
        }
    }, [groupMessages]);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'pesquisador': return 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30';
            case 'aluno_usp': return 'text-brand-blue bg-brand-blue/10 border-brand-blue/30';
            default: return 'text-brand-red bg-brand-red/10 border-brand-red/30';
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'pesquisador': return 'Pesquisador';
            case 'aluno_usp': return 'Aluno USP';
            default: return 'Curioso';
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length < 2) {
            toast.error('Dê um nome e adicione pelo menos 2 membros.');
            return;
        }
        setIsCreatingGroup(true);
        const res = await createEntangledGroup(newGroupName, selectedMembers.map(m => m.id));
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Grupo criado!');
            setShowCreateGroup(false);
            setNewGroupName('');
            setSelectedMembers([]);
            // Refresh groups
            const groupsRes = await fetchMyGroups();
            if (groupsRes.data) setMyGroups(groupsRes.data);
        }
        setIsCreatingGroup(false);
    };

    const openGroupChat = async (group: any) => {
        setActiveGroup(group);
        setTargetProfile(null);
        setIsLoadingGroupChat(true);
        const msgs = await fetchGroupMessages(group.id);
        setGroupMessages(msgs);
        setIsLoadingGroupChat(false);

        // Realtime subscription for group messages
        const channel = supabase
            .channel(`group:${group.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'group_messages',
                filter: `group_id=eq.${group.id}`
            }, (payload) => {
                setGroupMessages(prev => {
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendGroupMessage = async () => {
        if (!activeGroup || !groupMessage.trim()) return;
        setIsSendingGroupMsg(true);
        const msg = groupMessage;
        setGroupMessage('');
        const res = await sendGroupMessage(activeGroup.id, msg);
        if (res.error) {
            toast.error(res.error);
            setGroupMessage(msg);
        }
        setIsSendingGroupMsg(false);
    };

    const handleJoinGroup = async (groupId: string) => {
        const res = await joinGroup(groupId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Você entrou no hub!');
            // Refresh groups
            fetchMyGroups().then(r => r.data && setMyGroups(r.data));
            // Find the group to open it
            const g = officialGroups.find(og => og.id === groupId);
            if (g) openGroupChat(g);
        }
    };

    return (
        <MainLayoutWrapper 
            userId={userId || undefined} 
            rightSidebar={<EmaranhamentoFeedbackCard />}
        >
            <div className="flex flex-col lg:flex-row gap-8 py-8 h-[calc(100vh-120px)]">
                {/* Mobile Feedback Card */}
                <div className="lg:hidden px-4">
                    <EmaranhamentoFeedbackCard className="mb-4" />
                </div>

                {/* Active Chat Column */}
                <div className="flex-1 flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                            </div>

                        ) : targetProfile ? (
                            /* ====== 1-TO-1 CHAT ====== */
                            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-4 flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[24px] border border-white/5">
                                    {targetProfile.avatar ? (
                                        <img src={targetProfile.avatar} className="size-12 rounded-full object-cover border-2 border-brand-blue" />
                                    ) : (
                                        <div className="size-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{targetProfile.name}</h2>
                                        <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">Conexão Ativa</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <ParticleEntanglement recipientId={targetProfile.id} />
                                </div>
                            </div>

                        ) : activeGroup ? (
                            /* ====== GROUP CHAT ====== */
                            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Group Header */}
                                <div className="mb-4 flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[24px] border border-white/5">
                                    <div className="size-12 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest truncate">{activeGroup.name}</h2>
                                        <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-widest">
                                            {activeGroup.members?.length || 0} membros
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { setActiveGroup(null); window.history.pushState({}, '', '/emaranhamento'); }}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Group Chat Messages */}
                                <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden">
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Grupo Emaranhado</h3>
                                        <span className="material-symbols-outlined text-brand-yellow text-sm">groups</span>
                                    </div>

                                    <div ref={groupChatRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
                                        {isLoadingGroupChat ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="w-6 h-6 text-brand-yellow animate-spin" />
                                            </div>
                                        ) : groupMessages.length > 0 ? (
                                            groupMessages.map((msg) => {
                                                const senderProfile = msg.sender || {};
                                                const displayName = senderProfile.use_nickname && senderProfile.username
                                                    ? senderProfile.username
                                                    : senderProfile.full_name || 'Anônimo';
                                                return (
                                                    <div key={msg.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        {senderProfile.avatar_url ? (
                                                            <img src={senderProfile.avatar_url} className="size-7 rounded-full object-cover shrink-0 mt-0.5" />
                                                        ) : (
                                                            <div className="size-7 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow text-[10px] font-black shrink-0 mt-0.5">
                                                                {displayName[0]}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">{displayName}</span>
                                                            <div className="p-2.5 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-xs text-gray-300 max-w-[85%]">
                                                                {msg.content}
                                                            </div>
                                                            <span className="text-[8px] text-gray-600 mt-0.5 uppercase font-bold tracking-widest">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                                                <Users className="w-8 h-8 mb-2" />
                                                <p className="text-[10px] uppercase font-black tracking-widest">Inicie a conversa do grupo</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Group Input */}
                                    <div className="p-4 bg-black/20">
                                        <div className="flex items-end gap-2">
                                            <textarea
                                                value={groupMessage}
                                                onChange={(e) => setGroupMessage(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendGroupMessage(); } }}
                                                placeholder="Mensagem para o grupo..."
                                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs outline-none focus:border-brand-yellow/30 transition-all resize-none max-h-24 h-10"
                                            />
                                            <button
                                                onClick={handleSendGroupMessage}
                                                disabled={!groupMessage.trim() || isSendingGroupMsg}
                                                className="p-2 bg-brand-yellow text-gray-900 rounded-xl shadow-lg shadow-brand-yellow/20 disabled:opacity-50 min-w-[40px] flex items-center justify-center"
                                            >
                                                {isSendingGroupMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            /* ====== EMPTY STATE: Search + Groups ====== */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 rounded-[32px] border border-dashed border-white/10 overflow-y-auto">
                                <div className="size-20 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl text-brand-blue">hub</span>
                                </div>
                                <h2 className="text-xl font-display font-black text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Interface de Emaranhamento</h2>
                                <p className="text-xs text-gray-500 max-w-sm mb-8 leading-relaxed text-center">
                                    Inicie conexões neurais com outros usuários ou retome uma de suas **Conversas Ativas** abaixo.
                                </p>

                                {/* USER SEARCH */}
                                <div className="w-full max-w-md mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-3 flex items-center gap-2 justify-center">
                                        <Search className="w-3 h-3" /> Buscar Usuário para Emaranhar
                                    </label>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Digite o nome do usuário..."
                                            className="w-full pl-11 pr-10 py-3 rounded-2xl font-mono text-sm bg-white/5 text-white border border-white/10 outline-none focus:border-brand-blue/50 focus:shadow-[0_0_15px_rgba(0,163,255,0.15)] transition-all placeholder:text-gray-500"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {isSearching && <div className="mt-3 flex justify-center"><Loader2 className="w-5 h-5 text-brand-blue animate-spin" /></div>}
                                    {!isSearching && searchResults.length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
                                            {searchResults.map((user) => (
                                                <button key={user.id} onClick={() => window.location.href = `/emaranhamento?userId=${user.id}`}
                                                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-brand-blue/10 rounded-xl border border-white/5 hover:border-brand-blue/30 transition-all text-left group">
                                                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="size-9 rounded-full object-cover" /> : (
                                                        <div className="size-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-xs">{user.full_name?.[0] || '?'}</div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-white truncate group-hover:text-brand-blue transition-colors">
                                                            {user.use_nickname && user.username ? user.username : user.full_name}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getCategoryColor(user.user_category)}`}>
                                                                {getCategoryLabel(user.user_category)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-brand-blue/40 group-hover:text-brand-blue text-xs">→</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                                        <p className="mt-3 text-center text-[10px] text-gray-500 font-mono italic">Nenhum usuário encontrado.</p>
                                    )}
                                </div>

                                {/* GROUPS SECTION */}
                                <div className="w-full max-w-md mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow flex items-center gap-2">
                                            <Users className="w-3 h-3" /> Grupos Emaranhados
                                        </h3>
                                        <button
                                            onClick={() => setShowCreateGroup(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-yellow/10 text-brand-yellow rounded-lg text-[9px] font-black uppercase hover:bg-brand-yellow/20 transition-all"
                                        >
                                            <Plus className="w-3 h-3" /> Criar Grupo
                                        </button>
                                    </div>

                                    {isGroupsLoading ? (
                                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-brand-yellow/30 animate-spin" /></div>
                                    ) : myGroups.length > 0 ? (
                                        <div className="space-y-2">
                                            {myGroups.map((group) => (
                                                <button key={group.id} onClick={() => openGroupChat(group)}
                                                    className={`w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-brand-yellow/10 rounded-2xl border border-white/5 hover:border-brand-yellow/30 transition-all text-left group ${group.is_official ? 'border-l-4 border-l-brand-yellow' : ''}`}>
                                                    <div className={`size-10 rounded-full flex items-center justify-center ${group.is_official ? 'bg-brand-yellow text-gray-900 shadow-[0_0_15px_rgba(255,193,7,0.3)]' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs font-black text-white uppercase truncate group-hover:text-brand-yellow transition-colors">{group.name}</div>
                                                            {group.is_official && <span className="bg-brand-yellow/20 text-brand-yellow text-[8px] px-1 rounded uppercase font-black">Official</span>}
                                                        </div>
                                                        <div className="text-[9px] text-gray-500 mt-0.5 truncate">
                                                            {group.members?.map((m: any) => m.full_name?.split(' ')[0] || '').filter(Boolean).join(', ')}
                                                        </div>
                                                    </div>
                                                    <span className="text-brand-yellow/40 group-hover:text-brand-yellow text-xs">→</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-[10px] text-gray-500 italic py-4">Nenhum grupo ainda. Participe de um Hub ou crie um!</p>
                                    )}
                                </div>

                                {/* OFFICIAL HUBS / PRE-MADE GROUPS */}
                                <div className="w-full max-w-md mb-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-sm">hub</span> Hubs por Foco
                                    </h3>
                                    
                                    {isOfficialLoading ? (
                                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-brand-blue/30 animate-spin" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {officialGroups
                                                .filter(g => !g.name.includes('Ã') && !g.name.includes('Â') && !g.name.includes('ï'))
                                                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                                                .map((group) => {
                                                const matchesUser = userTopInterest && group.focal_isotope && userTopInterest.toLowerCase().includes(group.focal_isotope.toLowerCase());
                                                const isAlreadyMember = myGroups.some(mg => mg.id === group.id);
                                                
                                                return (
                                                    <div 
                                                        key={group.id} 
                                                        className={`flex flex-col p-5 rounded-[32px] border transition-all duration-500 relative overflow-hidden group/hub ${
                                                            matchesUser 
                                                            ? 'bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/30 shadow-[0_0_30px_rgba(0,163,255,0.1)] hover:shadow-[0_0_40px_rgba(0,163,255,0.2)]' 
                                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                                                        }`}
                                                    >
                                                        {matchesUser && (
                                                            <div className="absolute top-0 right-0 px-3 py-1 bg-brand-blue text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-2xl animate-pulse">
                                                                Sugerido por Foco
                                                            </div>
                                                        )}
                                                        
                                                        <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover/hub:scale-110 group-hover/hub:rotate-3 ${
                                                            matchesUser ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-white/10 text-gray-400'
                                                        }`}>
                                                            <span className="material-symbols-outlined text-2xl">
                                                                {group.name.includes('Foto') ? 'photo_camera' : 
                                                                 group.name.includes('Astro') ? 'flare' : 
                                                                 group.name.includes('Educa') ? 'school' : 
                                                                 group.name.includes('Partícula') ? 'blur_on' : 'hub'}
                                                            </span>
                                                        </div>
                                                        
                                                        <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1 group-hover/hub:text-brand-blue transition-colors">
                                                            {group.name}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mb-4 opacity-80 group-hover/hub:opacity-100 transition-opacity">
                                                            {group.description}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Atividade</span>
                                                                <span className="text-[10px] font-bold text-brand-blue">{group.memberCount} Conexões</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => isAlreadyMember ? openGroupChat(group) : handleJoinGroup(group.id)}
                                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                    isAlreadyMember 
                                                                    ? 'bg-white/10 text-white hover:bg-white/20' 
                                                                    : 'bg-brand-blue text-white hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] hover:scale-105 active:scale-95'
                                                                }`}
                                                            >
                                                                {isAlreadyMember ? 'Participar' : 'Entrar no Hub'}
                                                            </button>
                                                        </div>

                                                        {/* Decorative Background Elements */}
                                                        {matchesUser && (
                                                            <div className="absolute -bottom-4 -right-4 size-20 bg-brand-blue/10 blur-2xl rounded-full" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Recent 1-to-1 Conversations */}
                                {isRecentLoading ? (
                                    <Loader2 className="w-6 h-6 text-brand-blue/20 animate-spin" />
                                ) : recentConversations.length > 0 ? (
                                    <div className="w-full max-w-md space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-4 text-center">Conversas 1-a-1 Ativas</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {recentConversations.map((conv) => (
                                                <button key={conv.id} onClick={() => window.location.href = `/emaranhamento?userId=${conv.id}`}
                                                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left">
                                                    <div className="shrink-0 relative">
                                                        {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="size-10 rounded-full object-cover" /> : (
                                                            <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase">{conv.name[0]}</div>
                                                        )}
                                                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-brand-blue border-2 border-[#1E1E1E] rounded-full" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-xs font-black text-white uppercase truncate">{conv.name}</span>
                                                        <span className="text-[10px] text-gray-400 italic truncate opacity-80">{conv.lastMessage || conv.handle}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-brand-blue/40 text-sm">arrow_forward</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : !searchQuery && myGroups.length === 0 && (
                                    <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-brand-blue text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-brand-blue/20">
                                        Voltar ao Fluxo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* CREATE GROUP MODAL */}
                {showCreateGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1E1E1E] rounded-[32px] border border-white/10 w-full max-w-md p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black uppercase tracking-widest text-brand-yellow flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Criar Grupo Emaranhado
                                </h2>
                                <button onClick={() => { setShowCreateGroup(false); setSelectedMembers([]); setNewGroupName(''); }}
                                    className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Group Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome do Grupo</label>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Ex: Estudo de Óptica"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-yellow/50 transition-all placeholder:text-gray-500"
                                />
                            </div>

                            {/* Member Search */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Adicionar Membros ({selectedMembers.length} selecionados)
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        placeholder="Buscar por nome..."
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-brand-yellow/50 transition-all placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Member Search Results */}
                                {isMemberSearching && <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 text-brand-yellow animate-spin" /></div>}
                                {!isMemberSearching && memberSearchResults.length > 0 && (
                                    <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                        {memberSearchResults.map((user) => (
                                            <button key={user.id} onClick={() => { setSelectedMembers(prev => [...prev, user]); setMemberSearchQuery(''); setMemberSearchResults([]); }}
                                                className="w-full flex items-center gap-2 p-2 bg-white/5 hover:bg-brand-yellow/10 rounded-lg text-left transition-all">
                                                <div className="size-7 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow text-[10px] font-black">
                                                    {user.full_name?.[0] || '?'}
                                                </div>
                                                <span className="text-xs text-white font-bold truncate">{user.full_name}</span>
                                                <Plus className="w-3 h-3 text-brand-yellow ml-auto" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Selected Members */}
                                {selectedMembers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedMembers.map((m) => (
                                            <span key={m.id} className="flex items-center gap-1.5 px-3 py-1 bg-brand-yellow/10 text-brand-yellow rounded-full text-[10px] font-bold">
                                                {m.full_name?.split(' ')[0]}
                                                <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateGroup}
                                disabled={isCreatingGroup || !newGroupName.trim() || selectedMembers.length < 2}
                                className="w-full py-3 bg-brand-yellow text-gray-900 font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                                {isCreatingGroup ? 'Criando...' : 'Criar Grupo'}
                            </button>
                        </div>
                    </div>
                )}
            </MainLayoutWrapper>
    );
}
