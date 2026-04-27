import { ReactNode } from 'react';

export interface Department {
    id: 'FAP' | 'FMT' | 'FEP' | 'FGE' | 'FMA' | 'FNC';
    name: string;
    description: string;
    icon: ReactNode;
    metrics: {
        researchers: number;
        labs: number;
    };
    color: string;
}

export interface TimelineEvent {
    year: string;
    title: string;
    description: string;
    category?: 'founding' | 'milestone' | 'discovery' | 'innovation';
}

export interface SemanticNode {
    id: string;
    label: string;
    type: 'post' | 'researcher' | 'lab' | 'line' | 'department';
    icon?: ReactNode;
}

export interface SemanticConnection {
    from: string;
    to: string;
}
