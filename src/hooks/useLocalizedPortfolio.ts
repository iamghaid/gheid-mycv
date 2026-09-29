'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { portfolioData } from '@/data/portfolio';
import {
    achievementsAr,
    educationAr,
    experiencesAr,
    galleryAr,
    personalAr,
    projectsAr,
    skillTagsAr,
    softSkillsAr,
} from '@/data/portfolio.ar';
import type { PortfolioData } from '@/types';

/**
 * The portfolio data in the reader's language.
 *
 * The English records in `portfolio.ts` stay the single source of structure; the
 * Arabic overlay in `portfolio.ar.ts` supplies translated strings keyed by the same
 * `id`. Fields the overlay omits keep their English value, which is what we want for
 * proper nouns like React, Firebase or GitHub.
 *
 * In English the original object is returned unchanged, so there is no cost.
 */
export function useLocalizedPortfolio(): PortfolioData {
    const locale = useLocale();

    return useMemo(() => {
        if (locale !== 'ar') return portfolioData;

        return {
            ...portfolioData,
            personal: {
                ...portfolioData.personal,
                ...stripUndefined(personalAr),
                languages: portfolioData.personal.languages?.map((language) => ({
                    ...language,
                    ...stripUndefined(personalAr.languages?.[language.name] ?? {}),
                })),
            },
            projects: portfolioData.projects.map((project) => ({
                ...project,
                ...stripUndefined(projectsAr[project.id] ?? {}),
            })),
            experiences: portfolioData.experiences.map((experience) => ({
                ...experience,
                ...stripUndefined(experiencesAr[experience.id] ?? {}),
                skills: experience.skills.map((s) => skillTagsAr[s] ?? s),
            })),
            education: portfolioData.education.map((education) => ({
                ...education,
                ...stripUndefined(educationAr[education.id] ?? {}),
            })),
            achievements: portfolioData.achievements.map((achievement) => ({
                ...achievement,
                ...stripUndefined(achievementsAr[achievement.id] ?? {}),
                tags: achievement.tags?.map((tag) => skillTagsAr[tag] ?? tag),
            })),
            gallery: portfolioData.gallery.map((item) => ({
                ...item,
                ...stripUndefined(galleryAr[item.id] ?? {}),
            })),
            softSkills: portfolioData.softSkills.map((skill) => ({
                ...skill,
                name: softSkillsAr[skill.name] ?? skill.name,
            })),
        };
    }, [locale]);
}

/** Drops keys whose value is undefined so they never overwrite an English field. */
function stripUndefined<T extends object>(source: T): Partial<T> {
    const out: Partial<T> = {};
    for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) {
            out[key as keyof T] = value as T[keyof T];
        }
    }
    return out;
}
