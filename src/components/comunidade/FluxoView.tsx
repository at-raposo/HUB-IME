'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { fetchSubmissions } from '@/app/actions/submissions';
import { checkUserLikes, checkUserSaves } from '@/app/actions/media';
import { useAuth } from '@/providers/AuthProvider';
import {
    Sparkles,
    ChevronLeft,
    ChevronRight,
    SearchX,
    Minus,
    Plus,
    Zap,
    Image as ImageIcon,
    Video,
    FileText,
    FolderArchive,
    Edit3,
    Satellite,
    Atom
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FluxoFeedbackCard } from '@/app/fluxo/FluxoFeedbackCard';
import { useSearch } from '@/providers/SearchProvider';
import { CATEGORIES as CATEGORY_LIST, CATEGORY_STYLES, DEFAULT_STYLE } from '@/lib/constants';
import { useTelemetry } from '@/hooks/useTelemetry';

interface FluxoViewProps {
    initialItems: MediaCardProps[];
    initialHasMore: boolean;
    initialCategory?: string;
    trendingItems?: MediaCardProps[];
    featuredItems?: MediaCardProps[];
    trendingTags?: string[];
    initialLikedIds?: string[];
    initialSavedIds?: string[];
}

export const FluxoView = ({
    initialItems,
    initialHasMore,
    initialCategory = 'Todos',
    trendingItems = [],
    featuredItems = [],
    trendingTags = [],
    initialLikedIds = [],
    initialSavedIds = []
}: FluxoViewProps) => {
    const router = useRouter();
    const { query: searchQuery, setQuery: setSearchQuery } = useSearch();
    const { trackEvent } = useTelemetry();

    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds));
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds));
    const [isSyncing, setIsSyncingState] = useState(false);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const setIsSyncing = useCallback((val: boolean) => {
        if (val) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            setIsSyncingState(true);
        } else {
            syncTimeoutRef.current = setTimeout(() => {
                setIsSyncingState(false);
            }, 4000);
        }
    }, []);

    const { user } = useAuth();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([initialCategory]);
    const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
    const [selectedYears, setSelectedYears] = useState<string[]>(['Todos']);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllYears, setShowAllYears] = useState(false);

    // Trending Scroll State
    const trendingScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (trendingScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

            // Calculate active page index (0, 1, or 2)
            const scrollRange = scrollWidth - clientWidth;
            const page = scrollRange > 0 ? Math.round((scrollLeft / scrollRange) * 2) : 0;
            setActivePageIndex(page);
        }
    };

    useEffect(() => {
        const carousel = trendingScrollRef.current;
        if (carousel) {
            carousel.addEventListener('scroll', checkScroll);
            checkScroll();
        }
        window.addEventListener('resize', checkScroll);
        return () => {
            if (carousel) carousel.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [trendingItems]);

    useEffect(() => {
        if (!user) {
            setLikedIds(new Set());
            setSavedIds(new Set());
            return;
        }

        const fetchInteractions = async () => {
            const allIds = new Set<string>();
            items.forEach(i => allIds.add(i.post.id));
            trendingItems.forEach(i => allIds.add(i.post.id));
            featuredItems.forEach(i => allIds.add(i.post.id));

            const idsArray = Array.from(allIds);
            if (idsArray.length === 0) return;

            try {
                const [userLikes, userSaves] = await Promise.all([
                    checkUserLikes(idsArray),
                    checkUserSaves(idsArray)
                ]);
                setLikedIds(new Set(userLikes));
                setSavedIds(new Set(userSaves));
            } catch (err) {
                console.error("Failed to fetch interactions", err);
            }
        };

        fetchInteractions();
    }, [user, items, trendingItems, featuredItems]);

    const scrollTrending = (direction: 'left' | 'right') => {
        if (trendingScrollRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 600 : 300;
            trendingScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const categories = ['Todos', 'HUB IME', 'Mentorados HUB IME', 'Laboratórios', 'Pesquisadores', 'Bastidores da Ciência', 'Eventos', 'Nossa História', 'Uso Didático', 'Convivência', 'Central de Anotações', 'Mural do Deu Ruim', 'Outros'];
    const currentYear = 2026;
    const years = ['Todos', ...Array.from({ length: currentYear - 1934 + 1 }, (_, i) => (currentYear - i).toString())];

    const mediaTypeOptions = [
        { label: 'Fotos', value: 'image', icon: ImageIcon, color: 'brand-blue' },
        { label: 'Vídeos', value: 'video', icon: Video, color: 'brand-red' },
        { label: 'PDF', value: 'pdf', icon: FileText, color: 'brand-yellow' },
        { label: 'ZIP', value: 'zip', icon: FolderArchive, color: 'brand-blue' },
        { label: 'Notes', value: 'sdocx', icon: Edit3, color: 'brand-red' },
        { label: 'Texto', value: 'text', icon: FileText, color: 'brand-blue' },
        { label: 'Outros', value: 'other', icon: Sparkles, color: 'gray-500' },
    ];

    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetchSubmissions({
                    page: 1,
                    limit: 12,
                    query: debouncedQuery,
                    categories: selectedCategories.filter(c => c !== 'Todos'),
                    mediaTypes: selectedMediaTypes,
                    years: selectedYears.includes('Todos') ? undefined : selectedYears.map(y => parseInt(y)),
                    sort: 'recentes'
                });
                setItems(res.items);
                setHasMore(res.hasMore);
                setPage(1);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isLoading && items.length === 0 && debouncedQuery) {
            trackEvent('SEARCH_FAIL', { query: debouncedQuery });
        }

        if (debouncedQuery === '' && selectedCategories.length === 1 && selectedCategories[0] === 'Todos' && selectedMediaTypes.length === 0 && selectedYears.length === 1 && selectedYears[0] === 'Todos') {
            setItems(initialItems);
            setHasMore(initialHasMore);
            return;
        }

        fetchFiltered();
    }, [debouncedQuery, selectedCategories, selectedMediaTypes, selectedYears]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const next = await fetchSubmissions({
                page: page + 1,
                limit: 12,
                query: debouncedQuery,
                categories: selectedCategories.filter(c => c !== 'Todos'),
                mediaTypes: selectedMediaTypes,
                years: selectedYears.includes('Todos') ? undefined : selectedYears.map(y => parseInt(y)),
                sort: 'recentes'
            });
            setItems(prev => [...prev, ...next.items]);
            setHasMore(next.hasMore);
            setPage(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div className="space-y-4 pt-8">
            {/* New Blue Logs-style Header for Fluxo */}
            <div className="flex flex-col gap-3 relative mb-12">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-blue/5 rounded-full blur-[60px] pointer-events-none"></div>
                <h1 className="text-5xl font-black uppercase italic tracking-tighter text-[#C00000] flex items-center gap-4 relative z-10">
                    <Zap className="w-12 h-12 fill-[#C00000]" />
                    FLUXO
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] border-l-2 border-brand-blue-accent pl-4 max-w-lg">
                    O ecossistema USP em movimento. Documentação colaborativa e registro histórico da nossa ciência.
                </p>
            </div>

            <section className="z-40 bg-transparent py-4 -mx-4 px-4 border-b border-gray-100 dark:border-gray-800/50 mb-8 overflow-x-hidden">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0">Formato:</span>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {mediaTypeOptions.map((option) => {
                                const isActive = selectedMediaTypes.includes(option.value);
                                const Icon = option.icon;
                                const activeColor = option.color;
                                return (
                                    <button
                                        key={option.label}
                                        onClick={() => setSelectedMediaTypes(isActive ? prev => prev.filter(t => t !== option.value) : prev => [...prev, option.value])}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all border-2 shrink-0 ${isActive ? `bg-${activeColor} text-white border-${activeColor} shadow-lg ring-2 ring-${activeColor}/20` : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0">Categorias:</span>
                        <div className="flex flex-wrap gap-2">
                            {(showAllCategories ? categories : categories.slice(0, 6)).map((c) => {
                                const isActive = selectedCategories.includes(c);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setSelectedCategories(prev => {
                                                if (c === 'Todos') return ['Todos'];
                                                const filtered = prev.filter(item => item !== 'Todos');
                                                if (isActive) {
                                                    const next = filtered.filter(item => item !== c);
                                                    return next.length === 0 ? ['Todos'] : next;
                                                }
                                                return [...filtered, c];
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all border-2 ${isActive ? (CATEGORY_STYLES[c]?.filterActive || DEFAULT_STYLE.filterActive) : (CATEGORY_STYLES[c]?.filterInactive || DEFAULT_STYLE.filterInactive)}`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-blue transition-all flex items-center gap-1 border-2 border-transparent"
                            >
                                {showAllCategories ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {showAllCategories ? 'Menos' : 'Mais'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 shrink-0">Ano:</span>
                        <div className="flex flex-wrap gap-2 grow">
                            {(showAllYears ? years : years.slice(0, 10)).map((y, idx) => {
                                const isActive = selectedYears.includes(y);
                                const filterColors = ['brand-blue', 'brand-yellow', 'brand-red'];
                                const activeColor = y === 'Todos' ? 'brand-blue' : filterColors[idx % filterColors.length];
                                return (
                                    <button
                                        key={y}
                                        onClick={() => {
                                            setSelectedYears(prev => {
                                                if (y === 'Todos') return ['Todos'];
                                                const filtered = prev.filter(item => item !== 'Todos');
                                                if (isActive) {
                                                    const next = filtered.filter(item => item !== y);
                                                    return next.length === 0 ? ['Todos'] : next;
                                                }
                                                return [...filtered, y];
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all border-2 shrink-0 ${isActive ? `bg-${activeColor} text-white border-${activeColor} shadow-lg ring-2 ring-${activeColor}/20` : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                    >
                                        {y}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowAllYears(!showAllYears)}
                                className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-blue transition-all flex items-center gap-1 border-2 border-transparent"
                            >
                                {showAllYears ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {showAllYears ? 'Menos' : 'Mais'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            <div className="grid grid-cols-1 gap-8 min-h-[600px] w-full max-w-2xl mx-auto">
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const isAboveFold = index < 2;
                        return (
                            <div key={item.post.id} className={!isAboveFold ? "animate-fade-in-up" : ""} style={!isAboveFold ? { animationDelay: `${(index % 6) * 0.1}s` } : undefined}>
                                <MediaCard post={item.post} priority={isAboveFold} isLikedByUser={likedIds.has(item.post.id)} isSavedByUser={savedIds.has(item.post.id)} highlightQuery={searchQuery} setIsSyncing={setIsSyncing} />
                            </div>
                        );
                    })
                ) : !isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-xl font-bold text-gray-400">Nenhum rastro encontrado...</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategories(['Todos']); setSelectedMediaTypes([]); }} className="mt-4 text-brand-blue font-bold">Limpar Filtros</button>
                    </div>
                ) : null}

                {(isLoading || isLoadingMore) && (
                    <div className="col-span-full grid grid-cols-1 gap-8">
                        {[1, 2].map((i) => <SkeletonCard key={i} />)}
                    </div>
                )}
            </div>

            {hasMore && !isLoading && !isLoadingMore && (
                <div className="flex justify-center pt-8">
                    <button onClick={loadMore} disabled={isLoadingMore} className="group relative px-10 py-4 bg-brand-blue text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-current" />
                            Expandir Acervo
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-blue-accent to-brand-blue translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-30" />
                    </button>
                </div>
            )}

            <AnimatePresence>
                {isSyncing && (
                    <motion.div initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className="fixed top-24 right-6 z-[200] bg-black/80 backdrop-blur-xl border border-brand-blue-accent/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(31,159,207,0.15)]">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-brand-blue-accent/30 rounded-full" />
                            <div className="relative">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-brand-blue-accent rounded-full shadow-[0_0_10px_#C00000]" />
                                <Atom className="absolute -top-3 -left-3 w-8 h-8 text-white/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col pr-2">
                            <h2 className="text-[10px] font-black font-mono text-white uppercase tracking-[0.2em]">Sinc_Atômico</h2>
                            <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest leading-none">Atualizando_Partículas...</p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-2xl overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} className="h-full bg-brand-blue-accent shadow-[0_0_10px_#C00000]" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
