'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6 overflow-x-auto no-scrollbar py-2">
            <Link
                href="/"
                className="flex items-center gap-1 hover:text-brand-blue transition-colors shrink-0"
            >
                <Home size={14} />
                <span>Início</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-brand-blue transition-colors shrink-0 whitespace-nowrap"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-gray-100 shrink-0 truncate max-w-[200px]">
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
