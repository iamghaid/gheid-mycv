'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { research, type ResearchItem } from '@/data/research';
import { researchAr } from '@/data/research.ar';

/**
 * The research studies in the reader's language.
 *
 * Mirrors `useLocalizedPortfolio`: English records stay authoritative for structure,
 * and the Arabic overlay replaces only the fields it defines.
 */
export function useLocalizedResearch(): ResearchItem[] {
    const locale = useLocale();

    return useMemo(() => {
        if (locale !== 'ar') return research;
        return research.map((item) => {
            const overlay = researchAr[item.id];
            if (!overlay) return item;
            return {
                ...item,
                title: overlay.title ?? item.title,
                subtitle: overlay.subtitle ?? item.subtitle,
                context: overlay.context ?? item.context,
                summary: overlay.summary ?? item.summary,
                date: overlay.date ?? item.date,
                fileLabel: overlay.fileLabel ?? item.fileLabel,
            };
        });
    }, [locale]);
}
