'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { triggerNotification } from '@/lib/notifications';

export async function createDrop(content: string, parentId?: string) {
    const supabase = await createServerSupabase();
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Você precisa estar logado para postar.' };

    // 2. Insert Drop (Forçando status 'pending' para moderação)
    const { data: drop, error } = await supabase
        .from('micro_articles')
        .insert({
            author_id: user.id,
            content: content.trim(),
            parent_id: parentId || null,
            status: 'pending' // CLÁUSULA 2: Segurança e Aprovação
        })
        .select(`
            *,
            profiles:author_id (
                username
            )
        `)
        .single();

    if (error) {
        console.error('Error creating drop:', error);
        return { error: 'Erro ao salvar o log no banco de dados.' };
    }

    // 3. Trigger Email Notification (Non-blocking)
    try {
        const username = (drop.profiles as any)?.username || user.email?.split('@')[0] || 'membro';
        
        const { sendAdminNotification } = await import('@/lib/notifications');
        await sendAdminNotification({
            type: parentId ? 'thread_reply' : 'drop_submission',
            content: content.trim(),
            userName: username
        });
    } catch (notifyError) {
        console.error('Failed to send drop notification email:', notifyError);
    }

    revalidatePath('/drops');
    revalidatePath('/admin/drops');
    
    return { success: true, data: drop };
}

export async function fetchThreads(parentId: string) {
    const supabase = await createServerSupabase();
    
    const { data, error } = await supabase
        .from('micro_articles')
        .select(`
            *,
            likes_count,
            dislikes_count,
            profiles:author_id (
                name:full_name,
                handle:username,
                avatar:avatar_url,
                user_category,
                research_line,
                course,
                interest_area
            )
        `)
        .eq('parent_id', parentId)
        .eq('status', 'approved') // Apenas threads aprovadas
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching threads:', error);
        return { error: 'Erro ao carregar fios.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Buscando contagem de respostas e reação do usuário para cada thread
    const threadsWithContext = await Promise.all((data || []).map(async (thread) => {
        // Contagem de respostas
        const { count } = await supabase
            .from('micro_articles')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', thread.id)
            .eq('status', 'approved');

        // Reação do usuário atual
        let userReaction = null;
        if (user) {
            const { data: reaction } = await supabase
                .from('micro_article_likes')
                .select('reaction_type')
                .eq('article_id', thread.id)
                .eq('user_id', user.id)
                .single();
            userReaction = reaction?.reaction_type || null;
        }

        return { 
            ...thread, 
            replies_count: count || 0,
            user_reaction: userReaction
        };
    }));

    return { data: threadsWithContext };
}

export async function reactToDrop(dropId: string, reactionType: 'up' | 'down') {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Identificador único (User ID ou Fingerprint se quisermos permitir deslogado, mas usaremos user aqui)
    if (!user) return { error: 'Faça login para reagir.' };

    // 1. Verificar reação existente
    const { data: existing } = await supabase
        .from('micro_article_likes')
        .select('*')
        .eq('article_id', dropId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        if (existing.reaction_type === reactionType) {
            // Remover reação se for a mesma
            await supabase.from('micro_article_likes').delete().eq('id', existing.id);
            // Decrementar contador correspondente
            const column = reactionType === 'up' ? 'likes_count' : 'dislikes_count';
            await supabase.rpc('increment_micro_article_counter', { 
                article_id: dropId, 
                counter_column: column, 
                increment_by: -1 
            });
        } else {
            // Mudar tipo de reação
            await supabase
                .from('micro_article_likes')
                .update({ reaction_type: reactionType })
                .eq('id', existing.id);
            
            // Ajustar contadores
            if (reactionType === 'up') {
                await supabase.rpc('adjust_micro_article_reactions', {
                    article_id: dropId,
                    up_inc: 1,
                    down_inc: -1
                });
            } else {
                await supabase.rpc('adjust_micro_article_reactions', {
                    article_id: dropId,
                    up_inc: -1,
                    down_inc: 1
                });
            }
        }
    } else {
        // Nova reação
        await supabase.from('micro_article_likes').insert({
            article_id: dropId,
            user_id: user.id,
            reaction_type: reactionType
        });
        
        // Incrementar contador
        const column = reactionType === 'up' ? 'likes_count' : 'dislikes_count';
        await supabase.rpc('increment_micro_article_counter', { 
            article_id: dropId, 
            counter_column: column, 
            increment_by: 1 
        });
    }

    revalidatePath('/drops');
    return { success: true };
}
