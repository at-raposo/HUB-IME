import { createServerSupabase } from '@/lib/supabase/server';
import IngressoClient from './IngressoClient';
import { redirect } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { IngressoFeedbackCard } from './IngressoFeedbackCard';

export default async function IngressoPage() {
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

    if (!profile) {
        redirect('/login');
    }

    return (
        <MainLayoutWrapper userId={user.id} rightSidebar={<IngressoFeedbackCard />}>
            <div className="max-w-7xl mx-auto">
                <IngressoClient profile={profile} />
            </div>
        </MainLayoutWrapper>
    );
}
