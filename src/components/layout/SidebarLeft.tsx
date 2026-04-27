'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {

    Megaphone,
    Network,
    BookOpen,
    Route,
    HelpCircle,
    UserSearch,
    Map,
    ShieldAlert,
    MessageSquare,
    MessageCircle,
    Mail,
    Sparkles,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { AppRoutes } from '@/types/navigation';
import { fetchRecentEntanglements } from '@/app/actions/submissions';
import { Avatar } from '../ui/Avatar';
import { supabase } from '@/lib/supabase';
import { useTelemetry } from '@/hooks/useTelemetry';
import { ColisorIcon } from '../icons/ColisorIcon';
import { useNavigationStore } from '@/store/useNavigationStore';

const mainLinks = [
    { name: 'Comunidade', href: '/', icon: <span className="material-symbols-outlined text-2xl">groups</span>, color: 'brand-red' },
    { name: 'GCIME', href: '/gcime', icon: <ColisorIcon className="w-6 h-6" />, color: 'brand-blue' },
    { name: 'hub-ime', href: '/hub-ime', icon: <span className="material-symbols-outlined text-2xl">info</span>, color: 'brand-yellow' },
];

const categoryLinks = [
    { name: 'Ferramentas Acadêmicas', href: '/ferramentas', icon: <span className="material-symbols-outlined text-2xl">construction</span>, color: 'brand-red', role: 'aluno_usp' },
    { name: 'Como Ingressar', href: '/ingresso', icon: <span className="material-symbols-outlined text-2xl">login</span>, color: 'brand-yellow', role: 'curioso' },
    { name: 'Observatório de Pesquisa', href: '/arena', icon: <span className="material-symbols-outlined text-2xl">visibility</span>, color: 'brand-red', role: 'pesquisador' },
];

const secondaryLinks = [
    { name: 'Painel Admin', href: '/admin', icon: <ShieldAlert className="w-5 h-5" /> },
];

export const SidebarLeft = ({ userId }: { userId?: string }) => {
    const pathname = usePathname();
    const { isSidebarCollapsed, setSidebarCollapsed } = useNavigationStore();
    const [recentEntanglements, setRecentEntanglements] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [userCategory, setUserCategory] = React.useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const { trackEvent } = useTelemetry();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const loadSidebarData = async () => {
        setIsLoading(true);
        try {
            // Fetch entanglements independently
            const entanglements = await fetchRecentEntanglements();
            setRecentEntanglements(entanglements);

            // Robust Profile Fetching
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = userId || session?.user.id;
            const userEmail = session?.user.email;

            if (currentUserId) {
                setIsLoggedIn(true);
                const { data: profileData } = await supabase.from('profiles')
                    .select('user_category, is_usp_member')
                    .eq('id', currentUserId)
                    .single();
                
                const category = profileData?.user_category;
                const isUspMember = profileData?.is_usp_member || userEmail?.endsWith('@usp.br') || userEmail?.endsWith('@ime.usp.br') || userEmail?.endsWith('@ime.usp.br');
                
                if (['pesquisador', 'docente_pesquisador'].includes(category)) {
                    setUserCategory('pesquisador');
                } else if (isUspMember || ['aluno_usp', 'licenciatura', 'bacharelado', 'pos_graduacao'].includes(category)) {
                    setUserCategory('aluno_usp');
                } else {
                    setUserCategory('curioso');
                }
            } else {
                // Visitante deslogado -> Pode ver ingresso ou curioso
                setIsLoggedIn(false);
                setUserCategory('curioso');
            }
        } catch (error) {
            console.error('[Sidebar] Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        loadSidebarData();

        // Listen for new messages to update the recent list
        const channel = supabase
            .channel('sidebar_entanglements')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                loadSidebarData();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, () => {
                loadSidebarData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Color mapper for consistent UI architecture
    const colorMap: Record<string, { bg: string; text: string; border: string; hoverBorder: string }> = {
        'brand-blue': { bg: 'bg-brand-blue/10', text: 'text-brand-blue', border: 'border-l-brand-blue', hoverBorder: 'hover:border-l-brand-blue' },
        'brand-red': { bg: 'bg-brand-red/10', text: 'text-brand-red', border: 'border-l-brand-red', hoverBorder: 'hover:border-l-brand-red' },
        'brand-yellow': { bg: 'bg-brand-yellow/10', text: 'text-brand-yellow', border: 'border-l-brand-yellow', hoverBorder: 'hover:border-l-brand-yellow' },
    };

    if (!mounted) return null;

    return (
        <div className={`w-full h-full flex flex-col gap-2 py-6 ${isSidebarCollapsed ? 'px-2' : 'px-4'} overflow-x-hidden relative transition-all duration-300`}>
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className={`absolute top-4 ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'} z-50 p-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 hover:text-brand-blue transition-all shadow-sm`}
                title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Primary Navigation */}
            <nav className={`flex flex-col gap-1 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                {/* Main Links - Rendered instantly (SSR Friendly) */}
                {mainLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const c = colorMap[link.color] || colorMap['brand-blue'];
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => trackEvent('TAB_CHANGE', { tab: link.name, href: link.href })}
                            className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 transition-all group border-l-[3px] rounded-r-xl ${isActive
                                ? `${c.bg} ${c.text} ${c.border}`
                                : `border-l-transparent ${c.hoverBorder} text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white`
                                }`}
                        >
                            <span className={`transition-transform group-hover:scale-110 ${isActive ? c.text : ''}`}>
                                {link.icon}
                            </span>
                            {!isSidebarCollapsed && (
                                <span className={`font-bold text-base ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                                    {link.name}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Category-Specific Links - Optimistic Rendering for SSR */}
                {categoryLinks
                    .filter(l => {
                        // Always show if it's the active path (prevents layout jump during hydration)
                        if (pathname.startsWith(l.href)) return true;
                        // During loading, we don't know the role, so we hide non-active ones to avoid "flashing" incorrect roles
                        if (isLoading) return false;
                        // Finally, show if role matches
                        return l.role === userCategory;
                    })
                    .map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        const isGuest = !isLoggedIn;
                        const displayName = (isGuest && link.role === 'curioso') ? 'Acesso ao Hub' : link.name;
                        const displayHref = (isGuest && link.role === 'curioso') ? '/login' : link.href;
                        const c = colorMap[link.color] || colorMap['brand-blue'];

                        return (
                            <Link
                                key={link.href}
                                href={displayHref}
                                onClick={() => trackEvent('TAB_CHANGE', { tab: displayName, href: displayHref })}
                                className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 transition-all group border-l-[3px] rounded-r-xl ${isActive
                                    ? `${c.bg} ${c.text} ${c.border}`
                                    : `border-l-transparent ${c.hoverBorder} text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white`
                                    }`}
                            >
                                <span className={`transition-transform group-hover:scale-110 ${isActive ? c.text : ''}`}>
                                    {link.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className={`font-bold text-base ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                                        {displayName}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                {/* Loading Skeleton if profile is still being determined */}
                {isLoading && (
                    <div className={`flex flex-col gap-1 mt-1 ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}>
                        <div className={`${isSidebarCollapsed ? 'h-10 w-10' : 'h-10 w-full'} bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse`} />
                    </div>
                )}

                <div className={`h-px bg-gray-100 dark:bg-white/5 my-2 ${isSidebarCollapsed ? 'mx-0 w-8' : 'mx-4'}`} />
            </nav>

            {/* Interaction Section */}
            <div className={`mt-4 flex flex-col gap-1 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                <Link
                    href="/interacao?tab=emaranhamento"
                    onClick={() => trackEvent('TAB_CHANGE', { tab: 'Central de Interações', hub: 'sidebar' })}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 transition-all group border-l-[3px] rounded-r-xl ${pathname.startsWith('/interacao') 
                        ? 'bg-brand-blue/10 text-brand-blue border-l-brand-blue' 
                        : 'border-l-transparent hover:border-l-brand-blue text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${pathname.startsWith('/interacao') ? 'text-brand-blue' : ''}`}>hub</span>
                    {!isSidebarCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className={`font-bold text-sm ${pathname.startsWith('/interacao') ? 'text-gray-900 dark:text-white' : ''}`}>Central de Interações</span>
                            <span className="text-[9px] opacity-60 uppercase tracking-wider font-bold truncate">Nexus de Conexões</span>
                        </div>
                    )}
                </Link>

                {/* Quick Access Buttons */}
                {!isSidebarCollapsed && (
                    <div className="px-6 my-2">
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/lab"
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/5 hover:border-brand-blue/30 transition-all text-center group shadow-sm dark:shadow-none"
                            >
                                <span className="material-symbols-outlined text-lg text-brand-blue mb-1">person</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Laboratório</span>
                            </Link>
                            <Link
                                href="/perguntas"
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/5 hover:border-brand-blue/30 transition-all text-center group shadow-sm dark:shadow-none"
                            >
                                <span className="material-symbols-outlined text-lg text-brand-blue mb-1">quiz</span>
                                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">Pergunte</span>
                            </Link>
                        </div>
                    </div>
                )}

                <div className={`flex flex-col mt-2 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                    <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ${isSidebarCollapsed ? 'hidden' : 'px-5'}`}>Partículas Emaranhadas</h2>
                    <div className="space-y-1">
                        {isLoading && recentEntanglements.length === 0 ? (
                            // Robust Profile Skeleton as requested by user
                            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-3 px-6'} py-3 animate-pulse`}>
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 shrink-0" />
                                {!isSidebarCollapsed && (
                                    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                                        <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/5 rounded-full" />
                                        <div className="h-2 w-1/2 bg-gray-100 dark:bg-white/5 rounded-full opacity-60" />
                                    </div>
                                )}
                            </div>
                        ) : recentEntanglements.length > 0 ? (
                            <>
                                {recentEntanglements.map((profile) => (
                                    <Link
                                        key={profile.id}
                                        href={`/emaranhamento?userId=${profile.id}`}
                                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-3 px-6'} py-2 transition-all group relative border-l-[3px] border-l-transparent rounded-r-xl hover:border-white/5 ${pathname === '/emaranhamento' && userId === profile.id ? 'bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                    >
                                        <Avatar
                                            src={profile.avatar}
                                            name={profile.name}
                                            size="md"
                                            className="border border-white/10 shrink-0"
                                            xp={profile.xp}
                                            level={profile.level}
                                        />
                                        <div className={`absolute ${isSidebarCollapsed ? 'bottom-2 right-2' : 'bottom-2 left-12'} size-3 bg-brand-blue border-2 border-white dark:border-[#121212] rounded-full`} />
                                        {!isSidebarCollapsed && (
                                            <div className="flex flex-col overflow-hidden min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile.name}</span>
                                                    {profile.lastAt && (
                                                        <span className="text-[8px] text-gray-500 font-bold shrink-0">
                                                            {new Date(profile.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-medium truncate italic opacity-80 group-hover:opacity-100">
                                                    {profile.lastMessage || profile.handle}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                                {!isSidebarCollapsed && (
                                    <Link href="/emaranhamento" className="mx-6 mt-3 flex items-center justify-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-brand-blue/10 text-gray-500 hover:text-brand-blue transition-colors text-xs font-bold">
                                        <span className="material-symbols-outlined text-[16px]">forum</span>
                                        Ir para o Emaranhamento
                                    </Link>
                                )}
                            </>
                        ) : (
                            <Link href="/emaranhamento" className={`mx-auto flex flex-col items-center gap-1.5 ${isSidebarCollapsed ? 'w-12 h-12 justify-center border-0 p-0' : 'mx-5 px-4 py-4 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl'} hover:border-brand-blue/40 hover:bg-brand-blue/5 transition-all text-center cursor-pointer group`}>
                                <MessageSquare className={`w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors ${isSidebarCollapsed ? 'w-5 h-5' : ''}`} />
                                {!isSidebarCollapsed && (
                                    <>
                                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-widest transition-colors">Sem conexões ativas</span>
                                        <span className="text-[10px] text-brand-blue font-medium opacity-70 group-hover:opacity-100 transition-opacity">Iniciar emaranhamento →</span>
                                    </>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Suporte e Dúvidas */}
            <div className={`mt-auto mb-2 flex flex-col pt-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ${isSidebarCollapsed ? 'hidden' : 'px-5'}`}>Suporte do hub</h2>
                <div className="flex flex-col gap-1">
                    <a href="https://wa.me/5511968401823" target="_blank" rel="noopener noreferrer" className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 text-sm text-gray-500 hover:bg-brand-yellow/10 hover:text-[#FFCC00] transition-colors group border-l-[3px] border-l-transparent rounded-r-xl`}>
                        <MessageCircle className="w-5 h-5 opacity-60 group-hover:opacity-100 shrink-0" />
                        {!isSidebarCollapsed && <span className="font-bold">WhatsApp Direto</span>}
                    </a>
                    <a href="mailto:joaopaulostangorlini@usp.br" className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 text-sm text-gray-500 hover:bg-brand-red/10 hover:text-brand-red transition-colors group border-l-[3px] border-l-transparent rounded-r-xl`}>
                        <MessageSquare className="w-5 h-5 opacity-60 group-hover:opacity-100 shrink-0" />
                        {!isSidebarCollapsed && <span className="font-bold">Enviar e-mail</span>}
                    </a>
                </div>
            </div>

            {/* Secondary/Institutional Links */}
            <nav className={`border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col gap-1 relative z-20 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                {secondaryLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'gap-4 px-6'} py-3 text-sm text-gray-500 hover:text-brand-blue transition-colors group border-l-[3px] border-l-transparent rounded-r-xl`}
                    >
                        <span className="opacity-60 group-hover:opacity-100 shrink-0">
                            {link.icon}
                        </span>
                        {!isSidebarCollapsed && <span className="font-medium">{link.name}</span>}
                    </Link>
                ))}
            </nav>
        </div>
    );
};
