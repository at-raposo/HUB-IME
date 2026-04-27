'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Archive, ExternalLink } from 'lucide-react';

const archivePosts = [
    {
        year: '1934',
        title: 'Gleb Wataghin chega ao Brasil',
        description: 'O físico ítalo-ucraniano desembarca no Brasil a convite da USP para fundar o Departamento de Física.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Gleb_Wataghin.jpg/220px-Gleb_Wataghin.jpg',
        tag: 'Acervo Histórico',
        category: 'Pioneiros'
    },
    {
        year: '1938',
        title: 'Cesare Lattes e os Mésons Pi',
        description: 'Lattes, formado pelo USP, participa da descoberta dos mésons pi, um dos feitos mais importantes da física brasileira.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Cesar_Lattes.jpg/220px-Cesar_Lattes.jpg',
        tag: 'Acervo Histórico',
        category: 'Descoberta'
    },
    {
        year: '1950',
        title: 'Oscar Sala e os Aceleradores',
        description: 'Instalação dos primeiros aceleradores de partículas do Departamento de Física, abrindo caminho para a física nuclear experimental.',
        image: 'https://portal.ime.usp.br/USP/sites/portal.ime.usp.br.USP/files/aceleradores.jpg',
        tag: 'Acervo Histórico',
        category: 'Infraestrutura'
    },
    {
        year: '1960',
        title: 'Consolidação da Pós-Graduação',
        description: 'Os programas de mestrado e doutorado em física se consolidam como referência nacional para formação de pesquisadores.',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&q=80&w=600',
        tag: 'Acervo Histórico',
        category: 'Ensino'
    },
    {
        year: '1970',
        title: 'Nasce o USP',
        description: 'A Reforma Universitária transforma o Departamento de Física do FFCL no Instituto de Física da USP.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
        tag: 'Acervo Histórico',
        category: 'Institucional'
    },
    {
        year: '1971',
        title: 'Edifícios Principais na Cidade Universitária',
        description: 'Inauguração do campus do USP no Butantã, incluindo os edifícios Ala I, Ala II e o Edifício Principal.',
        image: 'https://portal.ime.usp.br/USP/sites/portal.ime.usp.br.USP/files/styles/media_gallery_thumbnail/public/Mapa%20USP_2025_0.jpg?itok=1sXmy9vt',
        tag: 'Acervo Histórico',
        category: 'Campus'
    },
    {
        year: '1990',
        title: 'Parcerias com o CERN',
        description: 'Pesquisadores do USP integram grandes colaborações internacionais, participando de experimentos no LHC.',
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=600',
        tag: 'Acervo Histórico',
        category: 'Colaboração'
    },
    {
        year: '2012',
        title: 'Descoberta do Bóson de Higgs',
        description: 'Equipes do USP contribuem para a confirmação da existência do Bóson de Higgs pelo experimento ATLAS no CERN.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600',
        tag: 'Acervo Histórico',
        category: 'Descoberta'
    },
    {
        year: '2020',
        title: 'Pandemia e Divulgação Digital',
        description: 'O USP adapta suas atividades ao formato remoto e investe fortemente em divulgação científica nas redes.',
        image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=600',
        tag: 'Acervo Histórico',
        category: 'Adaptação'
    },
    {
        year: '2025',
        title: 'Hub HUB IME é Lançado',
        description: 'Nasce o Hub de Comunicação Científica do Instituto de Física, conectando a comunidade através de um grafo semântico.',
        image: '/HUB IME-logo.png',
        tag: 'HUB IME',
        category: 'Inovação'
    }
];

const categoryColors: Record<string, string> = {
    'Pioneiros': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    'Descoberta': 'bg-brand-red/10 text-brand-red border-brand-red/20',
    'Infraestrutura': 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
    'Ensino': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    'Institucional': 'bg-brand-red/10 text-brand-red border-brand-red/20',
    'Campus': 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
    'Colaboração': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    'Adaptação': 'bg-brand-red/10 text-brand-red border-brand-red/20',
    'Inovação': 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
    'HUB IME': 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
};

export function HistoricalPosts() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 380;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <section className="py-20 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="h-[2px] w-8 bg-brand-red"></div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">
                        Marcos Históricos
                    </h2>
                    <div className="flex items-center gap-1.5 ml-2 px-3 py-1 rounded-xl bg-brand-red/10 border border-brand-red/20">
                        <Archive className="w-3 h-3 text-brand-red" />
                        <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">
                            Acervo Histórico do IF
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                        aria-label="Scroll para esquerda"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                        aria-label="Scroll para direita"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Timeline Bar */}
            <div className="relative mb-8">
                <div className="h-[2px] w-full bg-gradient-to-r from-brand-blue/40 via-brand-red/40 to-brand-yellow/40 rounded-full" />
                <div className="flex justify-between mt-2 px-2">
                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">1934</span>
                    <span className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">2025</span>
                </div>
            </div>

            {/* Horizontal Scroll Container - Post Cards */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-6 hidden-scrollbar scroll-smooth snap-x snap-mandatory"
            >
                {archivePosts.map((post, idx) => {
                    const colorClass = categoryColors[post.category] || categoryColors['Pioneiros'];

                    return (
                        <motion.article
                            key={post.year + post.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="group min-w-[340px] max-w-[340px] flex-shrink-0 snap-start rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E1E1E] hover:shadow-xl transition-all duration-500 cursor-pointer"
                        >
                            {/* Image */}
                            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    sizes="340px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Year Badge */}
                                <div className="absolute bottom-3 left-4">
                                    <span className="text-3xl font-black text-white italic drop-shadow-lg">{post.year}</span>
                                </div>

                                {/* Archive Badge */}
                                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-brand-red/90 text-white text-[9px] font-black uppercase tracking-wider rounded shadow-lg">
                                    <Archive className="w-3 h-3" />
                                    {post.tag}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wide border ${colorClass}`}>
                                        {post.category}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                                    {post.description}
                                </p>

                                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                                    <Link
                                        href={`/wiki/instituto/${post.year}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase tracking-wider hover:bg-brand-blue/20 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Página Completa
                                    </Link>
                                    <a
                                        href="https://portal.ime.usp.br/USP/acervo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red/10 text-brand-red text-[10px] font-black uppercase tracking-wider hover:bg-brand-red/20 transition-colors"
                                    >
                                        <Archive className="w-3 h-3" />
                                        Ver no Acervo
                                    </a>
                                </div>

                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
