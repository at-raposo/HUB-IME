import React from 'react';
import { ExplorarClient } from '@/components/explorar/ExplorarClient';
import { fetchSubmissions } from '@/app/actions/submissions';
import { supabase } from '@/lib/supabase';

export const metadata = {
    title: 'O Grande Colisor do IF | Hub HUB IME',
    description: 'Wiki, Mapa e Grande Colisor unificados para exploração simplificada.',
};

export const dynamic = 'force-dynamic';

export default async function ExplorarPage() {
    // Fetch Mapa Data
    const { items: mapItems } = await fetchSubmissions({
        page: 1,
        limit: 100,
        query: '',
        sort: 'recentes'
    });

    // Fetch Colisor Data
    const { data: oportunidades } = await supabase
        .from('oportunidades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    return <ExplorarClient mapItems={mapItems || []} oportunidades={oportunidades || []} />;
}
