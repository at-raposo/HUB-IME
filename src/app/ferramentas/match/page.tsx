import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MatchAcademicoTab } from '@/components/profile/MatchAcademicoTab';

export const metadata = {
    title: 'Match Acadêmico | IFUSP',
    description: 'Encontre colegas com interesses acadêmicos compatíveis.',
};

export default async function FerramentasMatchPage() {
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
        redirect('/lab');
    }

    // Merge pending edits so the user sees their latest interest signal immediately
    const mergedProfile = {
        ...profile,
        ...(profile.pending_edits || {})
    };

    return <MatchAcademicoTab profile={mergedProfile} />;
}
