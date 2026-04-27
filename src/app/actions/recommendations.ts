'use server';

import { supabase } from '@/lib/supabase';
import { PostDTO, mapToPostDTO } from '@/dtos/media';

export async function getForYouRecommendations(userId: string | undefined): Promise<{ post: PostDTO }[]> {
    if (!userId) {
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(4);
        return (data || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    const { data: history } = await supabase
        .from('reading_history')
        .select(`
            submission_id,
            submissions (*)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(10);

    if (!history || history.length === 0) {
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .order('views', { ascending: false })
            .limit(4);
        return (data || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    const categories = Array.from(new Set(history.map((h: any) => h.submissions.category).filter(Boolean)));
    const readIds = history.map((h: any) => h.submission_id);

    let query = supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .not('id', 'in', `(${readIds.join(',')})`);

    if (categories.length > 0) {
        query = query.in('category', categories);
    }

    const { data: recommendations, error } = await query
        .order('created_at', { ascending: false })
        .limit(4);

    if (error || !recommendations || recommendations.length < 2) {
        const { data: fallback } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .not('id', 'in', `(${readIds.join(',')})`)
            .order('views', { ascending: false })
            .limit(4);
        return (fallback || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    return recommendations.map(sub => ({ post: mapToPostDTO(sub) }));
}

export async function getUserInterest(userId?: string): Promise<string | null> {
    let targetId = userId;
    
    if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        targetId = user.id;
    }

    const counts: Record<string, number> = {};

    // Source 1: Reading History (Weights: 1)
    const { data: history } = await supabase
        .from('reading_history')
        .select(`
            submission_id,
            submissions (isotopes, tags)
        `)
        .eq('user_id', targetId)
        .order('last_accessed_at', { ascending: false });

    if (history && history.length > 0) {
        history.forEach((h: any) => {
            const sub = h.submissions;
            if (!sub) return;
            if (sub.isotopes && Array.isArray(sub.isotopes)) {
                sub.isotopes.forEach((iso: string) => { if (iso) counts[iso] = (counts[iso] || 0) + 1; });
            }
            if (sub.tags && Array.isArray(sub.tags)) {
                sub.tags.forEach((tag: string) => { if (tag) counts[tag] = (counts[tag] || 0) + 1; });
            }
        });
    }

    // Source 2: User's own Approved Submissions (Weights: 2 - higher intent)
    const { data: ownSubs } = await supabase
        .from('submissions')
        .select('isotopes, tags')
        .eq('user_id', targetId)
        .eq('status', 'aprovado');

    if (ownSubs && ownSubs.length > 0) {
        ownSubs.forEach((sub: any) => {
            if (sub.isotopes && Array.isArray(sub.isotopes)) {
                sub.isotopes.forEach((iso: string) => { if (iso) counts[iso] = (counts[iso] || 0) + 2; });
            }
            if (sub.tags && Array.isArray(sub.tags)) {
                sub.tags.forEach((tag: string) => { if (tag) counts[tag] = (counts[tag] || 0) + 2; });
            }
        });
    }

    // Source 3: Profile Fields (Weight: 3 - declared interest)
    const { data: profile } = await supabase
        .from('profiles')
        .select('interests, artistic_interests, ic_research_area, interest_area, research_line')
        .eq('id', targetId)
        .single();

    if (profile) {
        [profile.ic_research_area, profile.interest_area, profile.research_line].forEach(val => {
            if (val && typeof val === 'string' && val.trim()) {
                const interest = val.trim().toLowerCase();
                counts[interest] = (counts[interest] || 0) + 3;
            }
        });
        if (profile.interests && Array.isArray(profile.interests)) {
            profile.interests.forEach((val: string) => { if (val) counts[val.toLowerCase()] = (counts[val.toLowerCase()] || 0) + 3; });
        }
        if (profile.artistic_interests && Array.isArray(profile.artistic_interests)) {
            profile.artistic_interests.forEach((val: string) => { if (val) counts[val.toLowerCase()] = (counts[val.toLowerCase()] || 0) + 3; });
        }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
}
