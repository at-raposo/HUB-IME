'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTelemetry } from '@/hooks/useTelemetry';
import { toast } from 'react-hot-toast';

interface ContentRatingProps {
    postId: string;
    contentFormat?: string;
}

export function ContentRating({ postId, contentFormat }: ContentRatingProps) {
    const { trackEvent } = useTelemetry();
    const [voted, setVoted] = useState<'positive' | 'negative' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVote = async (rating: 'positive' | 'negative') => {
        if (voted || isSubmitting) return;

        setIsSubmitting(true);
        // Telemetry uses fire-and-forget but let's give immediate feedback
        setVoted(rating);
        trackEvent('CONTENT_RATING', { 
            post_id: postId, 
            rating,
            content_format: contentFormat
        });
        
        toast.success(rating === 'positive' ? 'Agradecemos o feedback positivo!' : 'Obrigado por avaliar. Buscaremos melhorar.', {
            id: 'content-rating-toast',
        });
        
        setIsSubmitting(false);
    };

    return (
        <div className="glass-card p-6 md:px-8 md:py-6 rounded-[32px] border-white/5 bg-white/5 dark:bg-card-dark flex flex-col md:flex-row items-center justify-between gap-6 transition-all shadow-sm max-w-2xl mx-auto my-8">
            <div className="text-center md:text-left">
                <h4 className="text-sm font-black uppercase italic tracking-wide text-gray-900 dark:text-white mb-1">
                    Este conteúdo foi útil?
                </h4>
                <p className="text-[11px] text-gray-500 font-medium">
                    Seu feedback anônimo ajuda a melhorar o arquivo do Lab-Div.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <button
                    onClick={() => handleVote('negative')}
                    disabled={voted !== null}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 group ${
                        voted === 'negative'
                            ? 'bg-brand-red/10 border-brand-red/50 text-brand-red'
                            : voted === 'positive'
                            ? 'bg-transparent border-white/5 text-gray-600 opacity-40 cursor-not-allowed'
                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer hover:border-white/20'
                    }`}
                    aria-label="Avaliar negativamente"
                >
                    <ThumbsDown className={`w-5 h-5 ${voted === 'negative' ? 'fill-current' : ''} group-hover:-translate-y-0.5 transition-transform`} />
                </button>
                <div className="w-px h-8 bg-white/10" />
                <button
                    onClick={() => handleVote('positive')}
                    disabled={voted !== null}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-2 group ${
                        voted === 'positive'
                            ? 'bg-brand-blue/10 border-brand-blue/50 text-brand-blue'
                            : voted === 'negative'
                            ? 'bg-transparent border-white/5 text-gray-600 opacity-40 cursor-not-allowed'
                            : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer hover:border-white/20'
                    }`}
                    aria-label="Avaliar positivamente"
                >
                    <ThumbsUp className={`w-5 h-5 ${voted === 'positive' ? 'fill-current' : ''} group-hover:-translate-y-0.5 transition-transform`} />
                </button>
            </div>
        </div>
    );
}
