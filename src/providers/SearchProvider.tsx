'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type SearchScope = 'GLOBAL' | 'WIKI' | 'MAPA';

interface SearchContextType {
    query: string;
    setQuery: (q: string) => void;
    scope: SearchScope;
    placeholder: string;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * 🧠 SearchProvider: O Cérebro da Busca Contextual (V3.1.0)
 * Detecta automaticamente o escopo via Regex Routing.
 */
export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState<SearchScope>('GLOBAL');
    const pathname = usePathname();

    useEffect(() => {
        // Regex Routing Engine
        if (pathname.match(/^\/colisor/)) {
            setScope('WIKI');
        } else if (pathname.match(/^\/mapa/)) {
            setScope('MAPA');
        } else {
            setScope('GLOBAL');
        }
    }, [pathname]);

    const getPlaceholder = useCallback(() => {
        switch (scope) {
            case 'WIKI': return 'Pesquisar documentação técnica...';
            case 'MAPA': return 'Pesquisar locais e mídias...';
            default: return 'Pesquisar no Hub Lab-Div...';
        }
    }, [scope]);

    return (
        <SearchContext.Provider value={{ query, setQuery, scope, placeholder: getPlaceholder() }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        // Fallback for SSR or accidental outside usage to prevent crash
        return {
            query: '',
            setQuery: () => {},
            scope: 'GLOBAL' as SearchScope,
            placeholder: 'Pesquisar no Hub Lab-Div...'
        };
    }
    return context;
};
