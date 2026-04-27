import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TrailDetailsClient from '@/app/trilhas/TrailDetailsClient';

export const revalidate = 0;

async function getTrailData(id: string) {
    const supabase = await createServerSupabase();

    const { data: trail, error: trailError } = await supabase
        .from('learning_trails')
        .select('*')
        .eq('id', id)
        .single();

    if (trailError || !trail) return null;

    const { data: materials, count: totalMaterials, error: matError } = await supabase
        .from('trail_submissions')
        .select(`
            trail_id,
            topic_index,
            sort_order,
            submissions!inner (
                id,
                title,
                authors,
                description,
                media_type,
                media_url,
                created_at,
                views,
                like_count,
                status
            )
        `, { count: 'exact' })
        .eq('trail_id', id)
        .eq('submissions.status', 'aprovado')
        .order('sort_order', { ascending: true })
        .limit(6);

    if (matError) {
        console.error(' [DEBUG] matError:', matError);
    }

    let prerequisiteTrails: { course_code: string; title: string; id: string }[] = [];
    if (trail.prerequisites && trail.prerequisites.length > 0) {
        const { data: prereqs } = await supabase
            .from('learning_trails')
            .select('id, course_code, title')
            .in('course_code', trail.prerequisites);
        prerequisiteTrails = prereqs || [];
    }

    let equivalentTrails: { id: string; course_code: string; title: string; axis: string }[] = [];
    if (trail.equivalence_group) {
        const { data: eqTrails } = await supabase
            .from('learning_trails')
            .select('id, course_code, title, axis')
            .eq('equivalence_group', trail.equivalence_group)
            .neq('id', trail.id);
        equivalentTrails = eqTrails || [];
    }

    let xorExclusions: { group_a: string; group_b: string; reason: string }[] = [];
    if (trail.course_code || trail.equivalence_group) {
        const codes = [trail.course_code, trail.equivalence_group].filter(Boolean);
        const { data: xorData } = await supabase
            .from('equivalence_exclusions')
            .select('group_a, group_b, reason')
            .or(codes.map(c => `group_a.eq.${c},group_b.eq.${c}`).join(','));
        xorExclusions = xorData || [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    let userProgress = null;
    let isCompleted = false;
    let isCompletedEquivalent = false;

    if (user) {
        const { data: progress } = await supabase
            .from('user_trail_progress')
            .select('status, completed_topics')
            .eq('trail_id', id)
            .eq('user_id', user.id)
            .single();
        userProgress = progress;

        const { data: completed } = await supabase
            .from('user_completed_trails')
            .select('id')
            .eq('trail_id', id)
            .eq('user_id', user.id)
            .single();
        isCompleted = !!completed;

        if (!isCompleted && trail.equivalency_map) {
            const { data: allUserCompleted } = await supabase
                .from('user_completed_trails')
                .select('learning_trails!inner(course_code)')
                .eq('user_id', user.id);

            if (allUserCompleted) {
                const completedCodes = new Set(allUserCompleted.map((m: any) => m.learning_trails?.course_code));
                Object.values(trail.equivalency_map).forEach((config: any) => {
                    const { codes, logic } = config;
                    const isSatisfied = logic === 'AND'
                        ? codes.every((c: string) => completedCodes.has(c))
                        : codes.some((c: string) => completedCodes.has(c));
                    if (isSatisfied) isCompletedEquivalent = true;
                });
            }
        }
    }

    return {
        trail,
        materials: materials?.map((m: any) => ({
            ...m.submissions,
            topic_index: m.topic_index,
            submission_link_id: `${m.trail_id}-${m.submissions.id}`
        })) || [],
        totalMaterials: totalMaterials || 0,
        userProgress: userProgress || null,
        isCompleted,
        isCompletedEquivalent,
        prerequisiteTrails,
        equivalentTrails,
        xorExclusions,
    };
}

export default async function FerramentasTrailDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getTrailData(id);

    if (!data) notFound();

    return (
        <TrailDetailsClient
            trail={data.trail}
            initialMaterials={data.materials}
            totalMaterials={data.totalMaterials}
            userProgress={data.userProgress}
            isCompleted={data.isCompleted}
            isCompletedEquivalent={data.isCompletedEquivalent}
            prerequisiteTrails={data.prerequisiteTrails}
            equivalentTrails={data.equivalentTrails}
            xorExclusions={data.xorExclusions}
        />
    );
}
