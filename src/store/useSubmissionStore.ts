import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SubmissionStep = 'category' | 'format' | 'basic' | 'optional' | 'curator';

interface SubmissionState {
    currentStep: SubmissionStep;
    category: string;
    mediaType: 'image' | 'video' | 'pdf' | 'zip' | 'sdocx' | 'text' | 'audio' | '';

    // Form fields
    title: string;
    authors: string;
    description: string;
    whatsapp: string;
    videoUrl: string;
    externalLink: string;
    technicalDetails: string;
    altText: string;
    testimonial: string;
    selectedFiles: File[];

    // Curator fields
    isHistorical: boolean;
    isGoldenStandard: boolean;
    selectedDepartments: string[];
    selectedLaboratories: string[];
    selectedResearchers: string[];
    selectedResearchLines: string[];

    // Setters
    watchedValues: any;
    setWatchedValues: (values: any) => void;
    setStep: (step: SubmissionStep) => void;
    setCategory: (category: string) => void;
    setMediaType: (type: 'image' | 'video' | 'pdf' | 'zip' | 'sdocx' | 'text' | 'audio' | '') => void;

    setTitle: (title: string) => void;
    setAuthors: (authors: string) => void;
    setDescription: (description: string) => void;
    setWhatsapp: (whatsapp: string) => void;
    setVideoUrl: (url: string) => void;
    setExternalLink: (link: string) => void;
    setTechnicalDetails: (details: string) => void;
    setAltText: (text: string) => void;
    setTestimonial: (text: string) => void;
    setSelectedFiles: (files: File[]) => void;

    // Curator Setters
    setIsHistorical: (val: boolean) => void;
    setIsGoldenStandard: (val: boolean) => void;
    setSelectedDepartments: (val: string[]) => void;
    setSelectedLaboratories: (val: string[]) => void;
    setSelectedResearchers: (val: string[]) => void;
    setSelectedResearchLines: (val: string[]) => void;

    // reset
    reset: () => void;
}

export const useSubmissionStore = create<SubmissionState>()(
    persist(
        (set) => ({
            currentStep: 'category',
            category: '',
            mediaType: '',

            title: '',
            authors: '',
            description: '',
            whatsapp: '',
            videoUrl: '',
            externalLink: '',
            technicalDetails: '',
            altText: '',
            testimonial: '',
            selectedFiles: [],

            isHistorical: false,
            isGoldenStandard: false,
            selectedDepartments: [],
            selectedLaboratories: [],
            selectedResearchers: [],
            selectedResearchLines: [],

            watchedValues: {},
            setWatchedValues: (values) => set({ watchedValues: values }),
            setStep: (step) => set({ currentStep: step }),
            setCategory: (category) => set({ category }),
            setMediaType: (mediaType) => set({ mediaType }),

            setTitle: (title) => set({ title }),
            setAuthors: (authors) => set({ authors }),
            setDescription: (description) => set({ description }),
            setWhatsapp: (whatsapp) => set({ whatsapp }),
            setVideoUrl: (videoUrl) => set({ videoUrl }),
            setExternalLink: (externalLink) => set({ externalLink }),
            setTechnicalDetails: (technicalDetails) => set({ technicalDetails }),
            setAltText: (altText) => set({ altText }),
            setTestimonial: (testimonial) => set({ testimonial }),
            setSelectedFiles: (selectedFiles) => set({ selectedFiles }),

            setIsHistorical: (isHistorical) => set({ isHistorical }),
            setIsGoldenStandard: (isGoldenStandard) => set({ isGoldenStandard }),
            setSelectedDepartments: (selectedDepartments) => set({ selectedDepartments }),
            setSelectedLaboratories: (selectedLaboratories) => set({ selectedLaboratories }),
            setSelectedResearchers: (selectedResearchers) => set({ selectedResearchers }),
            setSelectedResearchLines: (selectedResearchLines) => set({ selectedResearchLines }),

            reset: () => set({
                currentStep: 'category',
                category: '',
                mediaType: '',
                title: '',
                authors: '',
                description: '',
                whatsapp: '',
                videoUrl: '',
                externalLink: '',
                technicalDetails: '',
                altText: '',
                testimonial: '',
                selectedFiles: [],
                isHistorical: false,
                isGoldenStandard: false,
                selectedDepartments: [],
                selectedLaboratories: [],
                selectedResearchers: [],
                selectedResearchLines: []
            }),
        }),
        {
            name: 'submission-store-storage',
            partialize: (state) => ({
                currentStep: state.currentStep,
                category: state.category,
                mediaType: state.mediaType,
            }),
        }
    )
);
