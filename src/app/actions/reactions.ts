'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReactionType = 'atom_blue' | 'bulb_yellow' | 'spark_red';

export async function toggleReaction(submissionId: string, userId: string, type: ReactionType) {
    const supabase = await createServerSupabase();
    // 1. Check if reaction already exists
    const { data: existing } = await supabase
        .from('reactions')
        .select('id, reaction_type')
        .eq('submission_id', submissionId)
        .eq('user_id', userId)
        .maybeSingle();

    try {
        if (existing) {
            // If same type, remove it (toggle off)
            if (existing.reaction_type === type) {
                const { error: delError } = await supabase
                    .from('reactions')
                    .delete()
                    .eq('id', existing.id);
                if (delError) throw delError;
            } else {
                // If different type, delete then insert
                const { error: delError } = await supabase
                    .from('reactions')
                    .delete()
                    .eq('id', existing.id);
                if (delError) throw delError;

                const { error: insError } = await supabase
                    .from('reactions')
                    .insert({ submission_id: submissionId, user_id: userId, reaction_type: type });
                if (insError) throw insError;
            }
        } else {
            // New reaction
            const { error: insError } = await supabase
                .from('reactions')
                .insert({ submission_id: submissionId, user_id: userId, reaction_type: type });
            if (insError) throw insError;
        }

        revalidatePath(`/arquivo/${submissionId}`);
        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error('Error toggling reaction:', err);
        return { success: false, error: err };
    }
}

export async function getUserReaction(submissionId: string, userId: string | undefined) {
    if (!userId) return null;

    const supabase = await createServerSupabase();
    const { data } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('submission_id', submissionId)
        .eq('user_id', userId)
        .maybeSingle();

    return data?.reaction_type as ReactionType | null;
}
