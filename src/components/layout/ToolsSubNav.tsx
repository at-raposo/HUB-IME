'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Route, UserSearch } from 'lucide-react';

const tools = [
    { name: 'Grade Horária', href: '/ferramentas', icon: Calendar, exact: true },
    { name: 'Trilhas', href: '/ferramentas/trilhas', icon: Route, exact: false },
    { name: 'Match Acadêmico', href: '/ferramentas/match', icon: UserSearch, exact: true },
];

export function ToolsSubNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="w-full mb-6 sticky top-16 z-40 py-2">
            <div className="flex items-center justify-center">
                <div className="flex gap-2 p-1 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[20px] w-fit overflow-x-auto scrollbar-hide max-w-full shadow-lg">
                    {tools.map((tool) => {
                        const active = isActive(tool.href, tool.exact);
                        return (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className={`
                                    flex items-center gap-2.5 px-6 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest
                                    transition-all duration-300 whitespace-nowrap
                                    ${active
                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                        : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }
                                `}
                            >
                                <tool.icon className="w-4 h-4" />
                                {tool.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

