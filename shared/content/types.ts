/**
 * Content model shared by the public portfolio and the admin dashboard.
 *
 * Everything the site displays lives in the database in this shape. Text that is
 * shown to readers is stored in both languages (`L10n`); the public site picks the
 * reader's language and falls back to English when the Arabic field is empty.
 *
 * This file must stay dependency-free: the admin app is a separate Next.js project
 * and imports it by relative path, without the portfolio's node_modules.
 */

/** A string in both site languages. */
export type L10n = { en: string; ar: string };

/** A list of strings in both site languages (e.g. highlights, responsibilities). */
export type L10nList = { en: string[]; ar: string[] };

export const emptyL10n = (): L10n => ({ en: '', ar: '' });
export const emptyL10nList = (): L10nList => ({ en: [], ar: [] });

/* ------------------------------------------------------------------ singletons */

export interface SocialLinkData {
    platform: string; // "GitHub", "LinkedIn", "Instagram", "X", "Website", …
    url: string;
    username?: string;
}

export interface LanguageData {
    name: L10n;
    level: L10n;
}

export interface ProfileData {
    name: L10n;
    title: L10n;
    /** One-line professional headline shown under the title. */
    headline: L10n;
    /** Short introduction (a sentence or two). */
    intro: L10n;
    bio: L10n;
    location: L10n;
    avatar: string;
    heroImage: string;
    /** Name and role printed on the contact/lanyard card. */
    cardName: L10n;
    cardRole: L10n;
    email: string;
    phone: string;
    website: string;
    socialLinks: SocialLinkData[];
    languages: LanguageData[];
    /** Headline numbers. */
    gpaValue: number;
    gpaScale: number;
    careerStartYear: number;
}

export interface ResumeData {
    /** URL of the current CV. Empty = use the bundled /resume.pdf. */
    url: string;
    fileName: string;
    updatedAt: string;
}

export interface SingletonMap {
    profile: ProfileData;
    resume: ResumeData;
}
export type SingletonKey = keyof SingletonMap;

/* ----------------------------------------------------------------- collections */

export interface ProjectData {
    slug: string;
    name: L10n;
    description: L10n;
    longDescription: L10n;
    category: L10n;
    role: L10n;
    team: L10n;
    status: 'ongoing' | 'completed' | 'planned';
    featured: boolean;
    /** Live website. Shown embedded when the site allows it. */
    liveUrl: string;
    /** auto = embed if the site allows framing; off = always use the screenshot. */
    embedMode: 'auto' | 'off';
    repoUrl: string;
    documentUrl: L10n;
    thumbnail: string;
    screenshots: string[];
    technologies: string[];
    tools: string[];
    highlights: L10nList;
    challenges: { problem: L10n; solution: L10n }[];
    startDate: string;
    endDate: string;
}

export interface ExperienceData {
    company: L10n;
    position: L10n;
    description: L10n;
    responsibilities: L10nList;
    location: L10n;
    type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'volunteer' | 'training';
    /** Groups the experience page's category filter. */
    group: 'professional' | 'leadership' | 'volunteer' | 'certifications';
    startDate: string;
    endDate: string;
    current: boolean;
    /** Skills/technologies, per language (e.g. "Prompt Engineering" / "هندسة البرومبت"). */
    technologies: L10nList;
    images: string[];
    logo: string;
    link: string;
}

export interface EducationData {
    institution: L10n;
    degree: L10n;
    major: L10n;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    achievements: L10nList;
    activities: L10nList;
}

export type SkillCategory =
    | 'programming'
    | 'ai'
    | 'backend'
    | 'frontend'
    | 'databases'
    | 'frameworks'
    | 'cloud'
    | 'data'
    | 'tools'
    | 'design'
    | 'soft'
    | 'other';

export interface SkillData {
    name: L10n;
    category: SkillCategory;
    /** Logo URL (uploaded or external). Optional for soft skills. */
    icon: string;
    /** Dark artwork that should be inverted on dark backgrounds. */
    iconInvertInDark: boolean;
    /** Show in the scrolling tech/tool logo rows. */
    showInStack: boolean;
}

export type AchievementCategory =
    | 'certification'
    | 'award'
    | 'competition'
    | 'hackathon'
    | 'recognition'
    | 'publication';

export interface AchievementData {
    title: L10n;
    organization: L10n;
    description: L10n;
    category: AchievementCategory;
    date: string;
    image: string;
    files: string[];
    link: string;
    credentialId: string;
    tags: L10nList;
}

export interface ResearchData {
    slug: string;
    title: L10n;
    /** Research type, e.g. "Graduation Project — Full Study". */
    type: L10n;
    context: L10n;
    summary: L10n;
    /** Display date, e.g. "August 2026". */
    date: L10n;
    status: 'completed' | 'in-progress';
    file: L10n;
    fileLabel: L10n;
    cover: string;
    color: string;
    variant: 'simple' | 'stripe';
    links: { label: L10n; url: string }[];
}

export interface TimelineData {
    /** Which tab of the experience page's orbit this milestone belongs to. */
    category: 'education' | 'journey' | 'experience';
    title: L10n;
    description: L10n;
    date: string;
    images: string[];
}

export type GallerySlot = 'auto' | 'center' | 'left' | 'right' | 'top' | 'bottom' | 'corner-top' | 'corner-bottom';

export interface GalleryData {
    title: L10n;
    description: L10n;
    category: L10n;
    date: string;
    image: string;
    /** Position in the home page's zoom composition. */
    slot: GallerySlot;
    showOnHome: boolean;
}

export interface CollectionMap {
    projects: ProjectData;
    experience: ExperienceData;
    education: EducationData;
    skills: SkillData;
    achievements: AchievementData;
    research: ResearchData;
    timeline: TimelineData;
    gallery: GalleryData;
}
export type CollectionKey = keyof CollectionMap;

export const COLLECTION_KEYS: CollectionKey[] = [
    'projects',
    'experience',
    'education',
    'skills',
    'achievements',
    'research',
    'timeline',
    'gallery',
];

/** A stored collection row. */
export interface Item<K extends CollectionKey = CollectionKey> {
    id: string;
    collection: K;
    data: CollectionMap[K];
    sortOrder: number;
    published: boolean;
    updatedAt: string;
}

/** Everything the public site needs, in one object. */
export interface SiteContent {
    version: number;
    profile: ProfileData;
    resume: ResumeData;
    collections: { [K in CollectionKey]: Item<K>[] };
}

export interface MediaRecord {
    id: string;
    url: string;
    pathname: string;
    fileName: string;
    contentType: string;
    size: number;
    sha256: string;
    /** 'upload' = stored in blob/local storage; 'bundled' = shipped in the portfolio's /public. */
    source: 'upload' | 'bundled';
    createdAt: string;
}
