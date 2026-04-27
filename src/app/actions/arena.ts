'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchChallenges() {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('researcher_challenges')
        .select('*, creator:profiles(full_name, username, use_nickname, avatar_url)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching challenges:', error);
        return { error: 'Erro ao buscar desafios' };
    }

    return { success: true, data };
}

export async function submitToChallenge(challengeId: string, content: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
            challenge_id: challengeId,
            researcher_id: user.id,
            content
        });

    if (error) {
        console.error('Error submitting to challenge:', error);
        return { error: 'Erro ao enviar submissão' };
    }

    revalidatePath('/arena');
    return { success: true };
}

export async function voteSubmission(submissionId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { error } = await supabase.rpc('increment_submission_vote', { sub_id: submissionId });

    if (error) {
        console.error('Error voting:', error);
        return { error: 'Erro ao votar' };
    }

    revalidatePath('/arena');
    return { success: true };
}

export async function proposeChallenge(title: string, description: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { error } = await supabase
        .from('arena_suggestions')
        .insert({
            researcher_id: user.id,
            title,
            description
        });

    if (error) {
        console.error('Error proposing challenge:', error);
        return { error: 'Erro ao enviar proposta' };
    }

    revalidatePath('/arena');

    // Notify Admins
    const { sendAdminNotification } = await import('@/lib/notifications');
    const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).single();
    
    await sendAdminNotification({
        type: 'arena_suggestion',
        userName: profile?.full_name || (profile?.username ? `@${profile.username}` : user.email) || 'Pesquisador',
        title: title,
        content: description
    });

    return { success: true };
}

export async function fetchArenaSuggestions() {
    const supabase = await createServerSupabase();
    
    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autorizado' };
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Apenas administradores podem ver sugestões' };

    const { data, error } = await supabase
        .from('arena_suggestions')
        .select('*, researcher:profiles(full_name, username, avatar_url)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching arena suggestions:', error);
        return { error: 'Erro ao buscar sugestões' };
    }

    return { success: true, data };
}

export async function updateSuggestionStatus(suggestionId: string, status: 'approved' | 'rejected' | 'pending') {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Acesso negado' };
    }

    const { error } = await supabase
        .from('arena_suggestions')
        .update({ status })
        .eq('id', suggestionId);

    if (error) {
        console.error('Error updating suggestion status:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/arena');
    revalidatePath('/admin/desafios');
    return { success: true };
}

export async function createChallenge(title: string, description: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Acesso negado' };
    }

    const { error } = await supabase
        .from('researcher_challenges')
        .insert({
            title,
            description,
            created_by: user?.id
        });

    if (error) {
        console.error('Error creating challenge:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/arena');
    revalidatePath('/admin/desafios');
    return { success: true };
}

export async function fetchArenaFeedback() {
    const supabase = await createServerSupabase();
    
    // Admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Não autorizado' };
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Apenas administradores podem ver feedbacks' };

    const { data, error } = await supabase
        .from('feedback_reports')
        .select('*, user:profiles(full_name, username, avatar_url)')
        .eq('metadata->source', 'arena_researcher')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching arena feedback:', error);
        return { error: 'Erro ao buscar feedbacks do HUB' };
    }

    return { success: true, data };
}

