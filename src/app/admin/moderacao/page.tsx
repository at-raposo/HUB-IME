import React, { Suspense } from 'react';
import { AdminModerationClient } from '@/components/admin/AdminModerationClient';

export const metadata = {
    title: 'Moderação do Fluxo | Admin',
};

export default function ModerationPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-neutral-900 border border-white/5">
                <span className="material-symbols-outlined animate-spin text-brand-blue text-4xl">progress_activity</span>
            </div>
        }>
            <AdminModerationClient />
        </Suspense>
    );
}
