import React from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { DepartmentPesquisadoresClient } from './DepartmentPesquisadoresClient';

export async function DepartmentResearchers({ departmentId }: { departmentId: string }) {
    const supabase = await createServerSupabase();
    // 1. Fetch researchers linked to department
    const { data: relations } = await supabase
        .from('department_researchers')
        .select(`
            researcher_id,
            researchers (
                id,
                nome,
                avatar_url,
                lattes_url,
                status
            )
        `)
        .eq('department_id', departmentId);

    if (!relations || relations.length === 0) return null;

    const researchers = relations.map((rel: any) => rel.researchers).filter(Boolean);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <span className="material-symbols-outlined text-brand-yellow text-3xl">school</span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    Docentes & Pesquisadores
                </h2>
            </div>
            
            {/* Delega a interatividade multifiltro pro Client Component */}
            <DepartmentPesquisadoresClient researchers={researchers} />
        </div>
    );
}
