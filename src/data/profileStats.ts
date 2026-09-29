import { portfolioData } from './portfolio';

/**
 * Single source of truth for the headline numbers shown around the site.
 * Change them here — nothing else should hardcode a GPA or a year count.
 */

/** Cumulative GPA. */
export const GPA_VALUE = 3.8;

/** The scale the GPA is measured on. */
export const GPA_SCALE = 4.0;

/** Formatted for display, e.g. "3.8/4.0". */
export const GPA_LABEL = `${GPA_VALUE.toFixed(1)}/${GPA_SCALE.toFixed(1)}`;

/** The year professional (freelance) work started. */
export const CAREER_START_YEAR = 2024;

/** Full years of professional experience, recomputed on every render. */
export const YEARS_OF_EXPERIENCE = Math.max(
    1,
    new Date().getFullYear() - CAREER_START_YEAR
);

/** Counts derived from the portfolio data so they can never drift out of sync. */
export const PROJECT_COUNT = portfolioData.projects.length;
export const CERTIFICATION_COUNT = portfolioData.achievements.length;
export const TECH_AND_TOOLS_COUNT = portfolioData.hardSkills.length;
