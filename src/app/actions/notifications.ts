'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchNotifications(userId: string) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return [];
    return data;
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return { success: !error };
}

export async function getUnreadCount(userId: string) {
    const supabase = await createServerSupabase();
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return count || 0;
}

export async function markAllNotificationsAsRead(userId: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    revalidatePath('/');
    return { success: !error };
}

export async function sendAutomaticNotification({ userId, title, message, link, type = 'system' }: {
    userId: string;
    title: string;
    message: string;
    link?: string;
    type?: string;
}) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Insert into notifications (user's bell)
    const { error: nError } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        link: link || null,
        type: type
    });

    if (nError) {
        console.error('Error inserting user notification:', nError);
        return { success: false, error: nError.message };
    }

    // 2. Insert into admin_notifications (audit history)
    const { error: aError } = await supabase.from('admin_notifications').insert({
        sender_id: user?.id || null, // System-triggered notifications might not have a current user context, but usually they do
        title,
        message,
        link: link || null,
        target_type: 'automatic',
        target_value: userId,
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: 1
    });

    if (aError) {
        console.warn('Error recording admin notification audit:', aError);
        // We don't fail the whole action if only audit fails, but it's good to know
    }

    return { success: true };
}
