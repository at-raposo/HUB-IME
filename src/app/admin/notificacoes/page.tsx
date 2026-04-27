import React from 'react';
import NotificacoesManager from '@/components/admin/NotificacoesManager';

export const metadata = {
    title: 'Central de Notificações | Admin Panel',
    description: 'Gerenciamento de comunicados e notificações da plataforma.',
};

export default function NotificacoesPage() {
    return (
        <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-transparent relative">
            {/* Background elements for premium look */}
            <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto">
                <NotificacoesManager />
            </div>
        </div>
    );
}
