import { createServerSupabase } from '@/lib/supabase/server';
import ArenaClient from './ArenaClient';
import { redirect } from 'next/navigation';
import { ArenaFeedbackCard } from './ArenaFeedbackCard';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default async function ArenaPage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.user_category !== 'pesquisador') {
        // Only researchers have access to the Arena
        redirect('/lab');
    }

    return (
        <MainLayoutWrapper userId={user.id} rightSidebar={<ArenaFeedbackCard />}>
            <div className="w-full space-y-8">
                <header className="px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white">
                        Observatório de Pesquisa
                    </h1>
                    <ArenaFeedbackCard className="lg:hidden mt-4" />
                </header>
                <ArenaClient profile={profile} />
            </div>
        </MainLayoutWrapper>
    );
}
