'use client';

import { useState, useEffect } from 'react';

interface ShareButtonsProps {
    title: string;
    id: string;
}

export function ShareButtons({ title, id }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/arquivo/${id}`;
        }
        return `/arquivo/${id}`;
    };

    const handleCopyLink = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(getUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = getUrl();
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Confira este trabalho no Hub Lab-Div`,
                    url: getUrl(),
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const shareOptions = isMounted ? [
        { name: 'WhatsApp', icon: 'chat_bubble', color: 'bg-green-500', link: `https://wa.me/?text=${encodeURIComponent(`${title} — Hub Lab-Div\n${getUrl()}`)}` },
        { name: 'X (Twitter)', icon: 'close', color: 'bg-black', link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — Hub Lab-Div`)}&url=${encodeURIComponent(getUrl())}` },
        { name: 'Telegram', icon: 'send', color: 'bg-blue-400', link: `https://t.me/share/url?url=${encodeURIComponent(getUrl())}&text=${encodeURIComponent(title)}` },
    ] : [];
    
    return (
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">Compartilhar para...</p>

            <div className="flex flex-wrap gap-4 items-start">
                {isMounted && shareOptions.map((opt) => (
                    <a
                        key={opt.name}
                        href={opt.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 group w-16"
                    >
                        <div className={`${opt.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined">{opt.icon}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{opt.name}</span>
                    </a>
                ))}

                {isMounted && (
                    <button
                        onClick={handleCopyLink}
                        className="flex flex-col items-center gap-2 group w-16"
                    >
                        <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-md group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">{copied ? 'check' : 'link'}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                )}
            </div>

            {isMounted && typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                    onClick={handleNativeShare}
                    className="mt-6 px-6 py-3 bg-primary dark:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                    <span className="material-symbols-outlined">share</span>
                    Mais Opções Nativa
                </button>
            )}
        </div>
    );
}
