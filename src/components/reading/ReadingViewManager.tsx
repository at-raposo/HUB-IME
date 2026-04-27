'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useReadingExperience } from './ReadingExperienceProvider';
import dynamic from 'next/dynamic';

const PresentationMode = dynamic(() => import('./PresentationMode').then(mod => mod.PresentationMode), { ssr: false });
const SpeechPlayer = dynamic(() => import('./SpeechPlayer').then(mod => mod.SpeechPlayer), { ssr: false });
const PresenceIndicator = dynamic(() => import('./PresenceIndicator').then(mod => mod.PresenceIndicator), { ssr: false });
const TableOfContents = dynamic(() => import('./TableOfContents').then(mod => mod.TableOfContents), { ssr: false });
const ReadingProgressBar = dynamic(() => import('./ReadingProgressBar').then(mod => mod.ReadingProgressBar), { ssr: false });

import { useScrollTracker } from '@/hooks/useScrollTracker';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { ReadingToolbar } from './ReadingToolbar';
import { TextSelectionHandler } from './TextSelectionHandler';
import { PrivateNoteModal } from './PrivateNoteModal';
import { CorrectionModal } from './CorrectionModal';
import { RequireAuthModal } from '../auth/RequireAuthModal';
import { generateSelectionHash, getSelectionContext } from '@/lib/selection-utils';
import { supabase } from '@/lib/supabase';

interface ReadingViewManagerProps {
    submission: any;
    children: React.ReactNode;
}

export function ReadingViewManager({ submission, children }: ReadingViewManagerProps) {
    const { isPresentationMode, setPresentationMode } = useReadingExperience();

    // Scientific Telemetry
    const wordCount = React.useMemo(() => {
        const text = submission.description || '';
        return text.split(/\s+/).filter(Boolean).length;
    }, [submission.description]);

    const contentFormat = submission.content_format || 
        (submission.media_type === 'video' ? 'video' : 
         submission.media_type === 'image' ? 'image' : 'text');

    useScrollTracker();
    useTimeOnPage({ 
        content_format: contentFormat,
        word_count: wordCount 
    });

    // Modal & Selection States
    const [activeModal, setActiveModal] = useState<'note' | 'correction' | 'auth' | null>(null);
    const [selectionData, setSelectionData] = useState<{ text: string, hash: string, submissionId: string } | null>(null);

    const handleComment = (text: string, range: Range) => {
        // Find the closest paragraph or block element to get an ID
        let container = range.commonAncestorContainer.parentElement;
        while (container && container.tagName !== 'P' && container.tagName !== 'BLOCKQUOTE' && container.tagName !== 'H1' && container.tagName !== 'H2' && container.tagName !== 'H3') {
            container = container.parentElement;
        }

        const blockId = container?.getAttribute('data-block-id') || 'general';

        // Scroll to comments and focus or open a small inline input
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
            // toast might need to be imported or available globally. It's usually imported from react-hot-toast.
        }
    };

    const handleNote = async (text: string, range: Range) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setActiveModal('auth');
            return;
        }

        const { prefix, suffix } = getSelectionContext(range);
        const hash = generateSelectionHash(text, prefix, suffix);
        setSelectionData({ text, hash, submissionId: submission.id });
        setActiveModal('note');
    };

    const handleCorrection = async (text?: string, range?: Range) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setActiveModal('auth');
            return;
        }

        setSelectionData({ 
            text: text || 'Geral (sem texto específico selecionado)', 
            hash: '', 
            submissionId: submission.id 
        });
        setActiveModal('correction');
    };

    return (
        <>
            {/* Real-time and TTS background logic */}
            <PresenceIndicator submissionId={submission.id} />
            <SpeechPlayer content={submission.description} description={submission.description} />
            <TableOfContents />

            {/* Contextual Interactions */}
            {!isPresentationMode && (
                <TextSelectionHandler
                    onComment={handleComment}
                    onNote={handleNote}
                    onCorrection={handleCorrection}
                />
            )}

            {/* Modals */}
            <AnimatePresence>
                {activeModal === 'note' && selectionData && (
                    <PrivateNoteModal
                        selection={selectionData}
                        onClose={() => setActiveModal(null)}
                        onSave={() => setActiveModal(null)}
                    />
                )}
                {activeModal === 'correction' && selectionData && (
                    <CorrectionModal
                        selection={selectionData}
                        onClose={() => setActiveModal(null)}
                        onSave={() => setActiveModal(null)}
                    />
                )}
                <RequireAuthModal
                    isOpen={activeModal === 'auth'}
                    onClose={() => setActiveModal(null)}
                />
            </AnimatePresence>

            {/* Toolbar always visible unless in presentation mode */}
            {!isPresentationMode && (
                <ReadingToolbar
                    submissionTitle={submission.title}
                    submissionId={submission.id}
                    authors={submission.authors}
                    onCorrection={handleCorrection}
                />
            )}

            {/* View Switcher */}
            {isPresentationMode ? (
                <PresentationMode
                    content={submission.description}
                    onClose={() => setPresentationMode(false)}
                />
            ) : (
                children
            )}
        </>
    );
}
