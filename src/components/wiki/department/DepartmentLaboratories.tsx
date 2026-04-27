import React from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

export async function DepartmentLaboratories({ departmentId }: { departmentId: string }) {
    const supabase = await createServerSupabase();
    // 1. Fetch relations
    const { data: relations } = await supabase
        .from('department_laboratories')
        .select(`
            laboratory_id,
            laboratories (
                id,
                nome,
                descricao,
                status
            )
        `)
        .eq('department_id', departmentId);

    if (!relations || relations.length === 0) return null;

    const labs = relations.map((rel: any) => rel.laboratories).filter(Boolean);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-4">
                <span className="material-symbols-outlined text-brand-red text-3xl">science</span>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
                    Laboratórios & Grupos
                </h2>
            </div>
            
            <div className="space-y-4">
                {labs.map((lab: any) => (
                    <LaboratoryAccordion key={lab.id} lab={lab} />
                ))}
            </div>
        </div>
    );
}

// Empregando "details summary" nativo para Accordion mantendo CLS zero
async function LaboratoryAccordion({ lab }: { lab: any }) {
    const supabase = await createServerSupabase();
    // Fetch associated submissions
    const { data: subRelations } = await supabase
        .from('submission_laboratories')
        .select(`
            submission_id,
            submissions (
                id,
                title,
                created_at,
                media_type
            )
        `)
        .eq('laboratory_id', lab.id)
        .limit(3); // Mostramos apenas os top 3 no preview

    const latestPosts = subRelations?.map((rel: any) => rel.submissions).filter(Boolean) || [];

    return (
        <details className="group bg-white dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden open:border-brand-red/30 transition-all [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                        <span className="material-symbols-outlined text-sm font-bold">biotech</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-open:text-brand-red transition-colors">
                        {lab.nome}
                    </h3>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" />
            </summary>
            
            <div className="p-6 pt-0 border-t border-gray-100 dark:border-white/5 mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {lab.descricao || 'Sem descrição cadastrada no Grafo de Conhecimento.'}
                </p>

                {latestPosts.length > 0 && (
                    <div className="bg-gray-50 dark:bg-[#1A1A1A] p-4 rounded-xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pesquisas Recentes</p>
                        <ul className="space-y-2">
                            {latestPosts.map((post: any) => (
                                <li key={post.id}>
                                    <Link href={`/post/${post.id}`} className="group/link flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5 last:border-0 hover:border-brand-red/30 transition-colors">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/link:text-brand-red transition-colors truncate pr-4">
                                            {post.title}
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400 text-sm group-hover/link:translate-x-1 group-hover/link:text-brand-red transition-all">
                                            arrow_forward
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </details>
    );
}
