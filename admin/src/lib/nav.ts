export const NAV: { href: string; label: string; labelAr: string; group: string }[] = [
    { href: '/', label: 'Overview', labelAr: 'نظرة عامة', group: 'General' },
    { href: '/profile', label: 'Profile & contact', labelAr: 'الملف والتواصل', group: 'General' },
    { href: '/resume', label: 'CV / Resume', labelAr: 'السيرة الذاتية', group: 'General' },
    { href: '/projects', label: 'Projects', labelAr: 'المشاريع', group: 'Content' },
    { href: '/experience', label: 'Experience', labelAr: 'الخبرة', group: 'Content' },
    { href: '/education', label: 'Education', labelAr: 'التعليم', group: 'Content' },
    { href: '/skills', label: 'Skills', labelAr: 'المهارات', group: 'Content' },
    { href: '/achievements', label: 'Achievements', labelAr: 'الإنجازات', group: 'Content' },
    { href: '/research', label: 'Research', labelAr: 'الأبحاث', group: 'Content' },
    { href: '/timeline', label: 'Timeline & milestones', labelAr: 'المحطات', group: 'Content' },
    { href: '/gallery', label: 'Gallery', labelAr: 'المعرض', group: 'Content' },
    { href: '/media', label: 'Media library', labelAr: 'مكتبة الوسائط', group: 'Files' },
    { href: '/trash', label: 'Trash', labelAr: 'سلة المحذوفات', group: 'Files' },
];

/** Public portfolio origin — used to preview files that ship with the portfolio (e.g. /certificate/x.jpg). */
export const PORTFOLIO_URL = (process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://localhost:3000').replace(/\/$/, '');

export function previewUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('/') ? `${PORTFOLIO_URL}${url}` : url;
}
