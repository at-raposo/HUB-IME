import { Suspense } from 'react';
import InteracaoClient from './InteracaoClient';

export const metadata = {
    title: 'Interação | IFUSP Ciência',
    description: 'Hub central de interação, laboratório pessoal e emaranhamento científico.',
};

export default function InteracaoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
            <InteracaoClient />
        </Suspense>
    );
}
