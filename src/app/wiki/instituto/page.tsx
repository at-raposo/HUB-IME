import React from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { InstitutoHero } from '@/components/wiki/instituto/InstitutoHero';
import { DepartmentGrid } from '@/components/wiki/instituto/DepartmentGrid';
import { InstitutoHistory } from '@/components/wiki/instituto/InstitutoHistory';
import { InstitutoTimeline } from '@/components/wiki/instituto/InstitutoTimeline';
import { HistoricalPosts } from '@/components/wiki/instituto/HistoricalPosts';
import { WikiFeedbackCard } from '@/app/wiki/WikiFeedbackCard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function WikiInstitutoPage() {
    return (
        <MainLayoutWrapper rightSidebar={
            <WikiFeedbackCard />
        }>
            <div className="flex flex-col gap-4 w-full overflow-x-hidden pb-12">
                {/* Breadcrumbs / Back Link */}
                <Link
                    href="/wiki"
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-blue transition-colors w-fit mb-4 group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Voltar para a Wiki
                </Link>

                <InstitutoHero />
                
                <div className="space-y-12">
                    <DepartmentGrid />
                    <InstitutoHistory />
                    <InstitutoTimeline />
                    <HistoricalPosts />
                </div>

                {/* Footer / Call to Action */}
                <footer className="py-20 border-t border-white/5 text-center mt-12">
                     <p className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Mapeamento Concluído</p>
                     <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Este é documento vivo. O mapeamento do Instituto de Física é expandido pela própria comunidade através do Hub Lab-Div.
                     </p>
                </footer>
            </div>
        </MainLayoutWrapper>
    );
}
