'use client';

import React, { useState, useEffect } from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { institutoData, Department } from '@/data/institutoData';
import { WikiFeedbackCard } from '@/app/wiki/WikiFeedbackCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

// Reusing icons from Lucide for consistency with the project
import { 
    ChevronLeft as ChevronLeftIcon, 
    ChevronDown as ChevronDownIcon,
    ExternalLink as ExternalLinkIcon,
    Users as UsersIcon,
    FlaskConical as ScienceIcon,
    Atom as ResearchIcon,
    Newspaper as FeedIcon,
    Search as SearchIcon,
    Trophy as TrophyIcon
} from 'lucide-react';

export default function DepartmentWikiPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    const department = institutoData[slug.toLowerCase()];
    const [activeSection, setActiveSection] = useState('info');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!department) {
        return (
            <MainLayoutWrapper>
                <div className="flex flex-col items-center justify-center py-40">
                    <h1 className="text-4xl font-black text-gray-300 uppercase">404</h1>
                    <p className="text-gray-500 mt-2 font-bold">Departamento não encontrado no Grafo.</p>
                    <Link href="/wiki/instituto" className="mt-8 text-brand-blue font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <ChevronLeftIcon className="w-4 h-4" /> Voltar ao Mapa
                    </Link>
                </div>
            </MainLayoutWrapper>
        );
    }

    return (
        <MainLayoutWrapper rightSidebar={<WikiFeedbackCard />}>
            <div className="flex flex-col w-full pb-20">
                {/* 1. Header & Breadcrumbs */}
                <div className="mb-8">
                    <Link
                        href="/wiki/instituto"
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-blue transition-colors w-fit mb-6 group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Instituto de Física / {department.sigla}
                    </Link>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                Departamento • {department.sigla}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
                            {department.nome}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
                            {department.descricao}
                        </p>
                    </motion.div>
                </div>

                {/* 2. Sticky Navigation Bar */}
                <div className={`sticky top-0 z-40 -mx-4 px-4 py-2 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 shadow-sm' : ''}`}>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {[
                            { id: 'laboratorios', label: 'Laboratórios', icon: <ScienceIcon className="w-4 h-4" /> },
                            { id: 'pesquisadores', label: 'Pesquisadores', icon: <UsersIcon className="w-4 h-4" /> },
                            { id: 'linhas', label: 'Linhas de Pesquisa', icon: <ResearchIcon className="w-4 h-4" /> },
                            { id: 'mural', label: 'Mural & Ganhadores', icon: <TrophyIcon className="w-4 h-4" /> }
                        ].map((nav) => (
                            <button
                                key={nav.id}
                                onClick={() => {
                                    const element = document.getElementById(nav.id);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                    ${activeSection === nav.id 
                                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30' 
                                        : 'text-gray-500 hover:text-brand-red hover:bg-brand-red/5'
                                    }`}
                            >
                                {nav.icon}
                                {nav.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Sections */}
                <div className="mt-16 space-y-32">
                    {/* Laboratórios Section */}
                    <SectionWrapper id="laboratorios" title="Laboratórios de Pesquisa" icon={<ScienceIcon className="w-6 h-6" />} color="brand-red">
                        <div className="grid grid-cols-1 gap-4">
                            {department.laboratorios.map((lab, idx) => (
                                <LabAccordion key={lab.id} lab={lab} index={idx} />
                            ))}
                        </div>
                    </SectionWrapper>

                    {/* Pesquisadores Section */}
                    <SectionWrapper id="pesquisadores" title="Corpo Docente & Pesquisa" icon={<UsersIcon className="w-6 h-6" />} color="brand-yellow">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {department.pesquisadores.map((res, idx) => (
                                <ResearcherCard key={res.id} researcher={res} index={idx} />
                            ))}
                        </div>
                    </SectionWrapper>

                    {/* Linhas de Pesquisa Section */}
                    <SectionWrapper id="linhas" title="Linhas de Pesquisa" icon={<ResearchIcon className="w-6 h-6" />} color="brand-blue">
                        <div className="flex flex-wrap gap-3">
                            {department.linhasPesquisa.map((linha, idx) => (
                                <motion.span 
                                    key={linha}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="px-6 py-3 bg-white dark:bg-card-dark border-2 border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-brand-blue/30 hover:text-brand-blue transition-all cursor-default"
                                >
                                    {linha}
                                </motion.span>
                            ))}
                        </div>
                    </SectionWrapper>

                    {/* Mural & Posts Ganhadores Section */}
                    <SectionWrapper id="mural" title="Mural & Posts Ganhadores" icon={<TrophyIcon className="w-6 h-6" />} color="brand-red">
                        <PostsGanhadoresSection winners={department.postsGanhadores} />
                        <div className="mt-20">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-8 ml-2 flex items-center gap-2">
                                <FeedIcon className="w-4 h-4" /> Feed do Departamento
                            </h3>
                            <WikiMural tag={department.sigla} />
                        </div>
                    </SectionWrapper>
                </div>
            </div>
        </MainLayoutWrapper>
    );
}

function SectionWrapper({ id, title, icon, color, children }: { id: string, title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-24">
            <div className="flex items-center gap-4 mb-10">
                <div className={`w-12 h-12 rounded-2xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
                    {icon}
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                    {title}
                </h2>
                <div className="h-[1px] flex-grow bg-gray-100 dark:bg-white/5 ml-4"></div>
            </div>
            {children}
        </section>
    );
}

function LabAccordion({ lab, index }: { lab: any, index: number }) {
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <div className="group">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left
                    ${isOpen ? 'border-brand-red bg-brand-red/5' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-card-dark hover:border-brand-red/30'}`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isOpen ? 'bg-brand-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-red transition-colors">
                        {lab.nome}
                    </h4>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-red' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-8 pb-10 text-gray-500 dark:text-gray-400 leading-relaxed bg-white/50 dark:bg-card-dark/30 rounded-b-2xl -mt-4 border-x-2 border-b-2 border-brand-red/10">
                            <p className="mb-6">{lab.description}</p>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline">
                                <ExternalLinkIcon className="w-3 h-3" /> Acessar Página do Laboratório
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ResearcherCard({ researcher, index }: { researcher: any, index: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col items-center p-6 rounded-3xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 hover:border-brand-yellow/30 transition-all text-center"
        >
            <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-brand-yellow rounded-full blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-card-dark shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                    {researcher.avatar ? (
                        <Image src={researcher.avatar} alt={researcher.nome} fill className="object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-gray-400 uppercase tracking-tighter">
                            {researcher.iniciais}
                        </span>
                    )}
                </div>
            </div>
            <h5 className="font-bold text-gray-900 dark:text-white leading-tight mb-1">
                {researcher.nome}
            </h5>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                {researcher.role}
            </p>
            <a 
                href={researcher.lattes} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-brand-yellow hover:bg-brand-yellow/10 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
            >
                <ExternalLinkIcon className="w-3 h-3" /> Currículo Lattes
            </a>
        </motion.div>
    );
}

function WikiMural({ tag }: { tag: string }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('submissions')
                    .select('*')
                    .contains('tags', [tag])
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (error) throw error;
                setPosts(data || []);
            } catch (err) {
                console.error("Erro no Mural:", err);
            } finally {
                // TEA Protection: Small delay to ensure skeleton is visible
                setTimeout(() => setLoading(false), 800);
            }
        };
        fetchPosts();
    }, [tag]);

    if (loading) {
        return (
            <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
                {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[320px] max-w-[320px] h-[340px] bg-gray-100 dark:bg-white/5 rounded-[40px] animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[50px] bg-gray-50/30 dark:bg-white/[0.02]">
                <div className="w-16 h-16 bg-brand-red/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-red">
                    <ScienceIcon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase italic">Seja o primeiro a publicar!</h4>
                <p className="text-gray-400 text-sm mt-2 font-bold max-w-xs mx-auto">Nenhuma publicação encontrada para o {tag} no momento. Compartilhe sua pesquisa.</p>
                <Link href="/enviar" className="mt-8 px-8 py-3 bg-brand-red text-white font-black uppercase tracking-widest text-[10px] inline-flex items-center gap-2 rounded-full shadow-lg shadow-brand-red/20 hover:scale-105 transition-transform">
                    <ScienceIcon className="w-4 h-4" /> Publicar no {tag}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar px-2">
            {posts.map((post) => (
                <Link 
                    key={post.id} 
                    href={`/post/${post.id}`}
                    className="group min-w-[320px] max-w-[320px] bg-white dark:bg-card-dark rounded-[40px] overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:border-brand-red/30 transition-all duration-500"
                >
                    <div className="relative aspect-[4/3] overflow-hidden">
                        <Image src={post.media_url} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <SearchIcon className="w-4 h-4" /> Ver Detalhes
                            </span>
                        </div>
                    </div>
                    <div className="p-8">
                        <h4 className="text-lg font-black text-gray-900 dark:text-white italic leading-tight line-clamp-2 group-hover:text-brand-red transition-colors">
                            {post.title}
                        </h4>
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[9px] font-black uppercase tracking-widest"># {tag}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function PostsGanhadoresSection({ winners }: { winners: any[] }) {
    if (winners.length === 0) {
        return (
            <div className="space-y-8 opacity-60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <h3 className="text-xl font-black text-gray-400 dark:text-white/20 uppercase italic flex items-center gap-3">
                            <TrophyIcon className="w-5 h-5 text-gray-300 dark:text-white/10" />
                            Posts Ganhadores (Arena)
                        </h3>
                        <p className="text-xs text-gray-300 dark:text-white/10 font-bold mt-1 uppercase tracking-widest leading-none">Em breve: os destaques criativos do semestre</p>
                    </div>
                </div>

                <div className="py-16 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] bg-gray-50/30 dark:bg-white/[0.01]">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-300 dark:text-white/10">
                        <TrophyIcon className="w-8 h-8" />
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
                        Participe dos desafios da Arena para ver sua pesquisa em destaque aqui!
                    </p>
                </div>
            </div>
        );
    }

    // Agrupar vencedores por semestre (ano)
    const semesters = Array.from(new Set(winners.map(w => w.ano))).sort().reverse() as string[];
    const [activeSemester, setActiveSemester] = useState(semesters[0]);
    
    const filteredWinners = winners.filter(w => w.ano === activeSemester);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic flex items-center gap-3">
                        <TrophyIcon className="w-5 h-5 text-brand-yellow" />
                        Posts Ganhadores (Arena)
                    </h3>
                    <p className="text-xs text-brand-yellow font-bold mt-1 uppercase tracking-widest leading-none">Destaques Criativos do Semestre</p>
                </div>

                {/* Semester Tabs */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                    {semesters.map((sem) => (
                        <button
                            key={sem}
                            onClick={() => setActiveSemester(sem)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${activeSemester === sem 
                                    ? 'bg-white dark:bg-card-dark text-brand-yellow shadow-sm border border-brand-yellow/10' 
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            {sem}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="wait">
                    {filteredWinners.map((winner, idx) => (
                        <motion.div 
                            key={winner.id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-white dark:bg-card-dark rounded-[40px] overflow-hidden border border-gray-100 dark:border-white/5 hover:border-brand-yellow/40 transition-all duration-500 shadow-xl shadow-brand-yellow/5"
                        >
                            {/* Win Badge */}
                            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-brand-yellow text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-yellow/30">
                                <TrophyIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{winner.ano}</span>
                            </div>

                            {/* Image Header */}
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <Image src={winner.mediaUrl} alt={winner.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 pb-8 flex flex-col justify-end">
                                     <span className="text-brand-yellow text-[9px] font-black uppercase tracking-[0.2em] mb-1">{winner.categoria}</span>
                                     <h4 className="text-xl font-black text-white uppercase italic leading-tight line-clamp-2">{winner.title}</h4>
                                </div>
                            </div>

                            {/* Footer info */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center font-black text-xs text-brand-yellow">
                                        {winner.iniciais}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Autor</span>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize leading-none">{winner.autor}</span>
                                    </div>
                                </div>
                                <Link href={`/post/${winner.postId}`} className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-brand-yellow hover:bg-brand-yellow/10 transition-all">
                                    <ExternalLinkIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
