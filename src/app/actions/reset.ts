'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { purgeStorageFolder } from '@/lib/cloudinary-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const ResetSchema = z.object({
    secret_key: z.string(),
    confirm_phrase: z.string().refine((val) => val === "ESTOU CIENTE DA DESTRUIÇÃO TOTAL DOS DADOS", {
        message: "Frase de confirmação incorreta."
    }),
});

/**
 * ☣️ PROTOCOLO ZERO KELVIN: O RESGATE DO VÁCUO (V3.1.0)
 * Executa o reset total do sistema: DB + Storage + Cache.
 */
export async function executeNuclearReset(formData: FormData) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    const rawData = {
        secret_key: formData.get('secret_key'),
        confirm_phrase: formData.get('confirm_phrase'),
    };

    const validation = ResetSchema.safeParse(rawData);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    if (validation.data.secret_key !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta de administração inválida.' };
    }

    try {
        console.warn('[V4.0] RESET NUCLEAR TOTAL INICIADO POR:', check.user!.email);

        // 2. Limpeza de Storage (Cloudinary)
        await purgeStorageFolder('assets/submissions');
        await purgeStorageFolder('reproductions');

        // 3. Limpeza de Banco de Dados (TRUNCATE CASCADE via RPC v4)
        const supabase = await createServerSupabase();
        const { error: dbError } = await supabase.rpc('nuclear_reset_v4');

        if (dbError) throw new Error(`Erro no banco de dados: ${dbError.message}`);

        revalidatePath('/');
        return { success: true, message: 'Protocolo Zero Kelvin V4.0 concluído. Sistema em Vácuo Absoluto.' };
    } catch (error: any) {
        console.error('[V4.0] FALHA CRÍTICA NO RESET NUCLEAR:', error);
        return { success: false, error: 'Falha catastrófica durante o reset.' };
    }
}

/**
 * 👤 WIPE DE PERFIS: Reseta usuários e auth, mantém trilhas.
 */
export async function executeProfileWipe(formData: FormData) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    if (formData.get('secret_key') !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta inválida.' };
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.rpc('reset_only_profiles');

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true, message: 'Wipe de Perfis concluído.' };
}

/**
 * 📦 WIPE DE CONTEÚDO: Apaga posts, logs, comentários e perguntas.
 */
export async function executeContentWipe(formData: FormData) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    if (formData.get('secret_key') !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta inválida.' };
    }

    try {
        await purgeStorageFolder('assets/submissions');
        await purgeStorageFolder('reproductions');

        const supabase = await createServerSupabase();
        const { error } = await supabase.rpc('reset_only_content');

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        return { success: true, message: 'Wipe de Conteúdo concluído.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * 🎓 WIPE DE TRILHAS: Apaga apenas as trilhas de aprendizagem.
 */
export async function executeTrailsWipe(formData: FormData) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    if (formData.get('secret_key') !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta inválida.' };
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.rpc('reset_only_trails');

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin');
    return { success: true, message: 'Wipe de Trilhas concluído.' };
}

/**
 * 🎯 BUSCA E DESTRUIÇÃO: Deleta UID específico.
 */
export async function executeSpecificUserWipe(targetUid: string, secretKey: string) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    if (secretKey !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta inválida.' };
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.rpc('delete_specific_user', { target_uid: targetUid });

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/profiles');
    return { success: true, message: `Usuário ${targetUid} removido com sucesso.` };
}

/**
 * 🌪️ WIPE SELETIVO: Deleta tudo, exceto as trilhas e os usuários listados (e-mails).
 */
export async function executeSelectiveWipe(formData: FormData) {
    const check = await verifyAdmin();
    if (!check.success) return check;

    if (formData.get('secret_key') !== process.env.ADMIN_PASSWORD) {
        return { success: false, error: 'Chave secreta inválida.' };
    }

    const preservedEmailsRaw = formData.get('preserved_emails') as string;
    if (!preservedEmailsRaw || preservedEmailsRaw.trim() === '') {
        return { success: false, error: 'Lista de e-mails para preservar não pode estar vazia. Use o Wipe Nuclear ou de Perfis se quiser apagar tudo.' };
    }

    // Process the emails (comma or newline separated)
    const preservedEmails = preservedEmailsRaw
        .split(/[\n,]+/)
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes('@'));

    if (preservedEmails.length === 0) {
        return { success: false, error: 'Nenhum e-mail válido encontrado para preservar.' };
    }

    try {
        await purgeStorageFolder('assets/submissions');
        await purgeStorageFolder('reproductions');

        const supabase = await createServerSupabase();
        const { error } = await supabase.rpc('reset_selective', { preserved_emails: preservedEmails });

        if (error) return { success: false, error: error.message };

        revalidatePath('/');
        return { success: true, message: `Wipe Seletivo concluído. ${preservedEmails.length} perfis e as trilhas foram mantidos.` };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Utility to verify admin permission before critical actions
 */
async function verifyAdmin() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado.' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return { success: false, error: 'Acesso restrito a Administradores.' };
    }

    return { success: true, user };
}
