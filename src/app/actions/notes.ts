'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const PrivateNoteSchema = z.object({
    userId: z.string().uuid("ID de usuário inválido"),
    submissionId: z.string().uuid("ID de submissão inválido"),
    selectionHash: z.string().min(1, "Hash de seleção é obrigatório"),
    noteText: z.string().min(1, "O texto da anotação não pode ser vazio").max(5000, "Anotação muito longa"),
});

export type PrivateNoteInput = z.infer<typeof PrivateNoteSchema>;

export async function addPrivateNote(params: PrivateNoteInput, token: string) {
    if (!token) {
        return { success: false, error: 'Sessão inválida. Por favor, faça login novamente.' };
    }

    try {
        // 1. Zod Validation
        const validatedData = PrivateNoteSchema.parse(params);

        // 2. Supabase Server Client setup with Authentication
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return { success: false, error: 'Configuração do Servidor ausente.' };
        }

        const supabaseServer = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        // 3. User / Session check inside Server
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
        if (userError || !user || user.id !== validatedData.userId) {
            console.error("Auth falhou na Server Action:", userError);
            return { success: false, error: 'Sessão de usuário inválida ou expirada. Pela RLS o acesso foi negado.' };
        }

        // 4. Insert
        const { error } = await supabaseServer
            .from('private_notes')
            .insert({
                user_id: validatedData.userId,
                submission_id: validatedData.submissionId,
                selection_hash: validatedData.selectionHash,
                note_text: validatedData.noteText,
            });

        if (error) {
            console.error("Erro SQL ao inserir anotação privada:", error);
            return { success: false, error: error.message || 'Falha ao salvar a anotação no banco de dados.' };
        }

        return { success: true };
    } catch (e: any) {
        console.error("Erro na Server Action (Anotação):", e);
        if (e instanceof z.ZodError) {
            return { success: false, error: e.issues[0].message };
        }
        return { success: false, error: e.message || 'Erro inesperado no servidor.' };
    }
}
