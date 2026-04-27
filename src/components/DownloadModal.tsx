'use client';

import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useHistoryBack } from '@/hooks/useHistoryBack';
import { stripMarkdownAndLatex } from '@/lib/utils';
import { useTelemetry } from '@/hooks/useTelemetry';

interface DownloadModalProps {
    id: string;
    title: string;
    authors: string;
    avatarUrl?: string;
    description?: string;
    mediaUrl: string;
    onClose: () => void;
}

export const DownloadModal = ({ id, title, authors, avatarUrl, description, mediaUrl, onClose }: DownloadModalProps) => {
    const { trackEvent } = useTelemetry();
    const [isDownloading, setIsDownloading] = useState<'pdf' | 'md' | 'img' | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const pdfCardRef = useRef<HTMLDivElement>(null);

    // [B14] Native back button support
    useHistoryBack(true, onClose);

    // 1. Download as High-Quality PDF (Dynamic Import)
    const handleDownloadPDF = async () => {
        setIsDownloading('pdf');
        trackEvent('FILE_DOWNLOAD', { file_name: `${title}.pdf`, type: 'pdf', submission_id: id });
        const loadingToast = toast.loading('Diagramando PDF de alta qualidade...');

        try {
            const { domToPng } = await import('modern-screenshot');
            const jspdfModule = await import('jspdf');
            const JsPDFClass = jspdfModule.default || jspdfModule.jsPDF;

            if (pdfCardRef.current) {
                const node = pdfCardRef.current;

                // Get accurate dimensions before capturing
                const divWidth = node.scrollWidth || 800;
                const divHeight = node.scrollHeight || 1123;

                const dataUrl = await domToPng(node, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    width: divWidth,
                    height: divHeight,
                    quality: 1.0,
                    fetch: {
                        bypassingCache: true
                    },
                    font: {
                        cssText: `
                            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400..900&display=swap');
                        `
                    }
                });

                const imgWidth = 595.28; // A4 width in pt
                const pageHeight = 841.89; // A4 height in pt

                const ratio = imgWidth / divWidth;
                const imgHeight = divHeight * ratio;

                // @ts-ignore
                const doc = new JsPDFClass({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: 'a4'
                });

                let heightLeft = imgHeight;
                let position = 0;

                doc.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                toast.success('Documento montado e salvo!', { id: loadingToast });
            }
        } catch (err) {
            console.error(err);
            toast.error('Ocorreu um erro ao gerar a diagramação.', { id: loadingToast });
        } finally {
            setIsDownloading(null);
        }
    };

    // 2. Download as Markdown (Native)
    const handleDownloadMD = () => {
        setIsDownloading('md');
        trackEvent('FILE_DOWNLOAD', { file_name: `${title}.md`, type: 'markdown', submission_id: id });
        try {
            const content = `# ${title}\n\n**Autores:** ${authors}\n\n---\n\n${description || ''}\n\n--- \n*Baixado do Hub de Comunicação Científica Lab-Div*`;
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Markdown baixado!');
        } catch (err) {
            toast.error('Erro ao baixar Markdown');
        } finally {
            setIsDownloading(null);
        }
    };

    // 3. Download as Social Image (Dynamic Import)
    const handleDownloadImage = async () => {
        setIsDownloading('img');
        trackEvent('FILE_DOWNLOAD', { file_name: `${title}-social.png`, type: 'social_image', submission_id: id });
        const loadingToast = toast.loading('Gerando imagem...');

        try {
            const { domToPng } = await import('modern-screenshot');

            if (cardRef.current) {
                const node = cardRef.current;

                const dataUrl = await domToPng(node, {
                    scale: 2,
                    backgroundColor: '#121212',
                    width: node.scrollWidth || 600,
                    height: node.scrollHeight || 800,
                    fetch: {
                        bypassingCache: true
                    },
                    font: {
                        cssText: `
                            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400..900&display=swap');
                        `
                    }
                });

                if (dataUrl) {
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-social.png`;
                    a.click();
                    toast.success('Imagem gerada!', { id: loadingToast });
                }
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar imagem', { id: loadingToast });
        } finally {
            setIsDownloading(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <m.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                drag="y"
                dragConstraints={{ top: 0, bottom: 200 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 100) onClose();
                }}
                className="relative w-full max-w-md bg-[#1E1E1E] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl touch-none"
            >
                <div className="p-8 space-y-6">
                    <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto -mt-2 mb-4 opacity-50" />
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center size-14 bg-brand-blue/10 text-brand-blue rounded-2xl mb-2">
                            <span className="material-symbols-outlined text-3xl">download_for_offline</span>
                        </div>
                        <h2 className="text-2xl font-black text-white">Levar o conhecimento</h2>
                        <p className="text-gray-400 text-sm">Escolha como deseja baixar este conteúdo:</p>
                    </div>

                    <div className="grid gap-3">
                        {/* PDF Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadPDF}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-blue/10 border border-gray-800 hover:border-brand-blue/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-blue/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-blue transition-colors">
                                {isDownloading === 'pdf' ? (
                                    <div className="size-5 border-2 border-brand-blue border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">Documentação PDF</p>
                                <p className="text-[10px] text-gray-500 font-medium">Layout diagramado c/ logotipo e texto completo</p>
                            </div>
                        </button>

                        {/* Markdown Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadMD}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-yellow/10 border border-gray-800 hover:border-brand-yellow/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-yellow/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-yellow transition-colors">
                                {isDownloading === 'md' ? (
                                    <div className="size-5 border-2 border-brand-yellow border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">markdown</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">O Markdown Secundário</p>
                                <p className="text-[10px] text-gray-500 font-medium">Para usar em editores como Obsidian ou Notion</p>
                            </div>
                        </button>

                        {/* Image Option */}
                        <button
                            disabled={!!isDownloading}
                            onClick={handleDownloadImage}
                            className="group flex items-center gap-4 p-4 bg-gray-900/50 hover:bg-brand-red/10 border border-gray-800 hover:border-brand-red/50 rounded-2xl transition-all disabled:opacity-50"
                        >
                            <div className="size-12 bg-gray-800 group-hover:bg-brand-red/20 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-red transition-colors">
                                {isDownloading === 'img' ? (
                                    <div className="size-5 border-2 border-brand-red border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <span className="material-symbols-outlined">identity_platform</span>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">Imagem Social (Card)</p>
                                <p className="text-[10px] text-gray-500 font-medium">Capture o card resumido para o Instagram</p>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                </div>
            </m.div>

            {/* Hidden capture element 1: Social Image */}
            <div className="fixed -top-[9999px] -left-[9999px] -z-50 opacity-0 pointer-events-none" aria-hidden="true">
                <div
                    ref={cardRef}
                    className="w-[600px] p-10 bg-[#121212] flex flex-col gap-6 text-white border-2 border-brand-blue/30 rounded-3xl"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                >
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-32 bg-brand-blue/10 rounded flex items-center justify-center shrink-0">
                            <span className="text-brand-blue font-black text-xs uppercase tracking-tighter" style={{ fontFamily: '"Inter", sans-serif' }}>LAB-DIV HUB</span>
                        </div>
                        <img src="/labdiv-logo.png" crossOrigin="anonymous" alt="Hub Lab-Div" className="h-10 w-10 object-contain rounded-lg opacity-90 shadow-2xl" />
                    </div>

                    {mediaUrl && (
                        <div className="w-full aspect-video rounded-xl bg-black/20 border border-gray-800 overflow-hidden shadow-inner">
                            <img src={mediaUrl} crossOrigin="anonymous" alt="Capa" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-wrap leading-tight">{title}</h1>
                        <div className="flex items-center gap-3">
                            {avatarUrl ? (
                                <img src={avatarUrl} crossOrigin="anonymous" alt={authors} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-blue/20" />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue uppercase">
                                    {authors.substring(0, 2)}
                                </div>
                            )}
                            <p className="text-xl font-bold text-brand-blue">{authors}</p>
                        </div>
                    </div>

                    <div className="text-lg text-gray-300 leading-relaxed italic border-l-4 border-gray-800 pl-6">
                        {stripMarkdownAndLatex(description || '').substring(0, 300)}...
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-800 flex justify-between items-center text-sm font-bold text-gray-500">
                        <span>Arquivo Lab-Div V3.0</span>
                        <span>hub.labdiv.if.usp.br</span>
                    </div>
                </div>
            </div>

            {/* Hidden capture element 2: High Quality Printable PDF Layout */}
            <div className="fixed -top-[9999px] -left-[9999px] -z-50 opacity-0 pointer-events-none" aria-hidden="true">
                <div
                    ref={pdfCardRef}
                    className="w-[800px] p-16 bg-white flex flex-col text-black"
                    style={{ minHeight: '1123px', fontFamily: '"Inter", sans-serif' }}
                >
                    {/* Official Document Header */}
                    <div className="flex items-center justify-between border-b-[6px] border-brand-blue pb-8 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 bg-blue-50/50 rounded-2xl flex items-center justify-center shadow-lg border border-brand-blue/10 overflow-hidden p-1 shrink-0">
                                <img src="/labdiv-logo.png" crossOrigin="anonymous" alt="Hub Lab-Div" className="w-full h-full object-contain drop-shadow" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-brand-blue tracking-tight uppercase" style={{ fontFamily: '"Inter", sans-serif' }}>Instituto de Física | USP</h1>
                                <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mt-1" style={{ fontFamily: '"Inter", sans-serif' }}>Acervo do Laboratório de Divulgação (Lab-Div)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        <h1 className="text-5xl font-black text-wrap leading-[1.15] text-gray-900" style={{ fontFamily: '"Inter", sans-serif' }}>{title}</h1>

                        {mediaUrl && (
                            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 bg-gray-50 mt-6 relative">
                                <img src={mediaUrl} crossOrigin="anonymous" alt="Ilustração do envio" className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-6">
                            <div className="flex shrink-0 items-center justify-center h-14 w-14 rounded-full bg-brand-blue/10 text-brand-blue overflow-hidden ring-4 ring-white shadow-sm">
                                {avatarUrl ? (
                                    <img src={avatarUrl} crossOrigin="anonymous" alt={authors} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-black text-xl uppercase">{authors.substring(0, 2)}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest font-black text-gray-500">Documento catalogado sob autoria de</p>
                                <p className="text-xl font-bold text-gray-900">{authors}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 text-xl text-gray-800 leading-loose text-justify whitespace-pre-wrap font-medium">
                            {stripMarkdownAndLatex(description || '')}
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t-2 border-gray-200 flex justify-between items-center text-sm font-bold text-gray-400">
                        <span>Documento gerado em {new Date().toLocaleDateString('pt-BR')}</span>
                        <span className="text-brand-blue">hub.labdiv.if.usp.br/arquivo/{id}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
