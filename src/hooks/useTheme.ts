'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        setTheme(initialTheme);

        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            document.cookie = "theme=dark; path=/; max-age=31536000";
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            document.cookie = "theme=light; path=/; max-age=31536000";
        }
    };

    return { theme, toggleTheme };
}
