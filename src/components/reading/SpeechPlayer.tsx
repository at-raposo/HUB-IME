'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReadingExperience } from './ReadingExperienceProvider';
import { useTelemetry } from '@/hooks/useTelemetry';

export function SpeechPlayer({ content, description }: { content: string, description?: string }) {
    const { isAudioPlaying, setAudioPlaying, audioLanguage } = useReadingExperience();
    const { trackEvent } = useTelemetry();
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const startTimeRef = useRef<number | null>(null);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Prioritize description for cleaner narration (no markdown/math syntax)
    const textToSpeak = description || content;

    useEffect(() => {
        if (!synth) return;

        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        synth.onvoiceschanged = loadVoices;
    }, [synth]);

    useEffect(() => {
        if (!synth) return;

        synth.cancel(); // Always cancel current speech if dependencies change

        if (isAudioPlaying) {
            // Clean content: remove LaTeX formulas and markdown symbols
            const cleanText = content
                .replace(/\$\$[\s\S]*?\$\$/g, '[fórmula matemática]') // Block LaTeX
                .replace(/\$.*?\$/g, '[fórmula]') // Inline LaTeX
                .replace(/#+ /g, '') // Headers
                .replace(/\*\*|\*/g, '') // Bold/Italic
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                .replace(/!\[.*?\]\(.*?\)/g, '[imagem]'); // Images

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = audioLanguage;

            // Try to find a good voice matching the selected language
            const langPrefix = audioLanguage.startsWith('pt') ? 'pt' : 'en';

            const speakWhenReady = () => {
                const availableVoices = synth.getVoices().filter(v => v.lang.startsWith(langPrefix));
                const selectedVoice = availableVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || availableVoices[0] || synth.getVoices()[0];

                if (selectedVoice) utterance.voice = selectedVoice;

                utterance.onend = () => {
                    setAudioPlaying(false);
                    trackEvent('AUDIO_ENDED', { duration: performance.now() - (startTimeRef.current || 0) });
                };
                utterance.onerror = (e) => {
                    if (e.error !== 'canceled') setAudioPlaying(false);
                };

                utteranceRef.current = utterance;
                startTimeRef.current = performance.now();
                trackEvent('AUDIO_PLAY', { 
                    current_time: 0,
                    content_format: 'audio',
                    mode: 'tts'
                });
                synth.speak(utterance);
            };

            if (synth.getVoices().length === 0) {
                const onVoicesChanged = () => {
                    synth.removeEventListener('voiceschanged', onVoicesChanged);
                    speakWhenReady();
                };
                synth.addEventListener('voiceschanged', onVoicesChanged);
            } else {
                // setTimeout is needed because synth.cancel() is asynchronous in some browsers
                setTimeout(speakWhenReady, 50);
            }
        }

        return () => {
            if (synth) {
                if (isAudioPlaying) {
                    trackEvent('AUDIO_PAUSE', { 
                        current_time: (performance.now() - (startTimeRef.current || 0)) / 1000 
                    });
                }
                synth.cancel();
            }
        };
    }, [isAudioPlaying, content, synth, audioLanguage, setAudioPlaying]);

    return null; // Interface is in the Toolbar
}
