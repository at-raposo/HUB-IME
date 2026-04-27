'use client';

import React, { useEffect } from 'react';
import { useDepartmentFilterStore } from '@/store/useDepartmentFilterStore';
import Image from 'next/image';

interface Researcher {
    id: string;
    nome: string;
    avatar_url: string | null;
    status: 'ativo' | 'emerito' | 'inativo';
}

export function DepartmentPesquisadoresClient({ researchers }: { researchers: Researcher[] }) {
    const { selectedResearchers, toggleResearcher, clearFilters } = useDepartmentFilterStore();

    // Reset filters when unmounting (leaving the department page)
    useEffect(() => {
        return () => clearFilters();
    }, [clearFilters]);

    const handleSelect = (id: string) => {
        toggleResearcher(id);

        // Mobile UX: auto-scroll to Mural on mobile width when selecting
        if (window.innerWidth < 768) {
            const mural = document.getElementById('mural');
            if (mural) {
                // Delay slightly to give user visual feedback of selection
                setTimeout(() => {
                    window.scrollTo({
                        top: mural.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex flex-wrap gap-4">
            {researchers.map(researcher => {
                const isSelected = selectedResearchers.includes(researcher.id);
                
                return (
                    <button
                        key={researcher.id}
                        type="button"
                        onClick={() => handleSelect(researcher.id)}
                        className={`group relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all w-24 ${
                            isSelected 
                            ? 'bg-brand-yellow/10 ring-2 ring-brand-yellow scale-105' 
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 opacity-80 hover:opacity-100 hover:-translate-y-1'
                        }`}
                        aria-pressed={isSelected}
                        title={`Filtrar posts por ${researcher.nome}`}
                    >
                        <div className={`relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-black shadow-md transition-all ${
                            isSelected ? 'ring-2 ring-brand-yellow ring-offset-2 ring-offset-white dark:ring-offset-card-dark' : 'border border-gray-200 dark:border-gray-700'
                        } ${researcher.avatar_url ? 'bg-gray-100' : 'bg-gradient-to-br from-brand-yellow to-orange-500 text-white'}`}>
                            
                            {researcher.avatar_url ? (
                                <Image 
                                    src={researcher.avatar_url} 
                                    alt={researcher.nome}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            ) : (
                                getInitials(researcher.nome)
                            )}

                            {isSelected && (
                                <div className="absolute inset-0 bg-brand-yellow/30 flex items-center justify-center backdrop-blur-[1px]">
                                    <span className="material-symbols-outlined text-white font-bold drop-shadow-md">check</span>
                                </div>
                            )}
                        </div>
                        
                        <span className={`text-[10px] font-bold text-center leading-tight line-clamp-2 ${isSelected ? 'text-brand-yellow' : 'text-gray-600 dark:text-gray-400'}`}>
                            {researcher.nome}
                        </span>

                        {researcher.status === 'emerito' && (
                            <div className="absolute -top-1 -right-1 bg-brand-yellow text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md pb-[1px]" title="Professor Emérito">
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
