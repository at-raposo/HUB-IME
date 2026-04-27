import { fetchSubmissions } from "@/app/actions/submissions";
import { SobreClient } from "./SobreClient";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = {
    title: 'HUB IME | Hub HUB IME',
    description: 'Conheça o Laboratório de Divulgação Científica do USP e o projeto do Hub.',
};

export default async function SobrePage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const [submissionsRes, profileRes] = await Promise.all([
        fetchSubmissions({
            page: 1,
            limit: 4,
            query: '',
            categories: ['Impacto e Conquistas'],
            sort: 'recentes'
        }),
        user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null })
    ]);

    return (
        <SobreClient 
            initialTestimonials={submissionsRes.items} 
            profile={profileRes.data ? { ...profileRes.data, email: user?.email } as any : null}
        />
    );
}
