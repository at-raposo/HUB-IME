import React from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { DepartmentFeedClient } from './DepartmentFeedClient';

// Importa um helper para carregar os posts do depto
export async function DepartmentMural({ departmentId }: { departmentId: string }) {
    const supabase = await createServerSupabase();
    // Busca todos os posts do departamento com os seus pesquisadores e metadados
    const { data: subRelations } = await supabase
        .from('submission_departments')
        .select(`
            submission_id,
            submissions (
                id,
                title,
                description,
                category,
                media_url,
                media_type,
                created_at,
                event_date,
                is_historical,
                is_golden_standard,
                authors,
                submission_researchers ( researcher_id )
            )
        `)
        .eq('department_id', departmentId)
        .order('created_at', { referencedTable: 'submissions', ascending: false });

    if (!subRelations) return null;

    // Extrai e formata os posts
    const rawPosts = subRelations
        .map((rel: any) => rel.submissions)
        .filter(Boolean)
        .map((p: any) => ({
            ...p,
            researcherIds: p.submission_researchers?.map((sr: any) => sr.researcher_id) || []
        }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <span className="material-symbols-outlined text-brand-blue text-3xl">forum</span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    Mural & Hall da Fama
                </h2>
            </div>
            
            {/* O Client Component fará o filtro com Zustand das abas e renderização rica */}
            <DepartmentFeedClient posts={rawPosts} />
        </div>
    );
}
