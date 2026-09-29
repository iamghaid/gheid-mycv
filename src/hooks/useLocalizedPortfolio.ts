'use client';

import type { PortfolioData } from '@/types';
import { useBaseView, useSiteView } from '@/providers/ContentProvider';

/**
 * The portfolio data in the reader's language, from the database.
 *
 * Previously this merged the English records in src/data/portfolio.ts with an Arabic
 * overlay. Content now lives in the database (edited from the admin dashboard);
 * this hook keeps its name and return shape so no component had to change.
 */
export function useLocalizedPortfolio(): PortfolioData {
    return useSiteView().portfolio;
}

/** English records — for matching on canonical names (icons, category keys). */
export function useBasePortfolio(): PortfolioData {
    return useBaseView().portfolio;
}
