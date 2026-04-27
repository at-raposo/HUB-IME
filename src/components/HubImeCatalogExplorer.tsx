'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchSubmissions } from '@/app/actions/submissions';
import { MediaCardProps } from './MediaCard';
import { FeaturedCarousel } from './FeaturedCarousel';
import { SkeletonCard } from './ui/SkeletonCard';
import { Star, Users, Trophy } from 'lucide-react';
import { institutoData } from '@/data/institutoData';
import { PostDTO } from '@/dtos/media';

export function HubImeCatalogExplorer() {
    const [HubImeItems, setHubImeItems] = useState<MediaCardProps[]>([]);
    const [mentoredItems, setMentoredItems] = useState<MediaCardProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Map winners from all departments to PostDTO
    const arenaWinners = useMemo(() => {
        const allWinners: MediaCardProps[] = [];
        Object.values(institutoData).forEach(dept => {
            dept.postsGanhadores.forEach(winner => {
                const post: PostDTO = {
                    id: winner.postId || winner.id,
                    title: winner.title,
                    authors: winner.autor,
                    description: `${winner.categoria} • ${dept.sigla} (${winner.ano})`,
                    category: 'Arena',
                    mediaType: 'image',
                    mediaUrl: winner.mediaUrl,
                    isFeatured: true,
                    isGoldenStandard: true,
                    createdAt: new Date().toISOString(),
                    likeCount: 0,
                    saveCount: 0,
                    commentCount: 0,
                    userId: 'system',
                    status: 'approved',
                    tags: [winner.ano, dept.sigla, winner.categoria]
                };
                allWinners.push({ post });
            });
        });
        
        // Shuffle or sort by year? Let's sort by year (most recent first)
        return allWinners.sort((a, b) => {
            const yearA = a.post.tags?.[0] || '';
            const yearB = b.post.tags?.[0] || '';
            return yearB.localeCompare(yearA);
        });
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch HUB IME produced material
                const HubImeRes = await fetchSubmissions({
                    page: 1,
                    limit: 10,
                    query: '',
                    categories: ['hub-ime'],
                    sort: 'recentes'
                });
                // Force golden standard on ALL HUB IME catalog items
                setHubImeItems(HubImeRes.items.map(item => ({
                    ...item,
                    post: { ...item.post, isGoldenStandard: true }
                })));

                // Fetch Mentored material
                const mentoredRes = await fetchSubmissions({
                    page: 1,
                    limit: 10,
                    query: '',
                    categories: ['Mentorados HUB IME'],
                    sort: 'recentes'
                });
                // Force golden standard on ALL Mentorados catalog items
                setMentoredItems(mentoredRes.items.map(item => ({
                    ...item,
                    post: { ...item.post, isGoldenStandard: true }
                })));
            } catch (error) {
                console.error('Error loading HUB IME catalog:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard />
                        <SkeletonCard className="hidden md:block" />
                        <SkeletonCard className="hidden lg:block" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-20 py-12">
            {/* Produzido pelo HUB IME */}
            <section>
                <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                    <div className="p-2 bg-brand-yellow/10 rounded-xl border border-brand-yellow/20">
                        <Star className="w-6 h-6 text-brand-yellow fill-current" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white leading-tight">
                            Catálogo <span className="text-brand-yellow">Padrão Ouro</span>
                        </h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Produzido pelo HUB IME: Conteúdo proprietário e oficial</p>
                    </div>
                </div>
                {HubImeItems.length > 0 ? (
                    <FeaturedCarousel items={HubImeItems} hideTitle={true} />
                ) : (
                    <div className="px-4 py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Nenhum rastro detectado com #HUB IME</p>
                    </div>
                )}
            </section>

            {/* Vencedores da Arena (Competições Semestrais) */}
            <section>
                <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-yellow/10 rounded-xl">
                            <Trophy className="w-6 h-6 text-brand-yellow" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white leading-tight">
                                Vencedores da <span className="text-brand-yellow">Arena</span>
                            </h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Destaques Criativos das Competições Semestrais</p>
                        </div>
                    </div>
                </div>
                {arenaWinners.length > 0 ? (
                    <FeaturedCarousel items={arenaWinners} hideTitle={true} />
                ) : (
                    <div className="px-4 py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Nenhum rastro detectado nas competições</p>
                    </div>
                )}
            </section>
        </div>
    );
}
