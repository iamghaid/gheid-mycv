/**
 * Field definitions for every editable record.
 *
 * One description per collection drives both the admin forms (which inputs to
 * render) and server-side validation (`sanitize`), so the two cannot drift apart.
 * Dependency-free on purpose — see types.ts.
 */
import type { CollectionKey, SingletonKey, SkillCategory, AchievementCategory, GallerySlot } from './types';

export type FieldType =
    | 'text' // single-line string
    | 'slug'
    | 'url' // http(s) URL or site-relative path
    | 'email'
    | 'date' // YYYY-MM-DD (or empty)
    | 'number'
    | 'boolean'
    | 'color'
    | 'select'
    | 'l10n' // bilingual single line
    | 'l10nText' // bilingual paragraph
    | 'l10nList' // bilingual list of lines
    | 'l10nFile' // one document per language
    | 'tags' // list of plain strings
    | 'image' // one media URL
    | 'images' // ordered list of media URLs
    | 'file' // one document URL
    | 'files'
    | 'links' // [{ label: L10n, url }]
    | 'challenges' // [{ problem: L10n, solution: L10n }]
    | 'social' // [{ platform, url, username }]
    | 'languages'; // [{ name: L10n, level: L10n }]

export interface Field {
    key: string;
    type: FieldType;
    label: string;
    labelAr: string;
    help?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    /** Accepted upload types for image/file fields. */
    accept?: string;
    /** Layout hint for the admin form. */
    half?: boolean;
}

export interface CollectionConfig {
    key: CollectionKey;
    label: string;
    labelAr: string;
    singular: string;
    description: string;
    fields: Field[];
    /** Field paths used for the list view. */
    listTitle: string; // e.g. 'name.en'
    listSubtitle?: string;
    listImage?: string;
    defaults: () => Record<string, unknown>;
}

export interface SingletonConfig {
    key: SingletonKey;
    label: string;
    labelAr: string;
    description: string;
    fields: Field[];
    defaults: () => Record<string, unknown>;
}

const L = () => ({ en: '', ar: '' });
const LL = () => ({ en: [] as string[], ar: [] as string[] });

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
    { value: 'programming', label: 'Programming Languages' },
    { value: 'ai', label: 'AI' },
    { value: 'backend', label: 'Backend' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'databases', label: 'Databases' },
    { value: 'frameworks', label: 'Frameworks' },
    { value: 'cloud', label: 'Cloud' },
    { value: 'data', label: 'Data' },
    { value: 'tools', label: 'Tools' },
    { value: 'design', label: 'Design' },
    { value: 'soft', label: 'Soft skills' },
    { value: 'other', label: 'Other' },
];

const ACHIEVEMENT_CATEGORIES: { value: AchievementCategory; label: string }[] = [
    { value: 'certification', label: 'Certificate' },
    { value: 'award', label: 'Award' },
    { value: 'competition', label: 'Competition' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'recognition', label: 'Achievement' },
    { value: 'publication', label: 'Announcement' },
];

const GALLERY_SLOTS: { value: GallerySlot; label: string }[] = [
    { value: 'auto', label: 'Automatic' },
    { value: 'center', label: 'Center (main image)' },
    { value: 'left', label: 'Left (tall)' },
    { value: 'right', label: 'Right (tall)' },
    { value: 'top', label: 'Top (wide)' },
    { value: 'bottom', label: 'Bottom (wide)' },
    { value: 'corner-top', label: 'Small — top corner' },
    { value: 'corner-bottom', label: 'Small — bottom corner' },
];

const IMG = 'image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml';
const DOC = 'application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
    projects: {
        key: 'projects',
        label: 'Projects',
        labelAr: 'المشاريع',
        singular: 'Project',
        description: 'Everything on the Projects page and the home page project slider.',
        listTitle: 'name.en',
        listSubtitle: 'category.en',
        listImage: 'thumbnail',
        fields: [
            { key: 'name', type: 'l10n', label: 'Project name', labelAr: 'اسم المشروع', required: true },
            { key: 'slug', type: 'slug', label: 'URL slug', labelAr: 'الرابط المختصر', help: 'Used in the address: /projects/<slug>. Lowercase letters, numbers and dashes.', required: true, half: true },
            { key: 'status', type: 'select', label: 'Status', labelAr: 'الحالة', half: true, options: [
                { value: 'completed', label: 'Completed' }, { value: 'ongoing', label: 'In progress' }, { value: 'planned', label: 'Planned' },
            ] },
            { key: 'featured', type: 'boolean', label: 'Featured', labelAr: 'مميز', help: 'Featured projects are listed first.', half: true },
            { key: 'category', type: 'l10n', label: 'Category', labelAr: 'التصنيف' },
            { key: 'description', type: 'l10nText', label: 'Short description', labelAr: 'وصف مختصر', required: true },
            { key: 'longDescription', type: 'l10nText', label: 'Full description', labelAr: 'الوصف الكامل' },
            { key: 'liveUrl', type: 'url', label: 'Live project URL', labelAr: 'رابط المشروع المباشر', help: 'Shown embedded on the project page when the site allows it; otherwise a screenshot and an "Open live project" button.' },
            { key: 'embedMode', type: 'select', label: 'Live preview', labelAr: 'المعاينة المباشرة', half: true, options: [
                { value: 'auto', label: 'Embed when allowed' }, { value: 'off', label: 'Screenshot only' },
            ] },
            { key: 'repoUrl', type: 'url', label: 'GitHub URL', labelAr: 'رابط GitHub', half: true },
            { key: 'thumbnail', type: 'image', label: 'Thumbnail', labelAr: 'الصورة المصغرة', accept: IMG },
            { key: 'screenshots', type: 'images', label: 'Screenshots', labelAr: 'لقطات الشاشة', accept: IMG },
            { key: 'technologies', type: 'tags', label: 'Technologies', labelAr: 'التقنيات' },
            { key: 'tools', type: 'tags', label: 'Tools', labelAr: 'الأدوات' },
            { key: 'role', type: 'l10n', label: 'My role', labelAr: 'دوري' },
            { key: 'team', type: 'l10n', label: 'Team / context', labelAr: 'الفريق / السياق' },
            { key: 'highlights', type: 'l10nList', label: 'Highlights', labelAr: 'أبرز النقاط' },
            { key: 'challenges', type: 'challenges', label: 'Challenges & solutions', labelAr: 'التحديات والحلول' },
            { key: 'documentUrl', type: 'l10nFile', label: 'Document (PDF/Word)', labelAr: 'مستند', accept: DOC },
            { key: 'startDate', type: 'date', label: 'Start date', labelAr: 'تاريخ البداية', half: true },
            { key: 'endDate', type: 'date', label: 'End date', labelAr: 'تاريخ النهاية', half: true },
        ],
        defaults: () => ({
            slug: '', name: L(), description: L(), longDescription: L(), category: L(), role: L(), team: L(),
            status: 'completed', featured: false, liveUrl: '', embedMode: 'auto', repoUrl: '', documentUrl: L(),
            thumbnail: '', screenshots: [], technologies: [], tools: [], highlights: LL(), challenges: [],
            startDate: '', endDate: '',
        }),
    },
    experience: {
        key: 'experience',
        label: 'Experience',
        labelAr: 'الخبرة',
        singular: 'Experience',
        description: 'Roles shown in the experience timeline, the home page journey and the Experience page.',
        listTitle: 'position.en',
        listSubtitle: 'company.en',
        listImage: 'images.0',
        fields: [
            { key: 'position', type: 'l10n', label: 'Position', labelAr: 'المسمّى', required: true },
            { key: 'company', type: 'l10n', label: 'Company / organization', labelAr: 'الجهة', required: true },
            { key: 'description', type: 'l10nText', label: 'Description', labelAr: 'الوصف' },
            { key: 'responsibilities', type: 'l10nList', label: 'Responsibilities', labelAr: 'المهام' },
            { key: 'group', type: 'select', label: 'Group', labelAr: 'المجموعة', half: true, options: [
                { value: 'professional', label: 'Professional' }, { value: 'leadership', label: 'Leadership & organizing' },
                { value: 'volunteer', label: 'Volunteer' }, { value: 'certifications', label: 'Certifications & development' },
            ] },
            { key: 'type', type: 'select', label: 'Type', labelAr: 'النوع', half: true, options: [
                { value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' }, { value: 'freelance', label: 'Freelance' }, { value: 'volunteer', label: 'Volunteer' },
                { value: 'training', label: 'Training' },
            ] },
            { key: 'startDate', type: 'date', label: 'Start date', labelAr: 'تاريخ البداية', required: true, half: true },
            { key: 'endDate', type: 'date', label: 'End date', labelAr: 'تاريخ النهاية', half: true },
            { key: 'current', type: 'boolean', label: 'Current position', labelAr: 'حتى الآن', half: true },
            { key: 'location', type: 'l10n', label: 'Location', labelAr: 'الموقع' },
            { key: 'technologies', type: 'l10nList', label: 'Skills / technologies', labelAr: 'المهارات / التقنيات' },
            { key: 'images', type: 'images', label: 'Images', labelAr: 'الصور', help: 'The first image is used on the home page timeline card.', accept: IMG },
            { key: 'logo', type: 'image', label: 'Logo', labelAr: 'الشعار', accept: IMG },
            { key: 'link', type: 'url', label: 'Link', labelAr: 'رابط' },
        ],
        defaults: () => ({
            company: L(), position: L(), description: L(), responsibilities: LL(), location: L(), type: 'freelance',
            group: 'professional', startDate: '', endDate: '', current: false, technologies: LL(), images: [], logo: '', link: '',
        }),
    },
    education: {
        key: 'education',
        label: 'Education',
        labelAr: 'التعليم',
        singular: 'Education',
        description: 'Degrees shown on the Experience page and the credentials section.',
        listTitle: 'institution.en',
        listSubtitle: 'major.en',
        fields: [
            { key: 'institution', type: 'l10n', label: 'Institution', labelAr: 'المؤسسة', required: true },
            { key: 'degree', type: 'l10n', label: 'Degree', labelAr: 'الدرجة' },
            { key: 'major', type: 'l10n', label: 'Major', labelAr: 'التخصص' },
            { key: 'gpa', type: 'text', label: 'GPA', labelAr: 'المعدل', half: true },
            { key: 'current', type: 'boolean', label: 'Currently studying', labelAr: 'مستمر', half: true },
            { key: 'startDate', type: 'date', label: 'Start date', labelAr: 'تاريخ البداية', half: true },
            { key: 'endDate', type: 'date', label: 'End date', labelAr: 'تاريخ النهاية', half: true },
            { key: 'achievements', type: 'l10nList', label: 'Achievements', labelAr: 'الإنجازات' },
            { key: 'activities', type: 'l10nList', label: 'Activities', labelAr: 'الأنشطة' },
        ],
        defaults: () => ({
            institution: L(), degree: L(), major: L(), startDate: '', endDate: '', current: false, gpa: '',
            achievements: LL(), activities: LL(),
        }),
    },
    skills: {
        key: 'skills',
        label: 'Skills',
        labelAr: 'المهارات',
        singular: 'Skill',
        description: 'Skills, technologies and tools. Items with an icon and "Show in logo rows" appear in the scrolling logo rows.',
        listTitle: 'name.en',
        listSubtitle: 'category',
        listImage: 'icon',
        fields: [
            { key: 'name', type: 'l10n', label: 'Name', labelAr: 'الاسم', required: true },
            { key: 'category', type: 'select', label: 'Category', labelAr: 'التصنيف', options: SKILL_CATEGORIES, half: true },
            { key: 'showInStack', type: 'boolean', label: 'Show in logo rows', labelAr: 'إظهار في شريط الشعارات', half: true },
            { key: 'icon', type: 'image', label: 'Icon', labelAr: 'الأيقونة', accept: IMG, help: 'Upload a logo or paste a URL (e.g. from devicon).' },
            { key: 'iconInvertInDark', type: 'boolean', label: 'Invert icon in dark mode', labelAr: 'عكس الأيقونة في الوضع الداكن', help: 'For dark logos such as GitHub.' },
        ],
        defaults: () => ({ name: L(), category: 'other', icon: '', iconInvertInDark: false, showInStack: false }),
    },
    achievements: {
        key: 'achievements',
        label: 'Achievements',
        labelAr: 'الإنجازات',
        singular: 'Achievement',
        description: 'Certificates, awards, competitions and announcements.',
        listTitle: 'title.en',
        listSubtitle: 'organization.en',
        listImage: 'image',
        fields: [
            { key: 'title', type: 'l10n', label: 'Title', labelAr: 'العنوان', required: true },
            { key: 'organization', type: 'l10n', label: 'Organization', labelAr: 'الجهة' },
            { key: 'category', type: 'select', label: 'Category', labelAr: 'التصنيف', options: ACHIEVEMENT_CATEGORIES, half: true },
            { key: 'date', type: 'date', label: 'Date', labelAr: 'التاريخ', half: true },
            { key: 'description', type: 'l10nText', label: 'Description', labelAr: 'الوصف' },
            { key: 'image', type: 'image', label: 'Image', labelAr: 'الصورة', accept: IMG },
            { key: 'files', type: 'files', label: 'Supporting files', labelAr: 'ملفات داعمة', accept: `${IMG},${DOC}` },
            { key: 'link', type: 'url', label: 'Link', labelAr: 'رابط', half: true },
            { key: 'credentialId', type: 'text', label: 'Credential ID', labelAr: 'رقم الشهادة', half: true },
            { key: 'tags', type: 'l10nList', label: 'Tags', labelAr: 'وسوم' },
        ],
        defaults: () => ({
            title: L(), organization: L(), description: L(), category: 'certification', date: '', image: '', files: [],
            link: '', credentialId: '', tags: LL(),
        }),
    },
    research: {
        key: 'research',
        label: 'Research',
        labelAr: 'الأبحاث',
        singular: 'Research',
        description: 'Studies shown as books on the Research page and in the home page research index.',
        listTitle: 'title.en',
        listSubtitle: 'type.en',
        listImage: 'cover',
        fields: [
            { key: 'title', type: 'l10n', label: 'Title', labelAr: 'العنوان', required: true },
            { key: 'slug', type: 'slug', label: 'Slug', labelAr: 'المعرّف', required: true, half: true },
            { key: 'status', type: 'select', label: 'Status', labelAr: 'الحالة', half: true, options: [
                { value: 'completed', label: 'Completed' }, { value: 'in-progress', label: 'In progress' },
            ] },
            { key: 'type', type: 'l10n', label: 'Research type', labelAr: 'نوع البحث' },
            { key: 'context', type: 'l10n', label: 'Context / organization', labelAr: 'السياق / الجهة' },
            { key: 'date', type: 'l10n', label: 'Date (as displayed)', labelAr: 'التاريخ (كما يُعرض)' },
            { key: 'summary', type: 'l10nText', label: 'Description', labelAr: 'الوصف' },
            { key: 'file', type: 'l10nFile', label: 'Document (Word/PDF)', labelAr: 'المستند', accept: DOC },
            { key: 'fileLabel', type: 'l10n', label: 'Document link label', labelAr: 'نص رابط المستند' },
            { key: 'cover', type: 'image', label: 'Cover image (optional)', labelAr: 'صورة الغلاف', accept: IMG, help: 'Replaces the ring emblem on the book cover.' },
            { key: 'color', type: 'color', label: 'Book color', labelAr: 'لون الكتاب', half: true },
            { key: 'variant', type: 'select', label: 'Book style', labelAr: 'نمط الكتاب', half: true, options: [
                { value: 'stripe', label: 'Stripe' }, { value: 'simple', label: 'Simple' },
            ] },
            { key: 'links', type: 'links', label: 'External links', labelAr: 'روابط خارجية' },
        ],
        defaults: () => ({
            slug: '', title: L(), type: L(), context: L(), summary: L(), date: L(), status: 'completed', file: L(),
            fileLabel: { en: 'Full Study', ar: 'الدراسة الكاملة' }, cover: '', color: '#1E6B52', variant: 'stripe', links: [],
        }),
    },
    timeline: {
        key: 'timeline',
        label: 'Timeline & milestones',
        labelAr: 'المحطات',
        singular: 'Milestone',
        description: 'Milestones in the "Crafting Experiences" orbit on the Experience page, grouped by tab.',
        listTitle: 'title.en',
        listSubtitle: 'category',
        listImage: 'images.0',
        fields: [
            { key: 'title', type: 'l10n', label: 'Title', labelAr: 'العنوان', required: true },
            { key: 'category', type: 'select', label: 'Tab', labelAr: 'التبويب', half: true, options: [
                { value: 'education', label: 'Education' }, { value: 'journey', label: 'Journey' }, { value: 'experience', label: 'Experience' },
            ] },
            { key: 'date', type: 'date', label: 'Date', labelAr: 'التاريخ', half: true },
            { key: 'description', type: 'l10nText', label: 'Description', labelAr: 'الوصف' },
            { key: 'images', type: 'images', label: 'Images', labelAr: 'الصور', accept: IMG, help: 'The first image appears in the milestone card.' },
        ],
        defaults: () => ({ category: 'journey', title: L(), description: L(), date: '', images: [] }),
    },
    gallery: {
        key: 'gallery',
        label: 'Gallery',
        labelAr: 'المعرض',
        singular: 'Photo',
        description: 'Photos on the Gallery page and the home page "Moments & Milestones" zoom.',
        listTitle: 'title.en',
        listSubtitle: 'category.en',
        listImage: 'image',
        fields: [
            { key: 'image', type: 'image', label: 'Photo', labelAr: 'الصورة', accept: IMG, required: true },
            { key: 'title', type: 'l10n', label: 'Title', labelAr: 'العنوان' },
            { key: 'description', type: 'l10nText', label: 'Description', labelAr: 'الوصف' },
            { key: 'category', type: 'l10n', label: 'Category', labelAr: 'التصنيف' },
            { key: 'date', type: 'date', label: 'Date', labelAr: 'التاريخ', half: true },
            { key: 'showOnHome', type: 'boolean', label: 'Show on home page', labelAr: 'إظهار في الرئيسية', half: true },
            { key: 'slot', type: 'select', label: 'Home page position', labelAr: 'الموضع في الرئيسية', options: GALLERY_SLOTS, help: 'Where this photo sits in the home page zoom composition.' },
        ],
        defaults: () => ({ title: L(), description: L(), category: L(), date: '', image: '', slot: 'auto', showOnHome: true }),
    },
};

export const SINGLETONS: Record<SingletonKey, SingletonConfig> = {
    profile: {
        key: 'profile',
        label: 'Profile & contact',
        labelAr: 'الملف الشخصي والتواصل',
        description: 'Your name, titles, bio, photos, contact card, contact details and social links.',
        fields: [
            { key: 'name', type: 'l10n', label: 'Name', labelAr: 'الاسم', required: true },
            { key: 'title', type: 'l10n', label: 'Job title', labelAr: 'المسمّى الوظيفي' },
            { key: 'headline', type: 'l10n', label: 'Professional headline', labelAr: 'العنوان المهني' },
            { key: 'intro', type: 'l10nText', label: 'Short introduction', labelAr: 'نبذة قصيرة' },
            { key: 'bio', type: 'l10nText', label: 'Bio', labelAr: 'السيرة' },
            { key: 'location', type: 'l10n', label: 'Location', labelAr: 'الموقع' },
            { key: 'avatar', type: 'image', label: 'Profile image', labelAr: 'الصورة الشخصية', accept: IMG, help: 'Square photos work best. Used on the contact card and profile card.' },
            { key: 'heroImage', type: 'image', label: 'Large portrait', labelAr: 'الصورة الكبيرة', accept: IMG, help: 'Used in the home page identity section.' },
            { key: 'cardName', type: 'l10n', label: 'Contact card — name', labelAr: 'بطاقة التواصل — الاسم' },
            { key: 'cardRole', type: 'l10n', label: 'Contact card — role', labelAr: 'بطاقة التواصل — المسمّى' },
            { key: 'email', type: 'email', label: 'Email', labelAr: 'البريد الإلكتروني', half: true },
            { key: 'phone', type: 'text', label: 'Phone', labelAr: 'الجوال', half: true },
            { key: 'website', type: 'url', label: 'Website', labelAr: 'الموقع الإلكتروني' },
            { key: 'socialLinks', type: 'social', label: 'Social links', labelAr: 'روابط التواصل' },
            { key: 'languages', type: 'languages', label: 'Languages', labelAr: 'اللغات' },
            { key: 'gpaValue', type: 'number', label: 'GPA', labelAr: 'المعدل', half: true },
            { key: 'gpaScale', type: 'number', label: 'GPA scale', labelAr: 'من', half: true },
            { key: 'careerStartYear', type: 'number', label: 'Professional work since (year)', labelAr: 'بداية العمل المهني (سنة)', help: 'Used for the "years of experience" figure.' },
        ],
        defaults: () => ({
            name: L(), title: L(), headline: L(), intro: L(), bio: L(), location: L(), avatar: '', heroImage: '',
            cardName: { en: 'غيد عبد الكريم', ar: 'غيد عبد الكريم' }, cardRole: { en: 'AI Engineer', ar: 'AI Engineer' },
            email: '', phone: '', website: '', socialLinks: [], languages: [], gpaValue: 0, gpaScale: 4, careerStartYear: new Date().getFullYear(),
        }),
    },
    resume: {
        key: 'resume',
        label: 'CV / Resume',
        labelAr: 'السيرة الذاتية',
        description: 'The CV shown on /resume and linked from the site.',
        fields: [
            { key: 'url', type: 'file', label: 'CV file (PDF)', labelAr: 'ملف السيرة الذاتية', accept: 'application/pdf,.pdf' },
            { key: 'fileName', type: 'text', label: 'File name', labelAr: 'اسم الملف' },
        ],
        defaults: () => ({ url: '', fileName: '', updatedAt: '' }),
    },
};

/* ------------------------------------------------------------------ validation */

export class ValidationError extends Error {
    constructor(public field: string, message: string) {
        super(message);
    }
}

const MAX_TEXT = 20000;
const str = (v: unknown, max = MAX_TEXT) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max).trim();
const l10n = (v: unknown) => {
    const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    return { en: str(o.en), ar: str(o.ar) };
};
const list = (v: unknown, max = 200) => (Array.isArray(v) ? v : []).map((x) => str(x, 2000)).filter(Boolean).slice(0, max);

/** Accepts http(s) URLs, mailto:, and site-relative paths. Anything else becomes ''. */
export function cleanUrl(v: unknown): string {
    const s = str(v, 2048);
    if (!s) return '';
    if (s.startsWith('/') && !s.startsWith('//')) return s;
    if (/^mailto:/i.test(s)) return s;
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : '';
    } catch {
        return '';
    }
}

function cleanField(field: Field, value: unknown): unknown {
    switch (field.type) {
        case 'text':
            return str(value, 2000);
        case 'slug':
            return str(value, 120).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        case 'email':
            return str(value, 320);
        case 'url':
        case 'image':
        case 'file':
            return cleanUrl(value);
        case 'date': {
            const s = str(value, 10);
            return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
        }
        case 'number': {
            const n = Number(value);
            return Number.isFinite(n) ? n : 0;
        }
        case 'boolean':
            return value === true || value === 'true' || value === 'on';
        case 'color': {
            const s = str(value, 9);
            return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : '#1E6B52';
        }
        case 'select': {
            const s = str(value, 60);
            return field.options?.some((o) => o.value === s) ? s : field.options?.[0]?.value ?? '';
        }
        case 'l10n':
        case 'l10nText':
            return l10n(value);
        case 'l10nFile': {
            const o = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
            return { en: cleanUrl(o.en), ar: cleanUrl(o.ar) };
        }
        case 'l10nList': {
            const o = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
            return { en: list(o.en), ar: list(o.ar) };
        }
        case 'tags':
            return [...new Set(list(value, 100))];
        case 'images':
        case 'files':
            return (Array.isArray(value) ? value : []).map(cleanUrl).filter(Boolean).slice(0, 60);
        case 'links':
            return (Array.isArray(value) ? value : [])
                .map((x) => ({ label: l10n((x as Record<string, unknown>)?.label), url: cleanUrl((x as Record<string, unknown>)?.url) }))
                .filter((x) => x.url)
                .slice(0, 30);
        case 'challenges':
            return (Array.isArray(value) ? value : [])
                .map((x) => ({ problem: l10n((x as Record<string, unknown>)?.problem), solution: l10n((x as Record<string, unknown>)?.solution) }))
                .filter((x) => x.problem.en || x.problem.ar || x.solution.en || x.solution.ar)
                .slice(0, 30);
        case 'social':
            return (Array.isArray(value) ? value : [])
                .map((x) => {
                    const o = (x ?? {}) as Record<string, unknown>;
                    return { platform: str(o.platform, 60), url: cleanUrl(o.url), username: str(o.username, 120) };
                })
                .filter((x) => x.platform && x.url)
                .slice(0, 30);
        case 'languages':
            return (Array.isArray(value) ? value : [])
                .map((x) => ({ name: l10n((x as Record<string, unknown>)?.name), level: l10n((x as Record<string, unknown>)?.level) }))
                .filter((x) => x.name.en || x.name.ar)
                .slice(0, 20);
    }
}

function isEmpty(field: Field, v: unknown): boolean {
    if (v == null || v === '') return true;
    if (field.type === 'l10n' || field.type === 'l10nText') {
        const o = v as { en: string; ar: string };
        return !o.en && !o.ar;
    }
    return false;
}

/**
 * Coerces untrusted form input into the stored shape: unknown keys are dropped,
 * every field is type-checked, URLs are restricted to http(s)/relative, and
 * required fields are enforced.
 */
export function sanitize(fields: Field[], input: unknown, defaults: Record<string, unknown>): Record<string, unknown> {
    const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
    const out: Record<string, unknown> = { ...defaults };
    for (const field of fields) {
        const value = cleanField(field, src[field.key] ?? defaults[field.key]);
        if (field.required && isEmpty(field, value)) {
            throw new ValidationError(field.key, `${field.label} is required.`);
        }
        out[field.key] = value;
    }
    return out;
}

/** Reads a dotted path such as "name.en" or "images.0". */
export function getPath(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), obj);
}
