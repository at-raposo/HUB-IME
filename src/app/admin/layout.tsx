'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/actions/auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Apply admin-page class to body for special background styling
    React.useEffect(() => {
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, []);

    const [role, setRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchRole = async () => {
            const { createClientSupabase } = await import('@/lib/supabase/client');
            const supabase = createClientSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'user');
            }
        };
        fetchRole();
    }, []);

    const navLinks = [
        { name: 'Torre de Controle', href: '/admin', icon: 'security' },
        { name: 'Central de Notificações', href: '/admin/notificacoes', icon: 'notifications' },
        { name: 'Moderação do Fluxo', href: '/admin/moderacao', icon: 'verified_user' },
        { name: 'Arena de Desafios', href: '/admin/desafios', icon: 'emoji_events' },
        { name: 'Aprovação de Perfis', href: '/admin/profiles', icon: 'manage_accounts', adminOnly: true },
        { name: 'Validação do Match', href: '/admin/adocoes', icon: 'favorite' },
        { name: 'Pergunte a um Cientista', href: '/admin/perguntas', icon: 'quiz' },
        { name: 'Central de Anomalias', href: '/admin/reports', icon: 'bug_report' },
        { name: 'Trilhas de Aprendizagem', href: '/admin/trilhas', icon: 'route', adminOnly: true },
        { name: 'Oportunidades', href: '/admin/oportunidades', icon: 'event' },
        { name: 'Logs do USP', href: '/admin/drops', icon: 'forum' },
        { name: 'Configurações Admin', href: '/admin/config', icon: 'admin_panel_settings', adminOnly: true },
    ];

    const filteredLinks = navLinks.filter(link => !link.adminOnly || role === 'admin');


    return (
        <div className="bg-transparent text-gray-900 dark:text-gray-100 font-sans antialiased min-h-screen flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-neutral-900 text-white p-4 flex items-center justify-between border-b border-gray-800 z-[60]">
                <div className="flex items-center gap-2">
                    <Link 
                        href="/"
                        className="p-2 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                        aria-label="Sair do Admin"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                    </Link>
                    <div className="font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0055ff]">security</span>
                        Admin<span className="text-brand-yellow">Panel</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-gray-800 rounded-lg focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 bg-neutral-900 border-r border-gray-800 flex-col justify-between shrink-0 h-[calc(100vh-73px)] md:h-screen overflow-hidden md:sticky top-0 absolute inset-x-0 bottom-0 z-50 md:z-40 transition-colors shadow-2xl`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055ff]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-red/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                <div className="flex flex-col gap-4 p-6 relative z-10">
                    <div className="flex items-center gap-3 pb-6 border-b border-gray-800 transition-colors">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <div className="absolute w-6 h-7 bg-[#0055ff] rounded-[1px] top-0 left-0 z-0"></div>
                                <div className="absolute w-6 h-7 bg-brand-red rounded-[1px] bottom-0 right-0 z-0 translate-y-1"></div>
                                <div className="absolute w-6 h-6 bg-brand-yellow rounded-full top-2 left-2 z-20 shadow-sm border border-transparent"></div>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-white text-lg font-bold leading-tight truncate">Admin<span className="text-brand-yellow">Panel</span></h1>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">HUB IME v3.1.5</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
                        {filteredLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    prefetch={true}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive
                                        ? 'bg-[#0055ff] border border-[#0055ff]/50 text-white shadow-lg shadow-[#0055ff]/20'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-sm font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 pb-24 border-t border-gray-800 transition-colors relative z-10 bg-neutral-900">
                    <button
                        onClick={async () => {
                            await signOut('/login');
                            window.location.reload();
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-400 rounded-xl hover:bg-gray-800 hover:text-brand-red transition-colors border border-transparent group focus:outline-none"
                    >
                        <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-brand-red transition-colors">logout</span>
                        <span>Sair do Painel</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-screen relative bg-transparent">
                {children}
            </main>
        </div>
    );
}
