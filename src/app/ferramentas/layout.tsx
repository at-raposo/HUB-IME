import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { FerramentasFeedbackCard } from './FerramentasFeedbackCard';
import { ToolsSubNav } from '@/components/layout/ToolsSubNav';

export default async function FerramentasLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <MainLayoutWrapper
            userId={user.id}
            fullWidth={true}
            rightSidebar={<FerramentasFeedbackCard />}
        >
            <ToolsSubNav />
            {children}
        </MainLayoutWrapper>
    );
}
