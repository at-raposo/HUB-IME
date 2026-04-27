'use server';

import { v2 as cloudinary } from 'cloudinary';
import { createServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const submissionSchema = z.object({
    submission_id: z.string().uuid(),
});

/**
 * V8.0 Rate Limiting: Simple in-memory strategy for Server Actions.
 * For high-scale production, use Redis (Upstash).
 */
const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 10000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS) return false;

    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    return true;
}

export async function toggleLike(formData: { submission_id: string }) {
    const validated = submissionSchema.safeParse(formData);
    if (!validated.success) return { error: 'Invalid input' };

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    if (!checkRateLimit(user.id)) {
        return { error: 'Too many requests. Slow down, scientist.' };
    }

    const { data: existing } = await supabase
        .from('curtidas')
        .select('id')
        .eq('submission_id', validated.data.submission_id)
        .eq('user_id', user.id)
        .maybeSingle();

    try {
        if (existing) {
            const { error } = await supabase.from('curtidas').delete().eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('curtidas').insert({
                submission_id: validated.data.submission_id,
                user_id: user.id,
                fingerprint: user.id, // Use full ID as fingerprint to ensure uniqueness
            });
            if (error) throw error;
        }

        revalidatePath('/');
        revalidatePath(`/arquivo/${validated.data.submission_id}`);
        return { success: true, liked: !existing };
    } catch (err: any) {
        console.error('Action toggleLike error:', err);
        return { error: err.message || 'Error syncing atom (like)' };
    }
}

export async function checkUserLikes(submissionIds: string[]): Promise<string[]> {
    if (!submissionIds.length) return [];

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('curtidas')
        .select('submission_id')
        .eq('user_id', user.id)
        .in('submission_id', submissionIds);

    if (error) {
        console.error('Action checkUserLikes error:', error);
        return [];
    }
    return data?.map(d => d.submission_id) || [];
}

export async function toggleSave(formData: { submission_id: string }) {
    const validated = submissionSchema.safeParse(formData);
    if (!validated.success) return { error: 'Invalid input' };

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: existing } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('submission_id', validated.data.submission_id)
        .eq('user_id', user.id)
        .maybeSingle();

    try {
        if (existing) {
            const { error } = await supabase.from('saved_posts').delete().eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('saved_posts').insert({
                submission_id: validated.data.submission_id,
                user_id: user.id,
            });
            if (error) throw error;
        }

        revalidatePath('/');
        return { success: true, saved: !existing };
    } catch (err: any) {
        console.error('Action toggleSave error:', err);
        return { error: err.message || 'Error syncing save' };
    }
}

export async function checkUserSaves(submissionIds: string[]): Promise<string[]> {
    if (!submissionIds.length) return [];

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('saved_posts')
        .select('submission_id')
        .eq('user_id', user.id)
        .in('submission_id', submissionIds);

    if (error) return [];
    return data?.map(d => d.submission_id) || [];
}

export async function generateCloudinarySignature() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // V8.0 Point 2: Timestamp sync for Cloudinary signing
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'assets/submissions';

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
    };
}
