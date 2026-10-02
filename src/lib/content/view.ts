/**
 * Turns the bilingual database content into the shapes the site's components were
 * built around (PortfolioData, ResearchItem, …), in one language.
 *
 * Keeping this translation in one place is what lets the public design stay exactly
 * as it was: components keep reading `useLocalizedPortfolio()` and friends, and only
 * the source of the data changed — from source files to the database.
 */
import { skillLogo, skillLogoNeedsInvert } from '@/lib/skill-logos';
import { canonicalProjectUrl } from '@/lib/project-presentation';
import { projectScreenshots } from '@/lib/project-screenshots';
import type {
    AchievementData, EducationData, ExperienceData, GalleryData, GallerySlot, Item, L10n, L10nList, ProjectData,
    ResearchData, SiteContent, SkillCategory, SkillData, TimelineData,
} from '@shared/content/types';
import type {
    Achievement, Education, Experience, GalleryItem, PortfolioData, Project, Skill, SoftSkill, TechStack, Tool,
} from '@/types';

export type Locale = 'en' | 'ar';

/** Reader's language, falling back to English when the Arabic field is empty. */
export const pick = (v: L10n | undefined, locale: Locale): string => (v ? (locale === 'ar' ? v.ar || v.en : v.en || v.ar) : '');
const pickList = (v: L10nList | undefined, locale: Locale): string[] =>
    v ? (locale === 'ar' && v.ar.length ? v.ar : v.en.length ? v.en : v.ar) : [];
const optional = (s: string) => s || undefined;

export interface ResearchItem {
    id: string;
    title: string;
    titleAr: string;
    subtitle: string;
    date: string;
    context: string;
    summary: string;
    color: string;
    variant: 'simple' | 'stripe';
    fileUrl: string;
    fileLabel: string;
    cover?: string;
    status: 'completed' | 'in-progress';
    links: { label: string; url: string }[];
}

export interface TimelineNode {
    id: string;
    label: string;
    description: string;
    imageUrl?: string;
    date?: string;
}

export interface HomeGalleryImage {
    src: string;
    alt: string;
    slot: GallerySlot;
}

export interface ProfileStats {
    gpaValue: number;
    gpaScale: number;
    gpaLabel: string;
    careerStartYear: number;
    yearsOfExperience: number;
}

export interface SiteView {
    portfolio: PortfolioData;
    research: ResearchItem[];
    timeline: Record<TimelineData['category'], TimelineNode[]>;
    homeGallery: HomeGalleryImage[];
    stats: ProfileStats;
    card: { name: string; role: string; avatar: string };
    resumeUrl: string;
    intro: string;
}

const GROUP_PREFIX: Record<ExperienceData['group'], string> = {
    professional: 'prof-',
    leadership: 'lead-',
    volunteer: 'vol-',
    certifications: 'cert-',
};

const HARD_CATEGORY: Record<SkillCategory, Skill['category']> = {
    programming: 'software', ai: 'ai', backend: 'backend', frontend: 'frontend', databases: 'database',
    frameworks: 'frontend', cloud: 'cloud', data: 'data', tools: 'tools', design: 'other', soft: 'other', other: 'other',
};
const STACK_CATEGORY: Record<SkillCategory, TechStack['category']> = {
    programming: 'language', ai: 'library', backend: 'framework', frontend: 'framework', databases: 'database',
    frameworks: 'framework', cloud: 'cloud', data: 'library', tools: 'tool', design: 'tool', soft: 'tool', other: 'tool',
};
const isToolCategory = (c: SkillCategory) => c === 'tools' || c === 'design';

const data = <T>(items: Item[]) => items.map((i) => ({ id: i.id, ...(i.data as T) }));

export function buildView(content: SiteContent, locale: Locale, theme: 'light' | 'dark' = 'dark'): SiteView {
    const p = content.profile;
    const c = content.collections;

    const projects: Project[] = data<ProjectData>(c.projects)
        // Featured first; otherwise the order set in the admin.
        .map((x, i) => ({ x, i }))
        .sort((a, b) => Number(b.x.featured) - Number(a.x.featured) || a.i - b.i)
        .map(({ x }) => ({
            id: x.id,
            slug: x.slug,
            title: pick(x.name, locale),
            description: pick(x.description, locale),
            longDescription: optional(pick(x.longDescription, locale)),
            image: optional(x.thumbnail),
            techStack: x.technologies,
            tools: x.tools,
            status: x.status,
            demoUrl: canonicalProjectUrl(optional(x.liveUrl)),
            repoUrl: optional(x.repoUrl),
            documentUrl: optional(x.documentUrl.en || x.documentUrl.ar),
            documentUrlAr: optional(x.documentUrl.ar || x.documentUrl.en),
            startDate: x.startDate,
            endDate: optional(x.endDate),
            highlights: pickList(x.highlights, locale),
            category: optional(pick(x.category, locale)),
            challengesAndSolutions: x.challenges.map((ch) => ({ problem: pick(ch.problem, locale), solution: pick(ch.solution, locale) })),
            galleryImages: x.screenshots,
            team: optional(pick(x.team, locale)),
            role: optional(pick(x.role, locale)),
            featured: x.featured,
            embedMode: x.embedMode,
            ...projectScreenshots(x.slug, { language: locale, theme }),
        }));

    const experiences: Experience[] = data<ExperienceData>(c.experience).map((x) => ({
        id: `${GROUP_PREFIX[x.group] ?? 'prof-'}${x.id}`,
        company: pick(x.company, locale),
        position: pick(x.position, locale),
        description: pick(x.description, locale),
        responsibilities: pickList(x.responsibilities, locale),
        skills: pickList(x.technologies, locale),
        startDate: x.startDate,
        endDate: optional(x.endDate),
        isOngoing: x.current,
        location: optional(pick(x.location, locale)),
        type: x.type,
        logo: optional(x.logo),
        link: optional(x.link),
        galleryImages: x.images,
    }));

    const education: Education[] = data<EducationData>(c.education).map((x) => ({
        id: x.id,
        institution: pick(x.institution, locale),
        degree: pick(x.degree, locale),
        major: pick(x.major, locale),
        startDate: x.startDate,
        endDate: optional(x.endDate),
        isOngoing: x.current,
        gpa: optional(x.gpa),
        achievements: pickList(x.achievements, locale),
        activities: pickList(x.activities, locale),
    }));

    const achievements: Achievement[] = data<AchievementData>(c.achievements).map((x) => ({
        id: x.id,
        title: pick(x.title, locale),
        issuer: pick(x.organization, locale),
        date: x.date,
        description: optional(pick(x.description, locale)),
        image: optional(x.image),
        credentialUrl: optional(x.link),
        credentialId: optional(x.credentialId),
        tags: pickList(x.tags, locale),
        category: x.category,
        files: x.files,
    }));

    const skills = data<SkillData>(c.skills).map(s => ({ ...s, icon: skillLogo(s.name.en, s.icon), iconInvertInDark: skillLogoNeedsInvert(s.name.en, s.iconInvertInDark) }));
    const techStack: TechStack[] = skills
        .filter((s) => s.showInStack && s.icon && !isToolCategory(s.category) && s.category !== 'soft')
        .map((s) => ({ name: pick(s.name, locale), icon: s.icon, category: STACK_CATEGORY[s.category], iconInvertInDark: s.iconInvertInDark }));
    const tools: Tool[] = skills
        .filter((s) => s.showInStack && s.icon && isToolCategory(s.category))
        .map((s) => ({ name: pick(s.name, locale), icon: s.icon, category: s.category === 'design' ? 'design' : 'devops', iconInvertInDark: s.iconInvertInDark }));
    const hardSkills: Skill[] = skills
        .filter((s) => s.category !== 'soft')
        .map((s) => ({ name: pick(s.name, locale), category: HARD_CATEGORY[s.category], icon: s.icon, iconInvertInDark: s.iconInvertInDark }));
    const softSkills: SoftSkill[] = skills.filter((s) => s.category === 'soft').map((s) => ({ name: pick(s.name, locale) }));

    const galleryData = data<GalleryData>(c.gallery);
    const gallery: GalleryItem[] = galleryData.map((g) => ({
        id: g.id,
        title: pick(g.title, locale),
        description: pick(g.description, locale),
        date: g.date,
        type: 'image',
        url: g.image,
        category: pick(g.category, locale),
    }));

    const research: ResearchItem[] = data<ResearchData>(c.research).map((r) => ({
        id: r.slug || r.id,
        title: pick(r.title, locale),
        titleAr: r.title.ar,
        subtitle: pick(r.type, locale),
        date: pick(r.date, locale),
        context: pick(r.context, locale),
        summary: pick(r.summary, locale),
        color: r.color,
        variant: r.variant,
        fileUrl: pick(r.file, locale),
        fileLabel: pick(r.fileLabel, locale),
        cover: optional(r.cover),
        status: r.status,
        links: r.links.map((l) => ({ label: pick(l.label, locale) || l.url, url: l.url })),
    }));

    const timeline: SiteView['timeline'] = { education: [], journey: [], experience: [] };
    for (const t of data<TimelineData>(c.timeline)) {
        timeline[t.category]?.push({
            id: t.id,
            label: pick(t.title, locale),
            description: pick(t.description, locale),
            imageUrl: t.images[0],
            date: optional(t.date),
        });
    }

    const gpaLabel = `${Number(p.gpaValue).toFixed(1)}/${Number(p.gpaScale).toFixed(1)}`;
    const stats: ProfileStats = {
        gpaValue: p.gpaValue,
        gpaScale: p.gpaScale,
        gpaLabel,
        careerStartYear: p.careerStartYear,
        yearsOfExperience: Math.max(1, new Date().getFullYear() - (p.careerStartYear || new Date().getFullYear())),
    };

    const portfolio: PortfolioData = {
        personal: {
            name: pick(p.name, locale),
            title: pick(p.title, locale),
            subtitle: pick(p.headline, locale),
            bio: pick(p.bio, locale),
            avatar: p.avatar,
            heroImage: optional(p.heroImage),
            location: pick(p.location, locale),
            email: p.email,
            phone: optional(p.phone),
            website: optional(p.website),
            resumeUrl: '/resume',
            languages: p.languages.map((l) => ({ name: pick(l.name, locale), level: pick(l.level, locale) })),
            socialLinks: p.socialLinks.map((s) => ({ platform: s.platform, url: s.url, icon: s.platform.toLowerCase(), username: optional(s.username ?? '') })),
        },
        projects,
        experiences,
        education,
        achievements,
        techStack,
        hardSkills,
        softSkills,
        tools,
        faqs: [],
        blogs: [],
        gallery,
    };

    return {
        portfolio,
        research,
        timeline,
        homeGallery: galleryData.filter((g) => g.showOnHome && g.image).map((g) => ({ src: g.image, alt: pick(g.title, locale), slot: g.slot })),
        stats,
        card: { name: pick(p.cardName, locale) || pick(p.name, locale), role: pick(p.cardRole, locale) || pick(p.title, locale), avatar: p.avatar },
        resumeUrl: content.resume.url && content.resume.url !== '/resume.pdf'
            ? content.resume.url
            : '/Gheid_Abdulkarim_CV.pdf',
        intro: pick(p.intro, locale),
    };
}
