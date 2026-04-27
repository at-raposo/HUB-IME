import React from 'react';
import Link from 'next/link';

interface Department {
    id: string;
    nome: string;
    sigla: string;
    descricao: string | null;
}

export function DepartmentHeader({ department }: { department: Department }) {
    // Elegant manual Tooltip logic for Sigla
    const SiglaTooltip = ({ sigla, nome }: { sigla: string, nome: string }) => (
        <span className="relative inline-block group cursor-help">
            <span className="text-brand-blue font-black underline decoration-brand-blue/30 underline-offset-4 border-b border-dashed border-brand-blue/50 pb-1">
                {sigla}
            </span>
            {/* Tooltip Hover Box */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-gray-900 dark:bg-card-dark border border-gray-700 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all z-10">
                <p className="text-xs font-bold text-white uppercase tracking-widest">{nome}</p>
                {/* Flecha inferior */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-700"></div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-gray-900 dark:border-t-card-dark -mt-[2px]"></div>
            </div>
        </span>
    );

    return (
        <header className="relative w-full rounded-[32px] overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12">
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute top-0 right-1/4 -mt-10 w-32 h-32 bg-brand-red/10 dark:bg-brand-red/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="max-w-3xl space-y-4">
                    <p className="text-sm font-black text-brand-blue uppercase tracking-[0.3em]">
                        Departamento Institucional
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {department.nome} (<SiglaTooltip sigla={department.sigla} nome={department.nome} />)
                    </h1>
                    {department.descricao && (
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4 max-w-2xl">
                            {department.descricao}
                        </p>
                    )}
                </div>

                <div className="shrink-0 mt-4 md:mt-0">
                    <Link
                        href="/mapa"
                        className="inline-flex items-center gap-3 px-6 py-4 bg-white dark:bg-card-dark text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-brand-blue/20 hover:border-brand-blue/50 transition-all group"
                    >
                        <span className="material-symbols-outlined text-brand-blue transition-transform group-hover:scale-110">
                            explore
                        </span>
                        Ver no Mapa
                    </Link>
                </div>
            </div>
        </header>
    );
}
