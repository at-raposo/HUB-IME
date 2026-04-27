'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { supabase } from '@/lib/supabase';
import { SubmissionFormData } from '../schema';
import { toast } from 'react-hot-toast';
import { HelpTooltip } from './HelpTooltip';
import { SelectedIndicators } from './SelectedIndicators';

export function CuratorStep({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
    const { 
        setStep,
        isHistorical, setIsHistorical,
        isGoldenStandard, setIsGoldenStandard,
        selectedDepartments, setSelectedDepartments,
        selectedLaboratories, setSelectedLaboratories,
        selectedResearchers, setSelectedResearchers,
        selectedResearchLines, setSelectedResearchLines
    } = useSubmissionStore();

    const { getValues } = useFormContext<SubmissionFormData>();

    const [dbDepartments, setDbDepartments] = useState<any[]>([]);
    const [dbLaboratories, setDbLaboratories] = useState<any[]>([]);
    const [dbResearchers, setDbResearchers] = useState<any[]>([]);
    const [dbResearchLines, setDbResearchLines] = useState<any[]>([]);
    const [junctionLabs, setJunctionLabs] = useState<any[]>([]);
    const [junctionResearchers, setJunctionResearchers] = useState<any[]>([]);
    const [isFetchingData, setIsFetchingData] = useState(true);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const [dRes, lRes, rRes, rlRes, jlRes, jrRes] = await Promise.all([
                    supabase.from('departments').select('id, nome, sigla').order('sigla'),
                    supabase.from('laboratories').select('id, nome').order('nome'),
                    supabase.from('researchers').select('id, nome').order('nome'),
                    supabase.from('research_lines').select('id, nome').order('nome'),
                    supabase.from('department_laboratories').select('department_id, laboratory_id'),
                    supabase.from('department_researchers').select('department_id, researcher_id'),
                ]);

                if (dRes.data) setDbDepartments(dRes.data);
                if (lRes.data) setDbLaboratories(lRes.data);
                if (rRes.data) setDbResearchers(rRes.data);
                if (rlRes.data) setDbResearchLines(rlRes.data);
                if (jlRes.data) setJunctionLabs(jlRes.data);
                if (jrRes.data) setJunctionResearchers(jrRes.data);
            } catch (err) {
                console.error("Erro ao buscar dados do grafo:", err);
                toast.error("Erro ao carregar dados do Grafo de Conhecimento");
            } finally {
                setIsFetchingData(false);
            }
        };
        fetchGraphData();
    }, []);

    // Reactive filtering logic
    const filteredLaboratories = selectedDepartments.length > 0
        ? dbLaboratories.filter(lab => 
            junctionLabs.some(jl => jl.laboratory_id === lab.id && selectedDepartments.includes(jl.department_id))
          )
        : dbLaboratories;

    const filteredResearchers = selectedDepartments.length > 0
        ? dbResearchers.filter(res => 
            junctionResearchers.some(jr => jr.researcher_id === res.id && selectedDepartments.includes(jr.department_id))
          )
        : dbResearchers;

    const MultiSelect = ({
        label, description, items, selected, onChange, icon, color
    }: {
        label: string, description: string, items: any[], selected: string[], onChange: (val: string[]) => void, icon: string, color: string
    }) => {
        return (
            <div className={`bg-white dark:bg-card-dark rounded-3xl p-6 border-2 border-${color}/10 hover:border-${color}/30 transition-all shadow-sm`}>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{label}</h3>
                    <HelpTooltip text={description} />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                    {items.length > 0 ? (
                        items.map(item => {
                            const isSelected = selected.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            onChange(selected.filter(id => id !== item.id));
                                        } else {
                                            onChange([...selected, item.id]);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                        isSelected 
                                        ? `bg-${color} text-white shadow-lg` 
                                        : `bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-${color}/10 hover:text-${color}`
                                    }`}
                                >
                                    {item.sigla ? `${item.sigla} - ${item.nome}` : item.nome}
                                    {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-xs text-gray-400 italic py-2">
                            {selectedDepartments.length > 0 
                                ? "Nenhuma opção vinculada aos departamentos selecionados." 
                                : "Selecione um departamento para filtrar as opções."}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    if (isFetchingData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest text-brand-red animate-pulse">
                    [ATOMIC SYNC] Carregando Grafo...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <SelectedIndicators />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep('optional')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Curadoria Ouro</h1>
                        <p className="text-brand-blue text-sm font-bold tracking-tight">Vínculos Institucionais & Grafo de Conhecimento</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 border border-brand-red/30 rounded-full text-brand-red text-xs font-black uppercase ring-4 ring-brand-red/5">
                    <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                    Modo Administrativo (Lab-Div)
                </div>
            </div>

            <div className="bg-brand-blue/5 p-6 rounded-[32px] border border-brand-blue/10">
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                    Você está catalogando material premium em nome do <b>Lab-Div</b>. Use esta etapa para vincular esta submissão a nós específicos do Grafo de Conhecimento do IFUSP, garantindo que o conteúdo apareça em murais de departamentos, laboratórios e perfis de docentes.
                </p>
            </div>

            {/* FLags Especiais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className={`cursor-pointer group flex flex-col p-6 rounded-3xl border-2 transition-all ${isHistorical ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-brand-yellow/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${isHistorical ? 'bg-brand-yellow text-white shadow-lg shadow-brand-yellow/30' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                            <span className="material-symbols-outlined">history_edu</span>
                        </div>
                        <input type="checkbox" className="sr-only" checked={isHistorical} onChange={(e) => setIsHistorical(e.target.checked)} />
                        {isHistorical && <span className="material-symbols-outlined text-brand-yellow">check_circle</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-yellow transition-colors">Acervo Histórico</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Marca esta submissão como parte do acervo histórico institucional. Omitirá data do evento no UI se não for conhecida.</p>
                </label>

                <label className={`cursor-pointer group flex flex-col p-6 rounded-3xl border-2 transition-all ${isGoldenStandard ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark hover:border-brand-yellow/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${isGoldenStandard ? 'bg-brand-yellow text-white shadow-lg shadow-brand-yellow/30' : 'bg-brand-yellow/10 text-brand-yellow'}`}>
                            <span className="material-symbols-outlined">workspace_premium</span>
                        </div>
                        <input type="checkbox" className="sr-only" checked={isGoldenStandard} onChange={(e) => setIsGoldenStandard(e.target.checked)} />
                        {isGoldenStandard && <span className="material-symbols-outlined text-brand-yellow">check_circle</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-yellow transition-colors">Padrão Ouro (Golden Standard)</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">Serve de exemplo de qualidade técnica (iluminação, áudio, didática). Receberá destaque ouro na galeria.</p>
                </label>
            </div>

            {/* Grafo de Conhecimento Mapeamentos */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400 mt-10 mb-4 px-2">Associações do Grafo</h3>
                
                <MultiSelect 
                    label="Departamentos" 
                    description="Vincular aos departamentos do IFUSP."
                    items={dbDepartments} 
                    selected={selectedDepartments} 
                    onChange={setSelectedDepartments} 
                    icon="domain" 
                    color="brand-blue" 
                />

                <MultiSelect 
                    label="Laboratórios" 
                    description="Vincular a laboratórios específicos."
                    items={filteredLaboratories} 
                    selected={selectedLaboratories} 
                    onChange={setSelectedLaboratories} 
                    icon="science" 
                    color="brand-red" 
                />

                <MultiSelect 
                    label="Pesquisadores/Professores" 
                    description="Vincular a docentes ou pesquisadores reconhecidos."
                    items={filteredResearchers} 
                    selected={selectedResearchers} 
                    onChange={setSelectedResearchers} 
                    icon="school" 
                    color="brand-yellow" 
                />

                <MultiSelect 
                    label="Linhas de Pesquisa" 
                    description="Tags globais rigorosas (ex: Nanomateriais)."
                    items={dbResearchLines} 
                    selected={selectedResearchLines} 
                    onChange={setSelectedResearchLines} 
                    icon="hub" 
                    color="brand-green" 
                />
            </div>

            {/* Final Submission Button */}
            <div className="flex justify-between items-center pt-10 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setStep('optional')} type="button" className="text-gray-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">west</span> Revisar Opcionais
                </button>
                
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                        const formData = getValues();
                        onSubmit(formData);
                    }}
                    className="bg-brand-red px-12 py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-2xl shadow-brand-red/30 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isLoading ? 'Catalogando Grafo...' : 'Publicar Acervo'}
                    {!isLoading && <span className="material-symbols-outlined">save</span>}
                </button>
            </div>
        </div>
    );
}
