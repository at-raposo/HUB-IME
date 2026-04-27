'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function PwaManager() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Handle native online/offline events
        const handleOffline = () => {
            setIsOffline(true);
            toast.error('Sem Internet. Você está offline.', {
                id: 'offline-status',
                duration: Infinity,
                icon: '📵'
            });
        };

        const handleOnline = () => {
            setIsOffline(false);
            toast.success('Conexão restabelecida!', {
                id: 'offline-status',
                duration: 4000,
                icon: '🟢'
            });
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        // Check initial state
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            handleOffline();
        }

        // Listen for Service Worker messages (Cache Used)
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'OFFLINE_CACHE_USED') {
                toast('Conexão instável. Mostrando versão em cache.', {
                    id: 'cache-used',
                    icon: '⚡',
                    duration: 5000,
                    style: {
                        background: '#334155',
                        color: '#f8fafc',
                    }
                });
            }
        };

        navigator.serviceWorker?.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
            toast.dismiss('offline-status');
        };
    }, []);

    return null;
}
