'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUserSubmissions } from '@/app/actions/submissions';
import { getUserInterest } from '@/app/actions/recommendations';
import { PostDTO } from '@/dtos/media';
import { parseMediaUrl, getYoutubeThumbnail, getOptimizedUrl } from '@/lib/media-utils';
import { User, Grid, Medal, Star, Image as ImageIcon, PlayCircle, FileText, Heart, MessageSquare, Info, Camera, Share2, Play, GraduationCap, ShieldCheck, Linkedin, Github, Youtube, Instagram, Globe } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RadiationBadge } from '@/components/gamification/RadiationBadge';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { RadiationTab } from '@/components/gamification/RadiationTab';
import { ArtesHobbiesTab } from '@/components/profile/ArtesHobbiesTab';
import { Profile } from '@/types';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { toast } from 'react-hot-toast';

export function LabTabContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submissions, setSubmissions] = useState<{ post: PostDTO }[]>([]);
    const [savedPosts, setSavedPosts] = useState<PostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState('publicacoes');
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [academicData, setAcademicData] = useState<any>(null);
    const [topInterest, setTopInterest] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                setCurrentUser(session.user);

                const targetUserId = session.user.id;

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetUserId)
                    .maybeSingle();

                setViewedProfile(profileData);

                const userSubs = await fetchUserSubmissions(targetUserId);
                setSubmissions(userSubs || []);

                const { getFollowStats } = await import('@/app/actions/submissions');
                const stats = await getFollowStats(targetUserId);
                setFollowStats(stats);

                const interest = await getUserInterest(targetUserId);
                setTopInterest(interest);

                // Saved posts
                const { data: saves } = await supabase.from('saves').select('submission_id').eq('user_id', targetUserId);
                if (saves && saves.length > 0) {
                    const ids = saves.map(s => s.submission_id);
                    const { data: savedSubs } = await supabase.from('submissions').select('*').in('id', ids).eq('status', 'aprovado');
                    if (savedSubs) setSavedPosts(savedSubs.map(s => ({
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
                    })));
                }

                if (profileData?.user_category === 'aluno_usp') {
                    const { fetchUserAcademicdata } = await import('@/app/actions/disciplines');
                    const academicRes = await fetchUserAcademicdata(targetUserId);
                    if (academicRes.success) setAcademicData(academicRes.data);
                }
            } catch (error) {
                console.error("Error loading lab data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;
    if (!viewedProfile) return null;

    const handleShare = async () => {
        const url = `${window.location.origin}/lab?user=${viewedProfile.id}`;
        if (navigator.share) {
            await navigator.share({ title: `Laboratório de ${viewedProfile.full_name}`, url });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copiado!');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Rich Profile Header */}
            <div className="bg-white dark:bg-[#121212] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="shrink-0">
                        <Avatar
                            src={viewedProfile.avatar_url}
                            name={(viewedProfile.use_nickname && viewedProfile.username) ? viewedProfile.username : viewedProfile.full_name || 'Usuário'}
                            size="custom"
                            customSize="w-32 h-32 md:w-36 md:h-36"
                            xp={viewedProfile.xp}
                            level={viewedProfile.level}
                            isLabDiv={viewedProfile.is_labdiv}
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {(viewedProfile.use_nickname && viewedProfile.username) ? viewedProfile.username : viewedProfile.full_name}
                            </h2>
                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black rounded uppercase tracking-widest border border-brand-blue/20">
                                Laboratório Pessoal
                            </span>
                            <RadiationBadge xp={viewedProfile.xp || 0} level={viewedProfile.level || 1} size="md" showTierName />
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="text-center md:text-left">
                                <span className="block text-lg font-black text-gray-900 dark:text-white">{submissions.length}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">publicações</span>
                            </div>
                            <div className="text-center md:text-left border-l border-gray-200 dark:border-white/10 pl-4">
                                <span className="block text-lg font-black text-gray-900 dark:text-white">{followStats.following}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">seguindo</span>
                            </div>
                            <div className="text-center md:text-left border-l border-gray-200 dark:border-white/10 pl-4">
                                <span className="block text-lg font-black text-gray-900 dark:text-white">{followStats.followers}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">seguidores</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-transparent hover:border-white/10">
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Editar Perfil
                            </button>
                            <button onClick={handleShare} className="px-4 py-2 bg-brand-blue text-white hover:scale-105 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-blue/20">
                                <Share2 className="w-3.5 h-3.5" />
                                Compartilhar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                            {topInterest && <span className="px-2 py-0.5 bg-brand-blue/20 text-brand-blue text-[9px] font-black rounded border border-brand-blue/30 flex items-center gap-1 uppercase tracking-tight"><Star className="size-3 fill-current" /> Foco: {topInterest}</span>}
                            {viewedProfile.course && <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[9px] font-bold rounded border border-brand-yellow/20 uppercase">{viewedProfile.course}</span>}
                            {viewedProfile.institute && <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded border border-brand-blue/20 uppercase">{viewedProfile.institute}</span>}
                            {viewedProfile.is_labdiv && <span className="px-2 py-0.5 bg-brand-yellow text-black text-[9px] font-black rounded border border-brand-yellow/30 uppercase flex items-center gap-1"><ShieldCheck className="size-3" /> Membro Lab-Div</span>}
                        </div>

                        <p className="text-gray-500 dark:text-gray-300 italic text-sm leading-relaxed max-w-xl line-clamp-3">
                            {viewedProfile.bio_draft || viewedProfile.bio || 'Seu laboratório pessoal está pronto para ser explorado.'}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                            {viewedProfile.linkedin_url && <a href={viewedProfile.linkedin_url} target="_blank" className="p-2 bg-white/5 hover:bg-blue-600/20 rounded-lg transition-all text-gray-500 hover:text-blue-500 border border-white/5"><Linkedin className="size-4" /></a>}
                            {viewedProfile.github_url && <a href={viewedProfile.github_url} target="_blank" className="p-2 bg-white/5 hover:bg-gray-800 rounded-lg transition-all text-gray-500 hover:text-white border border-white/5"><Github className="size-4" /></a>}
                            {viewedProfile.instagram_url && <a href={viewedProfile.instagram_url} target="_blank" className="p-2 bg-white/5 hover:bg-pink-600/20 rounded-lg transition-all text-gray-500 hover:text-pink-500 border border-white/5"><Instagram className="size-4" /></a>}
                            {viewedProfile.portfolio_url && <a href={viewedProfile.portfolio_url} target="_blank" className="p-2 bg-white/5 hover:bg-brand-blue/20 rounded-lg transition-all text-gray-500 hover:text-brand-blue border border-white/5"><Globe className="size-4" /></a>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Section */}
            {viewedProfile.user_category === 'aluno_usp' && academicData && (
                <div className="bg-white dark:bg-[#121212] rounded-[32px] p-6 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] flex items-center gap-2 mb-4">
                        <GraduationCap className="size-4" /> Ecossistema Acadêmico
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                            <span className="text-[8px] font-black text-brand-blue uppercase mb-2 block">Em Curso</span>
                            <div className="flex flex-wrap gap-1.5">
                                {academicData.inProgress?.map((p: any) => (
                                    <span key={p.id} className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold rounded border border-brand-blue/20 uppercase">{p.learning_trails?.course_code}</span>
                                )) || <span className="text-[9px] text-gray-500 italic">Nenhuma disciplina ativa</span>}
                            </div>
                        </div>
                        <div className="p-4 bg-brand-yellow/5 rounded-2xl border border-brand-yellow/10">
                            <span className="text-[8px] font-black text-brand-yellow uppercase mb-2 block">Concluídas</span>
                            <span className="text-[10px] font-black text-gray-500 dark:text-white/50 uppercase">{academicData.completed?.length || 0} Disciplinas Concluídas</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Selection */}
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-800 mb-6">
                {[
                    { id: 'publicacoes', label: 'PUBLICAÇÕES', icon: <Grid className="size-4" /> },
                    { id: 'artes', label: 'ARTES & HOBBIES', icon: <Camera className="size-4" /> },
                    { id: 'salvos', label: 'CONSTELAÇÃO', icon: <Star className="size-4" /> },
                    { id: 'radiacao', label: 'RADIAÇÃO', icon: <span className="text-sm">☢️</span> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black tracking-widest transition-all ${activeSubTab === tab.id
                            ? 'text-brand-blue border-b-2 border-brand-blue -mb-[1px]'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in duration-500">
                {activeSubTab === 'publicacoes' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {submissions.length > 0 ? (
                            submissions.map(sub => {
                                const urls = parseMediaUrl(sub.post.mediaUrl);
                                const firstMedia = urls[0] || '';
                                const thumbUrl = sub.post.mediaType === 'image' 
                                    ? getOptimizedUrl(firstMedia, 400, 70, sub.post.category, 'image')
                                    : getYoutubeThumbnail(firstMedia);

                                return (
                                    <a key={sub.post.id} href={`/arquivo/${sub.post.id}`} className="group relative aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-brand-blue/30 transition-all shadow-sm">
                                        {thumbUrl ? (
                                            <>
                                                <img 
                                                    src={thumbUrl} 
                                                    alt={sub.post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) {
                                                            const fallback = parent.querySelector('.fallback-container') as HTMLElement;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="fallback-container hidden w-full h-full flex-col items-center justify-center p-4">
                                                    <FileText className="w-8 h-8 text-gray-400 dark:text-white/10 mb-2" />
                                                    <span className="text-[8px] font-black uppercase text-center text-gray-500 dark:text-white/40 leading-tight line-clamp-3">{sub.post.title || 'MÍDIA INDISPONÍVEL'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                <FileText className="w-8 h-8 text-gray-400 dark:text-white/10 mb-2" />
                                                <span className="text-[8px] font-black uppercase text-center text-gray-500 dark:text-white/40 leading-tight line-clamp-3">{sub.post.title || 'MÍDIA INDISPONÍVEL'}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                                                <Heart className="size-4 fill-current" /> {sub.post.likeCount}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                                                <MessageSquare className="size-4 fill-current" /> {sub.post.commentCount}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center opacity-50 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-600">add_a_photo</span>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Nada publicado ainda.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSubTab === 'artes' && viewedProfile && (
                    <ArtesHobbiesTab profile={viewedProfile} isOwner={true} />
                )}

                {activeSubTab === 'salvos' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedPosts.length > 0 ? (
                            savedPosts.map(post => {
                                const urls = parseMediaUrl(post.mediaUrl);
                                const firstMedia = urls[0] || '';
                                const thumbUrl = post.mediaType === 'image' 
                                    ? getOptimizedUrl(firstMedia, 400, 70, post.category, 'image')
                                    : getYoutubeThumbnail(firstMedia);

                                return (
                                    <a key={post.id} href={`/arquivo/${post.id}`} className="group relative aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/30 transition-all shadow-sm">
                                        <div className="absolute top-2 right-2 z-10">
                                            <Star className="size-4 text-brand-yellow fill-current" />
                                        </div>
                                        {thumbUrl ? (
                                            <>
                                                <img 
                                                    src={thumbUrl} 
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) {
                                                            const fallback = parent.querySelector('.fallback-container') as HTMLElement;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="fallback-container hidden w-full h-full flex flex-col items-center justify-center p-4">
                                                    <FileText className="w-8 h-8 text-gray-400 dark:text-white/10 mb-2" />
                                                    <span className="text-[8px] font-black uppercase text-center text-gray-500 dark:text-white/40 leading-tight line-clamp-3">{post.title || 'MÍDIA INDISPONÍVEL'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                <FileText className="w-8 h-8 text-gray-400 dark:text-white/10 mb-2" />
                                                <span className="text-[8px] font-black uppercase text-center text-gray-500 dark:text-white/40 leading-tight line-clamp-3">{post.title || 'MÍDIA INDISPONÍVEL'}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                                                <Heart className="size-4 fill-current" /> {post.likeCount}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center opacity-50 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                                <Star className="size-8 mx-auto mb-2 text-gray-600" />
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Sua constelação está vazia.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSubTab === 'radiacao' && viewedProfile && (
                    <RadiationTab profile={{ id: viewedProfile.id, xp: viewedProfile.xp || 0, level: viewedProfile.level || 1 }} />
                )}
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
}
