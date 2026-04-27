'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { getUserPseudonyms, createPseudonym, togglePseudonymActive, deletePseudonym } from '@/app/actions/submissions';

const pseudonymSchema = z.object({
    name: z.string().min(3, "O pseudônimo deve ter pelo menos 3 caracteres").max(50, "O pseudônimo é muito longo"),
});

type PseudonymFormValues = z.infer<typeof pseudonymSchema>;

export function PseudonymManager() {
    const [pseudonyms, setPseudonyms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PseudonymFormValues>({
        resolver: zodResolver(pseudonymSchema)
    });

    const loadPseudonyms = async () => {
        setIsLoading(true);
        const data = await getUserPseudonyms();
        setPseudonyms(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        loadPseudonyms();
    }, []);

    const onSubmit = async (data: PseudonymFormValues) => {
        setIsCreating(true);
        const res = await createPseudonym(data.name);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Pseudônimo criado com sucesso!');
            reset();
            loadPseudonyms();
        }
        setIsCreating(false);
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        const res = await togglePseudonymActive(id, !currentStatus);
        if (res.success) {
            toast.success(`Pseudônimo ${!currentStatus ? 'ativado' : 'desativado'}`);
            loadPseudonyms();
        } else {
            toast.error("Erro ao alterar status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este pseudônimo?')) return;

        const res = await deletePseudonym(id);
        if (res.success) {
            toast.success('Pseudônimo excluído');
            loadPseudonyms();
        } else {
            toast.error("Erro ao excluir. Pode estar em uso.");
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Meus Pseudônimos</h2>

            {/* Form to Create New */}
            <form onSubmit={handleSubmit(onSubmit)} className="mb-8 flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                    <input
                        {...register('name')}
                        type="text"
                        placeholder="Novo pseudônimo secreto..."
                        className="w-full bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-blue/50 outline-none transition-all"
                    />
                    {errors.name && <p className="text-[10px] text-brand-red mt-1 uppercase font-bold px-2">{errors.name.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full sm:w-auto px-6 py-3 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar
                </button>
            </form>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                ) : pseudonyms.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                        <p className="text-sm text-gray-500 font-medium">Você ainda não tem pseudônimos cadastrados.</p>
                    </div>
                ) : (
                    pseudonyms.map(pseudo => (
                        <div key={pseudo.id} className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 rounded-2xl group transition-all hover:border-brand-blue/30">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-black uppercase tracking-wider ${pseudo.is_active ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                    {pseudo.name}
                                </span>
                                {pseudo.is_active && (
                                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[10px] font-black uppercase rounded-full">Ativo</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleToggleActive(pseudo.id, pseudo.is_active)}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                                    title={pseudo.is_active ? "Ocultar Pseudônimo" : "Ativar Pseudônimo"}
                                >
                                    {pseudo.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(pseudo.id)}
                                    className="p-2 rounded-lg bg-brand-red/10 hover:bg-brand-red/20 text-brand-red transition-colors"
                                    title="Excluir Pseudônimo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
