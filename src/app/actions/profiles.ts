'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Profile, Freshman } from '@/types';
import { sendAdminNotification } from '@/lib/notifications';
import { sendAutomaticNotification } from './notifications';

async function checkIsAdmin() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}

export async function updateProfile(updates: Partial<Profile>) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Não autorizado' };
    }

    // Get current profile status
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('review_status, pending_edits, full_name')
        .eq('id', user.id)
        .single();

    // ALL changes by users (non-admins) go to pending_edits for review.
    // The main columns always hold the last approved version.
    const updatePayload = {
        pending_edits: {
            ...(currentProfile?.pending_edits || {}),
            ...updates
        },
        review_status: 'pending'
    };

    // Special case: username/use_nickname should probably be live if they are just toggles?
    // Actually, user wants "ao editar deve ser aprovado pelo adm". So everything goes to pending.

    // BUT, we want to allow immediate nickname selection if it's already created?
    // Let's stick to the rule: ALL edits go to pending.

    const { data, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
    }

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');

    // Notify Admins
    const isFirstTime = !currentProfile?.full_name;
    await sendAdminNotification({
        type: isFirstTime ? 'profile_creation' : 'profile_update',
        userName: data.full_name || user.email?.split('@')[0] || 'Novo Usuário',
        details: isFirstTime ? user.email : undefined
    });

    return { success: true, data };
}

export async function approveProfile(profileId: string) {
    const supabase = await createServerSupabase();
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        console.error('Auth check error:', authError);
        return { error: `Erro de autenticação: ${authError.message}` };
    }

    if (!adminUser) {
        console.warn('No user found in session for approveProfile');
        return { error: 'Não autorizado: Sessão não encontrada' };
    }

    // Admin check
    const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();

    if (profileError) {
        console.error('Error fetching admin profile:', profileError);
        return { error: `Erro ao verificar permissões: ${profileError.message}` };
    }

    if (adminProfile?.role !== 'admin') {
        console.warn(`User ${adminUser.id} attempted admin action with role: ${adminProfile?.role}`);
        return { error: `Acesso negado: Perfil ${adminProfile?.role} não tem permissão de admin` };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (!profile) return { error: 'Perfil não encontrado' };

    const finalData = {
        ...(profile.pending_edits || {}),
        pending_edits: null,
        review_status: 'approved'
    };

    const { error } = await supabase
        .from('profiles')
        .update(finalData)
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/lab');
    revalidatePath('/admin/profiles');
    revalidatePath('/orbit'); // Revalidate orbit view too
    return { success: true };
}

export async function getProfileWithPseudonyms() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (pError) return { error: pError.message };

    // Merge pending_edits so the user sees their latest draft in the modal
    const profileWithEdits = {
        ...profile,
        ...(profile.pending_edits || {}),
        email: user.email // Inject explicit email from Auth
    };

    const { data: pseudonyms, error: psError } = await supabase
        .from('pseudonyms')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

    return {
        profile: profileWithEdits as Profile,
        pseudonyms: pseudonyms || []
    };
}

/**
 * PHASE 3: GOVERNANCE & ADMIN ACTIONS
 */

export async function deleteProfile(profileId: string) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const adminClient = createAdminSupabase();

    // Physical deletion from auth.users (cascades to public.profiles)
    const { error } = await adminClient.auth.admin.deleteUser(profileId);

    if (error) {
        console.error('Error deleting user:', error);
        return { error: error.message };
    }

    revalidatePath('/admin/papeis');
    return { success: true };
}

export async function impersonateUser(userId: string) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const cookieStore = await cookies();

    // Set an HttpOnly cookie for impersonation
    cookieStore.set('admin_impersonating_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2, // 2 hours
        path: '/',
    });

    revalidatePath('/');
    return { success: true };
}

export async function stopImpersonation() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_impersonating_id');

    revalidatePath('/');
    return { success: true };
}

export async function toggleProfileVisibility(profileId: string, isVisible: boolean) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('profiles')
        .update({ is_visible: isVisible })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    revalidatePath(`/autor/${profileId}`);
    return { success: true };
}

export async function toggleLabdivMember(profileId: string, isLabdiv: boolean) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('profiles')
        .update({ is_labdiv: isLabdiv })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    return { success: true };
}

export async function updateProfileAsAdmin(profileId: string, updates: Partial<Profile>) {
    if (!await checkIsAdmin()) return { error: 'Não autorizado' };

    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: updates.full_name,
            username: updates.username,
            bio: updates.bio,
            institute: updates.institute,
            course: updates.course,
            whatsapp: updates.whatsapp,
            entrance_year: updates.entrance_year,
            lattes_url: updates.lattes_url,
            artistic_interests: updates.artistic_interests,
            role: updates.role,
            is_labdiv: updates.is_labdiv,
            is_visible: updates.is_visible,
            available_to_mentor: updates.available_to_mentor,
            seeking_mentor: updates.seeking_mentor,
            review_status: updates.review_status,
            education_level: updates.education_level,
            external_institution: updates.external_institution,
            user_category: updates.user_category,
            seeking_ic: updates.seeking_ic,
            seeking_assistant: updates.seeking_assistant,
            research_line: updates.research_line,
            interest_area: updates.interest_area,
            ic_research_area: updates.ic_research_area,
            ic_preferred_department: updates.ic_preferred_department,
            ic_preferred_lab: updates.ic_preferred_lab,
            ic_letter_of_interest: updates.ic_letter_of_interest,
            office_room: updates.office_room,
            laboratory_name: updates.laboratory_name,
            department: updates.department
        })
        .eq('id', profileId);

    if (error) return { error: error.message };

    revalidatePath('/admin/papeis');
    revalidatePath('/lab');
    revalidatePath(`/autor/${profileId}`);
    return { success: true };
}

export async function uploadEnrollmentProof(formData: FormData) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const file = formData.get('proof') as File | null;
    if (!file || file.size === 0) return { error: 'Arquivo inválido' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('enrollment_proofs')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error('Error uploading proof:', uploadError);
        return { error: 'Falha ao fazer upload do comprovante' };
    }

    return { success: true, path: filePath };
}

export async function getEnrollmentProofUrl(path: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin Check
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin') return { error: 'Acesso negado' };

    // Valid for 60 seconds
    const { data, error } = await supabase.storage
        .from('enrollment_proofs')
        .createSignedUrl(path, 60);

    if (error || !data) {
        console.error('Error creating signed URL:', error);
        return { error: 'Erro ao gerar link de visualização' };
    }

    return { success: true, url: data.signedUrl };
}

export async function fetchFreshmenForAdoption() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Get IDs of freshmen who already have a pending or approved adoption
    const { data: activeAdoptions } = await supabase
        .from('adoptions')
        .select('freshman_id')
        .in('status', ['pending', 'approved']);

    const excludedIds = activeAdoptions?.map(a => a.freshman_id) || [];

    let query = supabase
        .from('profiles')
        .select('id, full_name, username, use_nickname, avatar_url, course, institute, entrance_year, bio, whatsapp, email, xp, level, is_labdiv')
        .eq('seeking_mentor', true)
        .eq('review_status', 'approved');

    if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching freshmen:', error);
        return { error: 'Erro ao buscar bixos interessados' };
    }

    return { success: true, data };
}

export async function fetchMyAdoptedFreshmen() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: adoptions, error } = await supabase
        .from('adoptions')
        .select(`
            status,
            freshman:profiles!freshman_id(id, full_name, username, use_nickname, avatar_url, course, institute, entrance_year, bio, whatsapp, email, xp, level, is_labdiv)
        `)
        .eq('mentor_id', user.id)
        .in('status', ['approved', 'pending']);

    if (error) {
        console.error('Error fetching my adopted freshmen:', error);
        return { error: 'Erro ao buscar seus bixos adotados' };
    }

    // Supabase returns { freshman: { ... } } or { freshman: [ { ... } ] }
    const flattened = (adoptions || []).map((a: any) => {
        const profile = Array.isArray(a.freshman) ? a.freshman[0] : a.freshman;
        if (!profile) return null;
        return {
            ...profile,
            adoptionStatus: a.status
        };
    }).filter(Boolean);

    return { success: true, data: flattened as Freshman[] };
}

export async function requestAdoption(freshmanId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('adoptions')
        .insert({
            mentor_id: user.id,
            freshman_id: freshmanId,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') return { error: 'Você já solicitou a adoção deste bixo' };
        console.error('Error requesting adoption:', error);
        return { error: 'Erro ao solicitar adoção' };
    }

    // Send Notifications
    try {
        const { data: freshman } = await supabase.from('profiles').select('full_name').eq('id', freshmanId).single();
        const { data: mentor } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).single();

        if (freshman && mentor) {
            // To Mentor
            await sendAutomaticNotification({
                userId: user.id,
                title: 'Solicitação de Adoção Enviada! 🤝',
                message: `Aguardando validação da adoção de ${freshman.full_name}. Fale e ajude seu bixo para ela ser validada.`,
                link: `/lab?user=${freshmanId}`,
                type: 'adoption'
            });

            // To Freshman
            await sendAutomaticNotification({
                userId: freshmanId,
                title: 'Alguém quer te adotar! 🎉',
                message: `O veterano/mentor ${mentor.full_name} solicitou sua adoção. Fique atento e procure por ele no Lab!`,
                link: `/lab?user=${user.id}`,
                type: 'adoption'
            });
        }
    } catch (e) {
        console.error('Error sending adoption request notifications:', e);
    }

    return { success: true, data };
}

export async function fetchAdoptions() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    let query = supabase
        .from('adoptions')
        .select(`
            *,
            mentor:profiles!mentor_id(*),
            freshman:profiles!freshman_id(*)
        `);

    if (profile?.role !== 'admin') {
        // Users see only their relevant adoptions
        query = query.or(`mentor_id.eq.${user.id},freshman_id.eq.${user.id}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching adoptions:', error);
        return { error: 'Erro ao buscar adoções' };
    }

    return { success: true, data };
}

export async function updateAdoptionStatus(adoptionId: string, status: 'approved' | 'rejected') {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Acesso negado' };

    const { error: updateError } = await supabase
        .from('adoptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', adoptionId);

    if (updateError) {
        console.error('Error updating adoption status:', updateError);
        return { error: 'Erro ao atualizar status da adoção' };
    }

    if (status === 'approved') {
        try {
            // Fetch detailed info for notifications
            const { data: adoptionData } = await supabase
                .from('adoptions')
                .select(`
                    *,
                    mentor:profiles!mentor_id(full_name, username),
                    freshman:profiles!freshman_id(full_name, username)
                `)
                .eq('id', adoptionId)
                .single();

            if (adoptionData) {
                const mentor = Array.isArray(adoptionData.mentor) ? adoptionData.mentor[0] : adoptionData.mentor;
                const freshman = Array.isArray(adoptionData.freshman) ? adoptionData.freshman[0] : adoptionData.freshman;

                // Notify Mentor (Adopter)
                await sendAutomaticNotification({
                    userId: adoptionData.mentor_id,
                    title: 'Adoção Confirmada! 🤝',
                    message: `Você adotou ${freshman?.full_name || 'um calouro'}. Agora você é oficialmente um mentor/padrinho.`,
                    link: `/perfil/${freshman?.username || adoptionData.freshman_id}`,
                    type: 'adoption'
                });

                // Notify Freshman (Adopted)
                await sendAutomaticNotification({
                    userId: adoptionData.freshman_id,
                    title: 'Você foi Adotado! 🎉',
                    message: `Ótimas notícias! O veterano/mentor ${mentor?.full_name || 'um veterano'} acabou de te adotar.`,
                    link: `/perfil/${mentor?.username || adoptionData.mentor_id}`,
                    type: 'adoption'
                });
            }
        } catch (e) {
            console.error('Error sending adoption notifications:', e);
        }
    } else if (status === 'rejected') {
        try {
            const { data: adoptionData } = await supabase
                .from('adoptions')
                .select('mentor_id, freshman_id')
                .eq('id', adoptionId)
                .single();

            if (adoptionData) {
                // Notify Mentor
                await sendAutomaticNotification({
                    userId: adoptionData.mentor_id,
                    title: 'Adoção não Validada ❌',
                    message: 'A moderação não validou sua adoção, caso queira saber mais contate o suporte.',
                    type: 'system'
                });

                // Notify Freshman (Optional but good)
                await sendAutomaticNotification({
                    userId: adoptionData.freshman_id,
                    title: 'Adoção não Validada ❌',
                    message: 'A solicitação de adoção não foi validada pela moderação.',
                    type: 'system'
                });
            }
        } catch (e) {
            console.error('Error sending rejection notifications:', e);
        }
    }

    revalidatePath('/admin/adocoes');
    revalidatePath('/lab');
    return { success: true };
}


// RESEARCH ADOPTIONS (ASSISTANTS)
export async function approveStudentAsAssistant(studentId: string) {
    const supabase = await createServerSupabase();
    const { data: { user: researcher } } = await supabase.auth.getUser();

    if (!researcher) return { error: 'Não autorizado' };

    // Verify if already exists
    const { data: existing } = await supabase
        .from('research_adoptions')
        .select('id')
        .eq('researcher_id', researcher.id)
        .eq('student_id', studentId)
        .single();

    if (existing) return { error: 'Este aluno já é seu ajudante' };

    const { error } = await supabase
        .from('research_adoptions')
        .insert({
            researcher_id: researcher.id,
            student_id: studentId,
            status: 'pending'
        });

    if (error) {
        console.error('Error approving assistant:', error);
        return { error: 'Erro ao aprovar ajudante' };
    }

    // Send Notifications
    try {
        const { data: student } = await supabase.from('profiles').select('full_name, email').eq('id', studentId).single();
        const { data: researcherProfile } = await supabase.from('profiles').select('full_name, email').eq('id', researcher.id).single();

        if (student && researcherProfile) {
            // Notification to Student
            await sendAutomaticNotification({
                userId: studentId,
                title: '🎉 Seleção de Iniciação Científica',
                message: `O pesquisador ${researcherProfile.full_name} aprovou seu pedido pelo Quero uma IC! Entre em contato pelo e-mail: ${researcherProfile.email}`,
                link: `mailto:${researcherProfile.email}`,
                type: 'match'
            });

            // Notification to Researcher
            await sendAutomaticNotification({
                userId: researcher.id,
                title: '⚡ Confirmação de Ajudante',
                message: `Você aprovou o pedido do estudante ${student.full_name}. Não se esqueça de contatá-lo (${student.email}), ou o suporte do HUB caso tenha sido um erro.`,
                link: `mailto:${student.email}`,
                type: 'match'
            });
        }
    } catch (e) {
        console.error('Error sending notifications:', e);
    }

    revalidatePath('/arena');
    revalidatePath('/ferramentas/match');
    return { success: true };
}

export async function fetchMyResearchAssistants() {
    const supabase = await createServerSupabase();
    const { data: { user: researcher } } = await supabase.auth.getUser();

    if (!researcher) return { error: 'Não autorizado' };

    const { data: adoptions, error } = await supabase
        .from('research_adoptions')
        .select(`
            status,
            student:profiles!student_id(*)
        `)
        .eq('researcher_id', researcher.id)
        .in('status', ['approved', 'pending']);

    if (error) {
        console.error('Error fetching research assistants:', error);
        return { error: 'Erro ao buscar seus ajudantes' };
    }

    const flattened = (adoptions || []).map((a: any) => {
        const student = Array.isArray(a.student) ? a.student[0] : a.student;
        if (student) {
            return { ...student, adoptionStatus: a.status };
        }
        return null;
    }).filter(Boolean);

    return { success: true, data: flattened };
}

export async function fetchAllResearchAdoptions() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Acesso negado' };

    const { data, error } = await supabase
        .from('research_adoptions')
        .select(`
            *,
            researcher:profiles!researcher_id(*),
            student:profiles!student_id(*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all research adoptions:', error);
        return { error: 'Erro ao buscar validações de IC' };
    }

    return { success: true, data };
}

export async function updateResearchAdoptionStatus(adoptionId: string, status: 'approved' | 'rejected') {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Admin check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Acesso negado' };

    const { data, error } = await supabase
        .from('research_adoptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', adoptionId)
        .select();

    if (error || !data || data.length === 0) {
        console.error('Error updating research adoption status:', error || 'No rows affected (RLS?)');
        return { error: 'Erro ao atualizar status do ajudante' };
    }

    if (status === 'approved') {
        try {
            const { data: raData } = await supabase
                .from('research_adoptions')
                .select('researcher_id, student_id')
                .eq('id', adoptionId)
                .single();
            
            if (raData) {
                await sendAutomaticNotification({
                    userId: raData.researcher_id,
                    title: 'Match IC Validado! ✅',
                    message: 'A moderação validou seu match de Iniciação Científica.',
                    type: 'match'
                });
            }
        } catch (e) { console.error(e); }
    } else if (status === 'rejected') {
        try {
            const { data: raData } = await supabase
                .from('research_adoptions')
                .select('researcher_id, student_id')
                .eq('id', adoptionId)
                .single();
            
            if (raData) {
                await sendAutomaticNotification({
                    userId: raData.researcher_id,
                    title: 'Match IC não Validado ❌',
                    message: 'A moderação não validou seu match de IC comercial / acadêmico. Caso queira saber mais, contate o suporte.',
                    type: 'system'
                });
            }
        } catch (e) { console.error(e); }
    }

    revalidatePath('/admin/adocoes');
    revalidatePath('/arena');
    revalidatePath('/ferramentas/match');
    return { success: true };
}

export async function fetchStudentsSeekingIC() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Get IDs of students who already have an approved advisor
    const { data: activeAdoptions } = await supabase
        .from('research_adoptions')
        .select('student_id')
        .in('status', ['approved', 'pending']);

    const excludedIds = activeAdoptions?.map(a => a.student_id) || [];

    let query = supabase
        .from('profiles')
        .select('*, pending_edits')
        .or('seeking_ic.eq.true,pending_edits->>seeking_ic.eq.true')
        .in('review_status', ['approved', 'pending'])
        .eq('is_visible', true);

    if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    const { data: rawData, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching students for IC:', error);
        return { error: 'Erro ao buscar alunos interessados em IC' };
    }

    // Merge pending edits
    const data = (rawData || []).map(p => ({
        ...p,
        ...(p.pending_edits || {})
    }));

    return { success: true, data };
}

export async function fetchResearchersSeekingAssistants() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data: rawData, error } = await supabase
        .from('profiles')
        .select('*, pending_edits')
        .or('seeking_assistant.eq.true,pending_edits->>seeking_assistant.eq.true')
        .in('review_status', ['approved', 'pending'])
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching researchers:', error);
        return { error: 'Erro ao buscar pesquisadores buscando ajudantes' };
    }

    // Merge pending edits for real-time visibility
    const data = (rawData || []).map(p => ({
        ...p,
        ...(p.pending_edits || {})
    }));

    return { success: true, data };
}

export async function getStudentMiniPortfolio(studentId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Fetch profile details - Select * to ensure we get everything and pending_edits
    const { data: rawProfile, error: pError } = await supabase
        .from('profiles')
        .select('*, pending_edits')
        .eq('id', studentId)
        .single();

    if (pError || !rawProfile) return { error: 'Perfil não encontrado' };

    // Merge pending_edits for real-time consistency
    const profile = {
        ...rawProfile,
        ...(rawProfile.pending_edits || {})
    };

    // Fetch completed disciplines
    const { data: completed, error: cError } = await supabase
        .from('user_completed_trails')
        .select('learning_trails(id, title, course_code, axis)')
        .eq('user_id', studentId);

    // Fetch current disciplines
    const { data: current, error: curError } = await supabase
        .from('user_trail_progress')
        .select('learning_trails(id, title, course_code, axis)')
        .eq('user_id', studentId)
        .eq('status', 'cursando');

    return {
        success: true,
        data: {
            profile: profile as Profile,
            completed: (completed || []).map((c: any) => c.learning_trails).filter(Boolean),
            current: (current || []).map((c: any) => c.learning_trails).filter(Boolean)
        }
    };
}

export async function searchUsersByName(query: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };
    if (!query || query.trim().length < 2) return { success: true, data: [] };

    const searchTerm = `%${query.trim()}%`;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, use_nickname, avatar_url, course, institute, user_category')
        .in('review_status', ['approved', 'pending'])
        .not('full_name', 'is', null) // Only find users who finished profile setup
        .neq('id', user.id)
        .or(`full_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
        .limit(10);

    if (error) {
        console.error('Error searching users:', error);
        return { error: 'Erro ao buscar usuários' };
    }

    return { success: true, data };
}

export async function fetchMyResearchAdoptionStatus() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('research_adoptions')
        .select(`
            id,
            status,
            created_at,
            researcher:profiles!researcher_id(
                id,
                full_name,
                laboratory_name,
                email,
                avatar_url
            )
        `)
        .eq('student_id', user.id)
        .in('status', ['approved', 'pending'])
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching my research adoption status:', error);
        return { error: 'Erro ao buscar status de IC' };
    }

    return { success: true, data };
}
