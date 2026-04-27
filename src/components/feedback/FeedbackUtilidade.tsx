'use client';

import React, { useState } from 'react';
import { useTelemetry } from '@/hooks/useTelemetry';

interface FeedbackUtilidadeProps {
    postId: string;
    title?: string;
}

/**
 * 👍 FeedbackUtilidade Component
 * Binary helpfulness rating for content.
 */
export function FeedbackUtilidade({ postId, title }: FeedbackUtilidadeProps) {
    const { trackEvent } = useTelemetry();
    const [rated, setRated] = useState<'positive' | 'negative' | null>(null);

    const handleRate = (rating: 'positive' | 'negative') => {
        if (rated) return;
        
        trackEvent('CONTENT_RATING', {
            post_id: postId,
            post_title: title || 'wiki-content',
            rating: rating
        });
        
        setRated(rating);
    };

    if (rated) {
        return (
            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <span className="material-symbols-outlined text-brand-blue text-4xl mb-3">auto_awesome</span>
                <p className="text-sm font-bold text-gray-300">Obrigado pelo seu feedback!</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Ajudando a construir a jornada IFUSP.</p>
            </div>
        );
    }

    return (
        <div className="mt-12 p-8 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:border-brand-blue/30 group">
            <div className="text-center sm:text-left">
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Este post foi útil?</h4>
                <p className="text-xs text-gray-500 font-medium">Sua opinião ajuda a priorizar conteúdos para a comunidade.</p>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => handleRate('positive')}
                    className="flex flex-col items-center gap-2 group/btn"
                >
                    <div className="size-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-2xl hover:bg-brand-blue/10 hover:border-brand-blue/50 hover:scale-110 transition-all shadow-sm">
                        👍
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-brand-blue">Sim</span>
                </button>

                <button
                    onClick={() => handleRate('negative')}
                    className="flex flex-col items-center gap-2 group/btn"
                >
                    <div className="size-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-2xl hover:bg-brand-red/10 hover:border-brand-red/50 hover:scale-110 transition-all shadow-sm">
                        👎
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/btn:text-brand-red">Não</span>
                </button>
            </div>
        </div>
    );
}
