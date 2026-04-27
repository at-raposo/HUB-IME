import React from 'react';
import { createServerSupabase } from '@/lib/supabase/server';

export async function DepartmentResearchLines({ departmentId }: { departmentId: string }) {
    const supabase = await createServerSupabase();
    // 1. Fetch posts linked to department to derive active research lines
    const { data: subRelations } = await supabase
        .from('submission_departments')
        .select(`
            submissions (
                submission_research_lines (
                    research_lines (
                        id,
                        nome
                    )
                )
            )
        `)
        .eq('department_id', departmentId);

    if (!subRelations || subRelations.length === 0) return null;

    // Extract underlying research lines
    const rlMap = new Map<string, any>();
    
    subRelations.forEach((rel: any) => {
        if (rel.submissions && rel.submissions.submission_research_lines) {
            rel.submissions.submission_research_lines.forEach((srl: any) => {
                if (srl.research_lines) {
                    rlMap.set(srl.research_lines.id, srl.research_lines);
                }
            });
        }
    });

    const uniqueLines = Array.from(rlMap.values());

    if (uniqueLines.length === 0) return null;

    // Ordenar alfabeticamente
    uniqueLines.sort((a, b) => a.nome.localeCompare(b.nome));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <span className="material-symbols-outlined text-brand-green text-3xl">hub</span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    Linhas de Pesquisa
                </h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
                {uniqueLines.map(line => (
                    <span 
                        key={line.id}
                        className="px-4 py-2 bg-brand-green/10 border border-brand-green/20 text-brand-green font-bold text-xs uppercase tracking-widest rounded-full shadow-sm"
                        title="Identidade Temática Global do IFUSP"
                    >
                        {line.nome}
                    </span>
                ))}
            </div>
        </div>
    );
}
