'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Brain, 
    ArrowRight, 
    BookOpen,
    Workflow,
    Info,
    Landmark,
    Search,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { ColisorIcon } from '../icons/ColisorIcon';
import { AppRoutes } from '@/types/navigation';
import Link from 'next/link';
import { NetflixFeed } from '@/components/shared/NetflixFeed';
import { WikiView } from '@/components/wiki/WikiView';
import { InstitutoView } from '@/components/wiki/instituto/InstitutoView';

interface GrandeColisorViewProps {
    oportunidades: any[] | null;
    mapItems: any[];
}

const influencers = [
    {
        name: 'Canoa Da Lagoa',
        role: 'Divulgação Científica',
        bio: 'Canal do YouTube com conteúdo de física e ciência para todos.',
        imagePlaceholder: 'CL',
        color: 'brand-red',
        platform: 'youtube',
        link: 'https://www.youtube.com/@CanoadaLagoa/featured'
    },
    {
        name: 'Saficada Física',
        role: '@saficadafisica',
        bio: 'Física com humor e acessibilidade no TikTok.',
        imagePlaceholder: 'SF',
        color: 'brand-blue',
        platform: 'tiktok',
        link: 'https://www.tiktok.com/@saficadafisica'
    },
    {
        name: 'Ana Pleiade',
        role: '@a_pleiade',
        bio: 'Astronomia, astrofísica e inspiração científica no Instagram.',
        imagePlaceholder: 'AP',
        color: 'brand-blue',
        platform: 'instagram',
        link: 'https://www.instagram.com/a_pleiade'
    },
    {
        name: 'Gustavo Alves',
        role: 'Física e Vida Acadêmica',
        bio: 'Rotina de estudos, dicas de graduação e vida acadêmica na física.',
        imagePlaceholder: 'GA',
        color: 'brand-blue',
        platform: 'youtube',
        link: 'https://www.youtube.com/@ViverComoFisico'
    },
    {
        name: 'Alexandria 21',
        role: 'Agnessa',
        bio: 'Ciência, história e cultura científica no YouTube.',
        imagePlaceholder: 'A21',
        color: 'brand-red',
        platform: 'youtube',
        link: 'https://www.youtube.com/@Alexandria21'
    },
];

const getPlatformIcon = (platform: string) => {
    if (platform === 'youtube') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>;
    if (platform === 'instagram') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    if (platform === 'tiktok') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.36-5.17 2.05-7.11 1.57-1.79 4.11-2.9 6.55-2.73 0 1.34.02 2.69 0 4.03-1.07-.15-2.18.06-3.12.63-1.08.66-1.85 1.83-2.02 3.1-.15 1.14.07 2.34.61 3.32.78 1.45 2.58 2.36 4.19 2.03 2.15-.46 3.65-2.42 3.65-4.66.01-4.8.01-9.61 0-14.41-.01-.57-.01-1.14-.01-1.71h.01z" /></svg>;
    return <span className="material-symbols-outlined text-[18px]">open_in_new</span>;
};

export function GrandeColisorView({ oportunidades, mapItems }: GrandeColisorViewProps) {
    const wikiRef = React.useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = React.useState<string>('');

    const navItems = [
        { id: 'oportunidades', label: 'Oportunidades', href: '#oportunidades', icon: 'campaign', activeClass: 'text-brand-red bg-brand-red/10 border-brand-red/20', hoverClass: 'hover:text-brand-red hover:bg-brand-red/5' },
        { id: 'iniciativas', label: 'Iniciativas', href: '#iniciativas', icon: 'groups', activeClass: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30', hoverClass: 'hover:text-brand-blue hover:bg-brand-blue/5' },
        { id: 'espaços', label: 'Espaços', href: '#espaços', icon: 'map', activeClass: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30', hoverClass: 'hover:text-brand-blue hover:bg-brand-blue/5' },
        { id: 'influenciadores', label: 'Influenciadores', href: '#influenciadores', icon: 'record_voice_over', activeClass: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30', hoverClass: 'hover:text-brand-blue hover:bg-brand-blue/5' },
        { id: 'wiki-hub-section', label: 'Wiki', href: '#wiki-hub-section', icon: 'hub', activeClass: 'text-brand-blue bg-brand-blue/10 border-brand-blue/30', hoverClass: 'hover:text-brand-blue hover:bg-brand-blue/5' },
        { id: 'teste-radiacao', label: 'Teste', href: '#teste-radiacao', icon: 'quiz', activeClass: 'text-brand-red bg-brand-red/10 border-brand-red/20', hoverClass: 'hover:text-brand-red hover:bg-brand-red/5' },
    ];

    React.useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 3;
            
            // Loop backwards to find the deepest matching section
            for (let i = navItems.length - 1; i >= 0; i--) {
                const el = document.getElementById(navItems[i].id);
                if (el) {
                    const { offsetTop } = el;
                    if (scrollPosition >= offsetTop) {
                        setActiveSection(navItems[i].id);
                        return;
                    }
                }
            }
            if (window.scrollY < 200) {
                setActiveSection('');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex flex-col gap-32 pb-32">
            {/* 1. Header & Intro */}
            <section className="relative pt-12 text-center md:text-left">
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-brand-blue/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 md:translate-x-1/2" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-red rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-brand-blue/30 rotate-3"
                    >
                        <ColisorIcon className="w-12 h-12 text-white" animate />
                    </motion.div>
                    <div>
                        <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">
                            Grande <span className="text-brand-blue-accent">Colisor</span> do IF (GCIME)
                        </h1>
                        <p className="text-gray-500 max-w-2xl text-lg font-medium leading-relaxed">
                            O hub unificado de conhecimento, iniciativas e oportunidades da IME USP. Onde a radiação da criatividade encontra a precisão da pesquisa.
                        </p>
                    </div>
                </div>
            </section>

            {/* NEW: Top Navigation Bar */}
            <nav id="gcif-top-nav" className="flex flex-wrap items-center justify-center md:justify-start gap-2 sticky top-20 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-2 rounded-2xl border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none shadow-xl shadow-black/5 -mt-16 mb-8">
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActiveSection(item.id);
                                document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest border transition-all whitespace-nowrap rounded-xl ${
                                isActive 
                                    ? item.activeClass 
                                    : `border-transparent text-gray-400 bg-transparent ${item.hoverClass}`
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </nav>
            {/* 2. Oportunidades Section */}
            <section id="oportunidades" className="space-y-12">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red">
                        <ColisorIcon size={32} animate={false} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Oportunidades Ativas</h2>
                        <p className="text-gray-500 font-medium">Vagas, palestras e eventos selecionados para você.</p>
                    </div>
                </div>

                {!oportunidades || oportunidades.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 bg-white/5 border border-white/5 rounded-[40px] italic">
                        Varredura concluída. Nenhuma anomalia de oportunidade detectada no momento.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {oportunidades.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#1E1E1E] rounded-[32px] border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none p-8 flex flex-col gap-4 hover:border-brand-blue/30 transition-all hover:-translate-y-1 group">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase rounded-full">{item.tipo}</span>
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-brand-blue transition-colors line-clamp-2 leading-tight">{item.titulo}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{item.descricao}</p>

                                {/* Metadata: Data e Local */}
                                <div className="flex flex-col gap-2 mt-2">
                                    {item.data && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            <span className="text-xs font-semibold">{item.data}</span>
                                        </div>
                                    )}
                                    {item.local && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            <span className="text-xs font-semibold">{item.local}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5">
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-blue font-black text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                                            Acessar <ArrowRight className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 3. Iniciativas Section */}
            <section id="iniciativas" className="space-y-16">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
                        <Workflow className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Iniciativas e Espaços do IF</h2>
                        <p className="text-gray-500 font-medium">Explore projetos ativos e a infraestrutura do ecossistema.</p>
                    </div>
                </div>

                <div className="space-y-20">
                    <NetflixFeed 
                        title="Iniciativas de Impacto" 
                        icon={<div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue"><ColisorIcon size={20} animate={false} /></div>}
                    >
                        {/* HUB IME Card */}
                        <div className="snap-center shrink-0 w-[300px] md:w-[400px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none relative overflow-hidden group flex flex-col">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Landmark className="w-32 h-32 text-gray-900 dark:text-white" />
                            </div>
                            <div className="size-20 bg-gray-100 dark:bg-white rounded-3xl p-4 mb-8">
                                <img src="/hub-ime-logo.png" alt="hub-ime" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="text-2xl font-black italic uppercase mb-4 text-brand-blue">HUB IME</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">Comunicação científica inspirada no MIT. Tutoria entre pares, escrita e design.</p>
                            <Link href="/arquivo-ime" className="mt-auto px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] text-center group-hover:scale-105 transition-transform">Explorar Acervo</Link>
                        </div>

                        {/* Boletim Supernova */}
                        <div className="snap-center shrink-0 w-[300px] md:w-[350px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group">
                            <div className="size-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-8">
                                <span className="material-symbols-outlined text-4xl">newspaper</span>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase mb-4 text-gray-900 dark:text-white">Supernova</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">O boletim crítico e cultural do CEFISMA. A voz ativa da graduação.</p>
                            <a href="https://cefisma.com.br" target="_blank" className="mt-auto px-8 py-4 border border-brand-blue/20 text-brand-blue rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-brand-blue/10 transition-colors">Ler Supernova</a>
                        </div>

                        {/* BUSP */}
                        <div className="snap-center shrink-0 w-[300px] md:w-[350px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group">
                            <div className="size-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-8">
                                <span className="material-symbols-outlined text-4xl">library_books</span>
                            </div>
                            <h3 className="text-2xl font-black italic uppercase mb-4 tracking-tighter text-gray-900 dark:text-white">BUSP</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">A base de dados física. Biblioteca central do Instituto.</p>
                            <a href="https://portal.ime.usp.br/biblioteca/" target="_blank" className="mt-auto px-8 py-4 border border-brand-blue/20 text-brand-blue rounded-2xl font-black uppercase tracking-widest text-[10px] text-center hover:bg-brand-blue/10 transition-colors">Consultar</a>
                        </div>
                    </NetflixFeed>
                </div>
            </section>

            {/* 4. Espaços Section */}
            <section id="espaços" className="space-y-16">
                <div className="space-y-20">
                    <NetflixFeed 
                        title="Espaços do IF" 
                        icon={<div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue"><Info className="w-5 h-5" /></div>}
                    >
                        {/* Hackerspace */}
                        <div className="snap-center shrink-0 w-[300px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-8 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group hover:border-brand-yellow/30 transition-all">
                            <div className="size-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">memory</span>
                            </div>
                            <h3 className="text-xl font-black uppercase mb-3 text-gray-900 dark:text-gray-200">Hackerspace</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed mb-8 font-medium">Cultura maker no IF. Arduinos, 3D e colaboração radical.</p>
                            <a href="https://hackerspace.ime.usp.br" target="_blank" className="mt-auto text-brand-blue font-black uppercase tracking-tighter flex items-center gap-2 hover:underline font-bold">Visitar <ArrowRight className="w-4 h-4" /></a>
                        </div>

                        {/* DigitalLab - Espaço no Inova */}
                        <div className="snap-center shrink-0 w-[300px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-8 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group opacity-50 grayscale">
                            <div className="size-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red mb-6">
                                <span className="material-symbols-outlined text-4xl">desktop_windows</span>
                            </div>
                            <h3 className="text-xl font-black uppercase mb-3 text-gray-900 dark:text-gray-200">DigitalLab</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed mb-8 font-medium italic">Espaço no Inova. Experiências digitais e audiovisual. Em fase de ignição.</p>
                            <div className="mt-auto flex items-center gap-2 text-brand-red text-[10px] font-black uppercase tracking-widest">
                                Status: Carregando <span className="animate-pulse">...</span>
                            </div>
                        </div>

                        {/* CEFISMA - Amélia Império */}
                        <div className="snap-center shrink-0 w-[300px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-8 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group hover:border-brand-blue/30 transition-all">
                            <div className="size-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl">groups</span>
                            </div>
                            <h3 className="text-xl font-black uppercase mb-3 text-gray-900 dark:text-gray-200">Amélia Império</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed mb-8 font-medium">O Centro Acadêmico da Física (CEFISMA). Representação estudantil e espaço de convivência.</p>
                            <a href="https://cefisma.com.br" target="_blank" className="mt-auto text-brand-blue font-black uppercase tracking-tighter flex items-center gap-2 hover:underline">Conhecer <ArrowRight className="w-4 h-4" /></a>
                        </div>

                        {/* Lab Demo */}
                        <div className="snap-center shrink-0 w-[300px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-8 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none flex flex-col group group">
                            <div className="size-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red mb-6">
                                <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                            </div>
                            <h3 className="text-xl font-black uppercase mb-3 text-gray-900 dark:text-gray-200">Lab Demo</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed mb-8 font-medium">Demonstrações lúdicas e experimentos interativos.</p>
                            <a href="https://portal.ime.usp.br/demonstracoes/" target="_blank" className="mt-auto text-brand-red font-black uppercase tracking-tighter flex items-center gap-2 hover:underline">Ver Fenômenos <ArrowRight className="w-4 h-4" /></a>
                        </div>

                        {/* Parque CienTec */}
                        <div className="snap-center shrink-0 w-[400px] bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-9xl text-gray-900 dark:text-white">park</span>
                            </div>
                            <div className="size-20 bg-gray-100 dark:bg-white rounded-3xl p-4 mb-8">
                                <img src="/cientec-logo.png" alt="CienTec" className="w-full h-full object-contain" />
                            </div>
                            <h3 className="text-2xl font-black uppercase mb-4 text-gray-900 dark:text-white">CienTec</h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">Física a céu aberto. Museus, trilhas e observação estelar.</p>
                            <a href="https://parquecientec.usp.br" target="_blank" className="px-8 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-transparent dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors">Acessar Parque</a>
                        </div>
                    </NetflixFeed>
                </div>
            </section>

            {/* 5. Influenciadores Feed */}
            <section id="influenciadores">
                <NetflixFeed 
                title="Influenciadores do IF" 
                icon={<div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red"><Sparkles className="w-8 h-8" /></div>}
            >
                {influencers.map((influencer, index) => (
                    <div key={index} className="flex flex-col items-center text-center group snap-center shrink-0 w-[280px] p-8 bg-white dark:bg-[#1E1E1E] rounded-[40px] border border-gray-200 dark:border-white/5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none hover:border-brand-yellow/30 transition-all">
                        <div className={`relative w-24 h-24 rounded-full mb-6 flex items-center justify-center text-2xl font-bold text-white bg-${influencer.color} ring-4 ring-black/5 dark:ring-black/20 group-hover:scale-105 transition-transform`}>
                            {influencer.imagePlaceholder}
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-gray-900 dark:text-white">{influencer.name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-${influencer.color} mb-4`}>{influencer.role}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-500 leading-relaxed font-medium line-clamp-3 mb-6">{influencer.bio}</p>
                        <div className="mt-auto">
                            <a href={influencer.link} target="_blank" rel="noopener noreferrer" className={`size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white hover:bg-${influencer.color} transition-all`}>
                                {getPlatformIcon(influencer.platform)}
                            </a>
                        </div>
                    </div>
                ))}
                </NetflixFeed>
            </section>

            {/* 6. Wiki Hub Section */}
            <div id="wiki-hub-section" ref={wikiRef} className="scroll-mt-32">
                <WikiView />
            </div>
        </div>
    );
}
