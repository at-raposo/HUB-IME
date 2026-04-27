'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProfileById, fetchRecentEntanglements } from '@/app/actions/submissions';
import { searchUsersByName } from '@/app/actions/profiles';
import { createEntangledGroup, fetchMyGroups, fetchGroupMessages, sendGroupMessage, fetchRecommendedGroups, joinGroup } from '@/app/actions/groups';
import { getUserInterest } from '@/app/actions/recommendations';
import { ParticleEntanglement } from '@/components/engagement/ParticleEntanglement';
import { Avatar } from '@/components/ui/Avatar';
import { User, Loader2, Search, X, Users, Plus, Send, ShieldCheck, MessageSquare, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export function EmaranhamentoTabContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userIdUrl = searchParams.get('userId') || searchParams.get('userID');
    const groupIdUrl = searchParams.get('groupId');

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
    const [officialGroups, setOfficialGroups] = useState<any[]>([]);
    const [isGroupsLoading, setIsGroupsLoading] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
    const [isMemberSearching, setIsMemberSearching] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    
    // Focus/Isotope state
    const [userFocus, setUserFocus] = useState<string | null>(null);
    const [recommendedGroups, setRecommendedGroups] = useState<any[]>([]);
    const [groupFocus, setGroupFocus] = useState('');

    // Active group chat
    const [activeGroup, setActiveGroup] = useState<any>(null);
    const [groupMessages, setGroupMessages] = useState<any[]>([]);
    const [groupMessage, setGroupMessage] = useState('');
    const [isSendingGroupMsg, setIsSendingGroupMsg] = useState(false);
    const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
    const groupChatRef = useRef<HTMLDivElement>(null);

    // Load initial user data
    useEffect(() => {
        getUserInterest().then(setUserFocus);
        fetchRecommendedGroups().then(r => r.data && setRecommendedGroups(r.data));
    }, []);

    // Load initial data and setup realtime
    useEffect(() => {
        const loadRecent = async () => {
            setIsRecentLoading(true);
            const data = await fetchRecentEntanglements();
            setRecentConversations(data || []);
            setIsRecentLoading(false);
        };

        if (userIdUrl) {
            setIsLoading(true);
            setActiveGroup(null);
            getProfileById(userIdUrl).then(setTargetProfile).finally(() => setIsLoading(false));
        } else if (groupIdUrl) {
            // Handled in group effect
        } else {
            setTargetProfile(null);
            setActiveGroup(null);
            loadRecent();
        }

        // Realtime for ALL interactions (1-to-1, Groups, New Memberships)
        const channel = supabase
            .channel('emaranhamento_global_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                loadRecent();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, () => {
                (async () => {
                   const data = await fetchRecentEntanglements();
                   setRecentConversations(data || []);
                })();
                if (activeGroup) {
                   fetchGroupMessages(activeGroup.id).then(setGroupMessages);
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'entangled_groups' }, () => {
                fetchMyGroups().then(res => res.data && setMyGroups(res.data));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'entangled_group_members' }, () => {
                fetchMyGroups().then(res => res.data && setMyGroups(res.data));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userIdUrl, groupIdUrl, activeGroup]);

    // Load groups
    useEffect(() => {
        const loadGroups = async () => {
            setIsGroupsLoading(true);
            const res = await fetchMyGroups();
            if (res.data) {
                setMyGroups(res.data);
                if (groupIdUrl) {
                    const g = res.data.find((g: any) => g.id === groupIdUrl);
                    if (g) openGroupChat(g);
                }
            }
            setIsGroupsLoading(false);
        };
        loadGroups();
    }, [groupIdUrl]);

    // Search users for 1-to-1
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

    // Search members for group
    useEffect(() => {
        if (!memberSearchQuery || memberSearchQuery.trim().length < 2) {
            setMemberSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsMemberSearching(true);
            const res = await searchUsersByName(memberSearchQuery);
            if (res.data) {
                const filtered = res.data.filter((u: any) => !selectedMembers.find(m => m.id === u.id));
                setMemberSearchResults(filtered);
            }
            setIsMemberSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [memberSearchQuery, selectedMembers]);

    const openGroupChat = async (group: any) => {
        setActiveGroup(group);
        setTargetProfile(null);
        setIsLoadingGroupChat(true);
        const msgs = await fetchGroupMessages(group.id);
        setGroupMessages(msgs);
        setIsLoadingGroupChat(false);
    };

    const handleSendGroupMessage = async () => {
        if (!activeGroup || !groupMessage.trim()) return;
        setIsSendingGroupMsg(true);
        const res = await sendGroupMessage(activeGroup.id, groupMessage);
        if (!res.error) setGroupMessage('');
        setIsSendingGroupMsg(false);
        const msgs = await fetchGroupMessages(activeGroup.id);
        setGroupMessages(msgs);
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedMembers.length < 2) {
            toast.error('Dê um nome e adicione pelo menos 2 membros.');
            return;
        }
        setIsCreatingGroup(true);
        const res = await createEntangledGroup(newGroupName, selectedMembers.map(m => m.id), groupFocus || userFocus || undefined);
        if (!res.error) {
            toast.success('Grupo criado!');
            setShowCreateGroup(false);
            setNewGroupName('');
            setSelectedMembers([]);
            setGroupFocus('');
            fetchMyGroups().then(r => r.data && setMyGroups(r.data));
        } else {
            toast.error(res.error);
        }
        setIsCreatingGroup(false);
    };

    const getChatView = () => {
        if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

        if (targetProfile) {
            return (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        {targetProfile.avatar_url || targetProfile.avatar ? <img src={targetProfile.avatar_url || targetProfile.avatar} className="size-10 rounded-full object-cover" /> : <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase">{targetProfile.full_name?.[0] || targetProfile.name?.[0]}</div>}
                        <div className="flex flex-col">
                            <h3 className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-widest">{targetProfile.full_name || targetProfile.name}</h3>
                            <span className="text-[10px] text-brand-blue font-black uppercase">Conexão Ativa</span>
                        </div>
                        <button onClick={() => setTargetProfile(null)} className="ml-auto text-gray-500 hover:text-gray-900 dark:text-white transition-colors"><X className="size-4" /></button>
                    </div>
                    <div className="h-[600px] bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                        <ParticleEntanglement recipientId={targetProfile.id} />
                    </div>
                </div>
            );
        }

        if (activeGroup) {
            return (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className="size-10 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow"><Users className="size-5" /></div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-black uppercase text-gray-900 dark:text-white tracking-widest truncate">{activeGroup.name}</h3>
                            <span className="text-[10px] text-brand-yellow font-black uppercase">{activeGroup.members?.length || 0} Membros</span>
                        </div>
                        <button onClick={() => setActiveGroup(null)} className="text-gray-500 hover:text-gray-900 dark:text-white transition-colors"><X className="size-4" /></button>
                    </div>
                    <div className="h-[600px] flex flex-col bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={groupChatRef}>
                            {groupMessages.map(msg => (
                                <div key={msg.id} className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase text-brand-yellow mb-1">{msg.sender?.full_name || msg.sender?.username || 'Usuário'}</span>
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-gray-200 dark:border-white/5 max-w-[85%] text-[13px] text-gray-700 dark:text-gray-100 leading-relaxed shadow-sm dark:shadow-none">
                                        {msg.content}
                                    </div>
                                    <span className="text-[7px] text-gray-500 mt-1 uppercase font-bold">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                </div>
                            ))}
                            {groupMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-30">
                                    <Users className="size-12 mb-4" />
                                    <p className="text-[10px] uppercase font-black tracking-widest">Silêncio no núcleo...</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex gap-2">
                             <input 
                                value={groupMessage} 
                                onChange={e => setGroupMessage(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleSendGroupMessage()} 
                                placeholder="Transmitir para o núcleo..." 
                                className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-yellow/50 transition-all" 
                             />
                             <button onClick={handleSendGroupMessage} className="size-11 bg-brand-yellow text-gray-900 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-yellow/10">
                                <Send className="size-5" />
                             </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-12 pb-20">
                {/* Search & Intro */}
                <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                    <div className="size-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6 shadow-2xl shadow-brand-blue/10 border border-brand-blue/20">
                        <span className="material-symbols-outlined text-4xl text-brand-blue">hub</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Nexus de Emaranhamento</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] leading-relaxed max-w-xs">Inicie conexões síncronas entre membros da rede Lab-Div.</p>
                    
                    <div className="w-full mt-10 relative group">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-brand-blue transition-colors" />
                         <input 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder="BUSCAR PARTÍCULA POR NOME..." 
                            className="w-full pl-14 pr-4 py-5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 dark:text-white outline-none focus:border-brand-blue/50 focus:bg-white/10 transition-all placeholder:text-gray-700" 
                         />
                         {isSearching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-blue" />}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="w-full mt-4 space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                            {searchResults.map(user => (
                                <button key={user.id} onClick={() => setTargetProfile({ id: user.id, full_name: user.full_name, avatar_url: user.avatar_url })} className="w-full flex items-center gap-3 p-4 bg-white dark:bg-white/5 hover:bg-brand-blue/20 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none transition-all group text-left">
                                    <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-xs border border-brand-blue/20">{user.full_name?.[0]}</div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black uppercase text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">{user.full_name}</span>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{user.username ? `@${user.username}` : 'Membro'}</span>
                                    </div>
                                    <ArrowRight className="ml-auto size-4 text-brand-blue/40 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendations Section */}
                {!targetProfile && !activeGroup && recommendedGroups.length > 0 && (
                    <div className="space-y-6 animate-in fade-in duration-1000">
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-brand-yellow/20" />
                            <h4 className="text-[10px] font-black uppercase text-brand-yellow flex items-center gap-2 tracking-widest">
                                <Star className="size-3 animate-pulse fill-brand-yellow/40" />
                                Sugestões de Foco: {userFocus}
                            </h4>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-brand-yellow/20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedGroups.map(group => (
                                <button key={group.id} onClick={() => openGroupChat(group)} className="flex items-center gap-4 p-5 bg-brand-yellow/5 border border-brand-yellow/10 rounded-3xl hover:bg-brand-yellow/10 hover:border-brand-yellow/30 transition-all text-left group">
                                    <div className="size-12 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow font-black uppercase shadow-inner border border-brand-yellow/20 group-hover:scale-110 transition-transform">{group.name[0]}</div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{group.name}</h5>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[8px] font-bold text-brand-yellow uppercase tracking-widest">{group.memberCount} Mãos</span>
                                            <div className="size-1 rounded-full bg-brand-yellow/30" />
                                            <span className="text-[8px] font-bold text-gray-500 uppercase">Público</span>
                                        </div>
                                    </div>
                                    <Plus className="size-4 text-brand-yellow group-hover:rotate-90 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-12">
                     {/* Groups */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none pb-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-yellow flex items-center gap-3">
                                <Users className="size-4" /> Meus Núcleos
                            </h3>
                            <button onClick={() => setShowCreateGroup(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-yellow/10 text-brand-yellow rounded-xl text-[9px] font-black uppercase hover:bg-brand-yellow/20 active:scale-95 transition-all border border-brand-yellow/10">
                                <Plus className="size-3" /> Novo
                            </button>
                        </div>
                        {isGroupsLoading ? (
                             <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-20 bg-white dark:bg-white/5 animate-pulse rounded-2xl" />)}
                             </div>
                        ) : myGroups.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {myGroups.map(g => (
                                    <button key={g.id} onClick={() => openGroupChat(g)} className="w-full p-5 bg-white dark:bg-white/5 hover:bg-brand-yellow/5 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none hover:border-brand-yellow/20 rounded-3xl transition-all flex items-center gap-4 text-left group">
                                        <div className="size-11 rounded-2xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow transition-colors group-hover:bg-brand-yellow/20"><Users className="size-5" /></div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[11px] font-black uppercase text-gray-900 dark:text-white truncate mb-0.5">{g.name}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">{g.members?.length || 0} Membros ativos</div>
                                        </div>
                                        <span className="material-symbols-outlined text-brand-yellow/40 group-hover:translate-x-2 transition-transform">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 opacity-50">
                                <Users className="size-8 mb-4 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nenhum núcleo formado.</p>
                            </div>
                        )}
                     </div>

                     {/* 1-to-1 Conversations */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none pb-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-blue flex items-center gap-3">
                                <span className="material-symbols-outlined text-lg">hub</span> Partículas Ativas
                            </h3>
                        </div>
                        {isRecentLoading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-20 bg-white dark:bg-white/5 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : recentConversations.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {recentConversations.map(conv => (
                                    <button key={conv.id} onClick={() => setTargetProfile({ id: conv.id, full_name: conv.name, avatar_url: conv.avatar })} className="w-full p-5 bg-white dark:bg-white/5 hover:bg-brand-blue/5 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none hover:border-brand-blue/20 rounded-3xl transition-all flex items-center gap-4 text-left group">
                                        <Avatar src={conv.avatar} name={conv.name} size="custom" customSize="size-11" className="shrink-0" xp={conv.xp} level={conv.level} />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[11px] font-black uppercase text-gray-900 dark:text-white truncate mb-0.5">{conv.name}</div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase truncate">{conv.lastMessage || 'Conexão estável'}</div>
                                        </div>
                                        <span className="material-symbols-outlined text-brand-blue/40 group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 opacity-50">
                                <Send className="size-8 mb-4 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nenhuma conversa recente.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {getChatView()}

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                     <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-[40px] w-full max-w-md p-10 space-y-8 shadow-2xl relative">
                        <button onClick={() => setShowCreateGroup(false)} className="absolute right-8 top-8 text-gray-500 hover:text-gray-900 dark:text-white transition-colors p-2 hover:bg-white dark:bg-white/5 rounded-full"><X className="size-6" /></button>
                        
                        <div className="text-center space-y-2">
                             <div className="size-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow mx-auto mb-4 border border-brand-yellow/20"><Plus className="size-6" /></div>
                             <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white tracking-widest">Estruturar Núcleo</h3>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Defina os parâmetros do novo grupo emaranhado</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Nome do Núcleo</label>
                                <input 
                                    value={newGroupName} 
                                    onChange={e => setNewGroupName(e.target.value)} 
                                    placeholder="Ex: GRUPO DE ESTUDOS QUÂNTICOS" 
                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-yellow/50 focus:bg-white/10 transition-all uppercase placeholder:text-gray-700" 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">
                                    Foco Acadêmico
                                    {userFocus && <span className="text-brand-yellow/60 ml-2">(Sugerido: {userFocus})</span>}
                                </label>
                                <input 
                                    value={groupFocus} 
                                    onChange={e => setGroupFocus(e.target.value)} 
                                    placeholder={userFocus || "EX: CÁLCULO, PARTÍCULAS..."} 
                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-xs text-gray-900 dark:text-white outline-none focus:border-brand-yellow/50 focus:bg-white/10 transition-all uppercase placeholder:text-gray-700" 
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Adicionar Membros ({selectedMembers.length}/10)</label>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-brand-yellow transition-colors" />
                                    <input 
                                        value={memberSearchQuery} 
                                        onChange={e => setMemberSearchQuery(e.target.value)} 
                                        placeholder="BUSCAR NOME..." 
                                        className="w-full pl-14 pr-4 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-900 dark:text-white outline-none focus:border-brand-yellow/50 focus:bg-white/10 transition-all placeholder:text-gray-700" 
                                    />
                                    {isMemberSearching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-yellow" />}
                                </div>
                                
                                {memberSearchResults.length > 0 && (
                                    <div className="max-h-[150px] overflow-y-auto mt-2 space-y-1 pr-1 scrollbar-hide animate-in slide-in-from-top-2">
                                        {memberSearchResults.map(m => (
                                            <button key={m.id} onClick={() => { setSelectedMembers(prev => [...prev, m]); setMemberSearchQuery(''); setMemberSearchResults([]); }} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-white/5 hover:bg-brand-yellow/10 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-xl text-left group">
                                                <div className="size-8 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow font-black uppercase text-[10px]">{m.full_name?.[0]}</div>
                                                <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase group-hover:text-brand-yellow transition-colors">{m.full_name}</span>
                                                <Plus className="size-4 text-brand-yellow ml-auto" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {selectedMembers.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-brand-yellow/10 text-brand-yellow rounded-xl text-[9px] font-black uppercase border border-brand-yellow/20 animate-in zoom-in-50">
                                            {m.full_name.split(' ')[0]}
                                            <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))} className="hover:text-gray-900 dark:text-white transition-colors"><X className="size-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={handleCreateGroup} 
                                    disabled={isCreatingGroup || !newGroupName.trim() || selectedMembers.length < 2} 
                                    className="w-full py-5 bg-brand-yellow text-gray-900 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-brand-yellow/10 disabled:opacity-30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {isCreatingGroup ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            ESTRUTURANDO NÚCLEO...
                                        </>
                                    ) : 'CRIAR NÚCLEO'}
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
