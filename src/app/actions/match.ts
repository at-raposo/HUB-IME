'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export async function fetchClassmates(subjectCode: string) {
    const supabase = await createServerSupabase();
    
    // Query users who have this subject in their calendar
    // We use the 'type' column with prefix 'aula:' as implemented in calendar.ts
    const { data, error } = await supabase
        .from('user_calendar_events')
        .select(`
            user_id,
            profiles:user_id (
                id,
                full_name,
                role,
                bio,
                avatar_url
            )
        `)
        .eq('type', `aula:${subjectCode}`);

    if (error) {
        console.error('[Fetch Classmates Error]', error);
        return { success: false, error: error.message };
    }

    // Deduplicate users (one user might have multiple events for the same subject)
    const uniqueUsers = new Map();
    data?.forEach((item: any) => {
        if (item.profiles && !uniqueUsers.has(item.user_id)) {
            uniqueUsers.set(item.user_id, item.profiles);
        }
    });

    const results = Array.from(uniqueUsers.values());

    // Always provide 3 diverse dummy profiles for testing as requested by the user
    // These will be appended to real results if they exist
    const dummyProfiles = [
        { 
            id: 'dummy-alice', 
            full_name: 'Alice Oliveira (Beta)', 
            role: 'student', 
            bio: 'Estudante de Física (USP). Curto astronomia e estou procurando grupo para ' + subjectCode,
            avatar_url: null,
            user_category: 'aluno_usp',
            entrance_year: 2024
        },
        { 
            id: 'dummy-bob', 
            full_name: 'Roberto "Bob" Silva (Beta)', 
            role: 'student', 
            bio: 'Cibersegurança e Algoritmos no IME. Bora estudar ' + subjectCode + '?',
            avatar_url: null,
            user_category: 'bacharelado',
            entrance_year: 2023
        },
        { 
            id: 'dummy-carla', 
            full_name: 'Carla Beatriz (Beta)', 
            role: 'student', 
            bio: 'Buscando monitoria e grupos de estudo para as matérias do ciclo básico.',
            avatar_url: null,
            user_category: 'licenciatura',
            entrance_year: 2025
        }
    ];

    // Merge real results and dummy profiles
    // In a real app, we might only show mocks if results.length === 0, 
    // but for testing the "match" with 3 users, we'll ensure they are there.
    const finalData = [...results, ...dummyProfiles].slice(0, 10); // Limit to 10 for UI cleaness

    return { 
        success: true, 
        data: finalData,
        isMock: results.length === 0 
    };
}
