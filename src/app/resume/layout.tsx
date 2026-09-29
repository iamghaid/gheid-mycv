import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

/**
 * Resolved per request so the browser tab title and share description follow the
 * reader's language, rather than being fixed English strings.
 */
export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('meta');
    return {
        title: t('resumeTitle'),
        description: t('resumeDesc'),
    };
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
    return children;
}
