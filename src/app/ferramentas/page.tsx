import { createServerSupabase } from '@/lib/supabase/server';
import FerramentasClient from './FerramentasClient';
import { redirect } from 'next/navigation';

export default async function FerramentasPage() {
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

    const isStudent = ['aluno_usp', 'licenciatura', 'bacharelado', 'pos_graduacao'].includes(profile?.user_category);

    if (!profile || !isStudent) {
        redirect('/lab');
    }

    return <FerramentasClient profile={profile} />;
}
