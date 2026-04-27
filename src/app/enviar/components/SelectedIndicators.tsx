'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSubmissionStore } from '@/store/useSubmissionStore';
import { CATEGORIES, FORMATS } from '../constants';

export function SelectedIndicators() {
    const { category: categoryId, mediaType } = useSubmissionStore();
    
    const category = CATEGORIES.find(c => c.id === categoryId);
    const format = FORMATS.find(f => f.id === mediaType);

    if (!category && !format) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 mb-8"
        >
            {category && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md group">
                    <span className={`material-symbols-outlined text-lg text-${category.color}`}>
                        {category.icon}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Categoria</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{category.title}</span>
                    </div>
                </div>
            )}

            {format && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md group">
                    <span className={`material-symbols-outlined text-lg text-${format.color}`}>
                        {format.icon}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Formato</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{format.title}</span>
                    </div>
                </div>
            )}
            
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-1 hidden sm:block"></div>
            
            <p className="text-[10px] font-medium text-gray-400 italic">
                Você pode alterar essas seleções voltando nos passos anteriores.
            </p>
        </motion.div>
    );
}
