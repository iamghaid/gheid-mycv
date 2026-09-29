'use client';

import { useSiteView } from '@/providers/ContentProvider';
import type { ProfileStats } from '@/lib/content/view';

/** GPA and years of experience, as edited in the admin's Profile section. */
export function useProfileStats(): ProfileStats {
    return useSiteView().stats;
}
