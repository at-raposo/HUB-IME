'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function DepartmentSubMenu() {
    const anchors = [
        { id: 'laboratorios', label: 'Lab & Grupos', icon: 'science' },
        { id: 'pesquisadores', label: 'Pesquisadores', icon: 'school' },
        { id: 'linhas-de-pesquisa', label: 'Eixos Temáticos', icon: 'hub' },
        { id: 'mural', label: 'Mural & Arena', icon: 'forum' },
    ];

    const [activeId, setActiveId] = useState<string>('');

    // Intersection Observer to highlight the active menu item natively
    useEffect(() => {
        const observers = anchors.map(anchor => {
            const el = document.getElementById(anchor.id);
            if (!el) return null;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setActiveId(anchor.id);
                    }
                },
                { rootMargin: '-30% 0px -70% 0px' } // Adjust activation area
            );
            observer.observe(el);
            return { el, observer };
        }).filter(Boolean);

        return () => {
            observers.forEach(obs => {
                if (obs && obs.observer) {
                    obs.observer.unobserve(obs.el);
                }
            });
        };
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            // Smooth scroll without Layout Shift
            window.scrollTo({
                top: el.offsetTop - 100, // Offset for the fixed header/submenu
                behavior: 'smooth'
            });
            setActiveId(id);
        }
    };

    return (
        <div className="sticky top-[88px] z-40 py-4 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-all w-full mb-8">
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x">
                {anchors.map(anchor => {
                    const isActive = activeId === anchor.id;
                    return (
                        <a
                            key={anchor.id}
                            href={`#${anchor.id}`}
                            onClick={(e) => handleClick(e, anchor.id)}
                            className={`snap-start whitespace-nowrap px-4 md:px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                                isActive 
                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                : 'bg-gray-100 dark:bg-card-dark text-gray-500 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{anchor.icon}</span>
                            {anchor.label}
                            {isActive && (
                                <motion.div layoutId="submenu-active" className="absolute inset-0 bg-brand-blue rounded-full -z-10" />
                            )}
                        </a>
                    );
                })}
            </nav>
        </div>
    );
}
