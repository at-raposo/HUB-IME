'use client';

import React from 'react';

export const SkipLink = () => {
    return (
        <a
            href="#main-content"
            className="fixed top-[-100px] left-4 z-[999] bg-brand-blue text-white px-6 py-3 rounded-xl font-bold transition-all focus:top-4 focus:shadow-2xl"
        >
            Pular para o conteúdo
        </a>
    );
};
