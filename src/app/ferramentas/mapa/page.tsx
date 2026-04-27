import React from 'react';
import MapClient from '@/app/mapa/MapClient';
import { fetchSubmissions } from '@/app/actions/submissions';

export const metadata = {
    title: 'Mapa Interativo | Ferramentas Acadêmicas',
    description: 'Navegue pelo campus interativo do IFUSP.',
};

export const dynamic = 'force-dynamic';

export default async function FerramentasMapaPage() {
    const { items: mapItems } = await fetchSubmissions({
        page: 1,
        limit: 100,
        query: '',
        sort: 'recentes'
    });

    return (
        <div className="py-6 px-4 max-w-7xl mx-auto">
            <div className="bg-white/5 rounded-[40px] border border-white/5 overflow-hidden h-[80vh] relative">
                <MapClient initialItems={mapItems || []} />
            </div>
        </div>
    );
}
