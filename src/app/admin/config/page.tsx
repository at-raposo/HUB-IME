import { AdminUnifiedClient } from '@/components/admin/AdminUnifiedClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Gerência Administrativa | AdminPanel',
    description: 'Controle de papéis e segurança do sistema.',
};

export default function AdminConfigPage() {
    return <AdminUnifiedClient />;
}
