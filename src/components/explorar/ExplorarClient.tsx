'use client';

import React from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { motion } from 'framer-motion';
import { GrandeColisorView } from './GrandeColisorView';
import { ColisorFeedbackCard } from '@/app/colisor/ColisorFeedbackCard';

interface ExplorarClientProps {
    mapItems: any[];
    oportunidades: any[];
}

export function ExplorarClient({ mapItems, oportunidades }: ExplorarClientProps) {
    return (
        <MainLayoutWrapper 
            rightSidebar={<ColisorFeedbackCard />}
            fullWidth={true}
        >
            <div className="min-h-screen py-6 px-4 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <GrandeColisorView 
                        oportunidades={oportunidades} 
                        mapItems={mapItems} 
                    />
                </motion.div>
            </div>
        </MainLayoutWrapper>
    );
}
