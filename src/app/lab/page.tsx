import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LabClientView } from './LabClientView';
import { fetchUserSubmissions, getFollowStats } from '@/app/actions/submissions';
import { getUserInterest } from '@/app/actions/recommendations';
import { fetchUserAcademicdata } from '@/app/actions/disciplines';

interface LabPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function LabPage({ searchParams }: LabPageProps) {
    const supabase = await createServerSupabase();
    
    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }
    const currentUser = session.user;
    
    // Parse search parameters
    const queryUserId = typeof searchParams.user === 'string' ? searchParams.user : undefined;
    const targetUserId = queryUserId || currentUser.id;
    const initialTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'publicacoes';

    // 1. Fetch primary profiles (Wait concurrently)
    const [
        { data: currProfile },
        { data: profileData }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle()
    ]);
    
    // 2. Fetch independent secondary data concurrently
    const [
        userSubs,
        stats,
        savesRes,
        interest
    ] = await Promise.all([
        fetchUserSubmissions(targetUserId),
        getFollowStats(targetUserId),
        supabase.from('saves').select('submission_id').eq('user_id', currentUser.id),
        getUserInterest(targetUserId)
    ]);

    // 3. Conditional fetching
    let savedPosts: any[] = [];
    let adoptionStatus: 'pending' | 'approved' | null = null;
    let academicData: any = null;

    const parallelTasks: Promise<any>[] = [];

    // Task A: Fetch actual saved posts
    if (savesRes.data && savesRes.data.length > 0) {
        const ids = savesRes.data.map(s => s.submission_id);
        parallelTasks.push(
            (async () => {
                const res = await supabase.from('submissions')
                    .select('id, title, authors, description, media_url, media_type, category, status, like_count, comment_count, save_count, view_count, created_at, is_featured, user_id')
                    .in('id', ids)
                    .eq('status', 'aprovado');
                if (res.data) {
                    savedPosts = res.data.map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        authors: s.authors,
                        description: s.description || '',
                        mediaUrl: s.media_url,
                        mediaType: s.media_type,
                        category: s.category,
                        status: s.status,
                        likeCount: s.like_count || 0,
                        commentCount: s.comment_count || 0,
                        saveCount: s.save_count || 0,
                        viewCount: s.view_count || 0,
                        createdAt: s.created_at,
                        isFeatured: s.is_featured || false,
                        userId: s.user_id,
                    }));
                }
            })()
        );
    }

    // Task B: Adoption Status
    if (targetUserId !== currentUser.id) {
        parallelTasks.push(
            (async () => {
                const res = await supabase.from('adoptions')
                    .select('status')
                    .eq('mentor_id', currentUser.id)
                    .eq('freshman_id', targetUserId)
                    .maybeSingle();
                if (res.data) {
                    adoptionStatus = res.data.status as any;
                }
            })()
        );
    }

    // Task C: Academic Data if Aluno
    if (profileData?.user_category === 'aluno_usp') {
        parallelTasks.push(
            fetchUserAcademicdata(targetUserId).then(res => {
                if (res.success) academicData = res.data;
            })
        );
    }

    // Wait for conditional queries
    if (parallelTasks.length > 0) {
        await Promise.all(parallelTasks);
    }

    return (
        <LabClientView
            currentUser={currentUser}
            initialCurrentUserProfile={currProfile}
            initialViewedProfile={profileData}
            submissions={userSubs || []}
            savedPosts={savedPosts}
            followStats={stats}
            initialAdoptionStatus={adoptionStatus}
            academicData={academicData}
            topInterest={interest}
            initialTab={initialTab}
        />
    );
}
