'use client';

import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import type { SiteContent } from '@shared/content/types';
import { buildView, type Locale, type SiteView } from '@/lib/content/view';

const ContentContext = createContext<SiteContent | null>(null);

/** How often an open page checks whether the content changed in the admin. */
const POLL_MS = 20_000;

/**
 * Supplies the database content to every component, and keeps an open page current.
 *
 * The root layout fetches the content on the server (see lib/content/server.ts) and
 * passes it here. While a visitor has the page open, it polls a one-number version
 * endpoint; when an admin save bumps the version, `router.refresh()` re-renders the
 * server components with the new content — in place, without a reload and without
 * resetting client state or animations.
 */
export function ContentProvider({ content, children }: { content: SiteContent; children: React.ReactNode }) {
    const router = useRouter();
    const version = useRef(content.version);
    version.current = content.version;

    useEffect(() => {
        if (!content.version) return; // bundled fallback: no database to watch
        let stopped = false;
        const check = async () => {
            if (document.visibilityState !== 'visible') return;
            try {
                const res = await fetch('/api/content-version', { cache: 'no-store' });
                if (!res.ok) return;
                const { version: latest } = (await res.json()) as { version: number };
                if (!stopped && latest > version.current) router.refresh();
            } catch {
                /* offline — try again later */
            }
        };
        const id = window.setInterval(check, POLL_MS);
        document.addEventListener('visibilitychange', check);
        return () => {
            stopped = true;
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', check);
        };
    }, [router, content.version]);

    return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
    const content = useContext(ContentContext);
    if (!content) throw new Error('useSiteContent must be used inside <ContentProvider>.');
    return content;
}

/** The whole site view in the reader's language. */
export function useSiteView(): SiteView {
    const content = useSiteContent();
    const locale = (useLocale() === 'ar' ? 'ar' : 'en') as Locale;
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === 'light' ? 'light' : 'dark';
    return useMemo(() => buildView(content, locale, theme), [content, locale, theme]);
}

/** The English view, for code that matches on canonical English names. */
export function useBaseView(): SiteView {
    const content = useSiteContent();
    return useMemo(() => buildView(content, 'en'), [content]);
}
