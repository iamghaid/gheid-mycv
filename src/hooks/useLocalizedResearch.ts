'use client';

import type { ResearchItem } from '@/lib/content/view';
import { useSiteView } from '@/providers/ContentProvider';

/** Research studies in the reader's language, from the database. */
export function useLocalizedResearch(): ResearchItem[] {
    return useSiteView().research;
}
