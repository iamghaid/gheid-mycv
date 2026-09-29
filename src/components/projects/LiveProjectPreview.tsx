'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, Monitor, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { ProjectPlaceholder } from './ProjectPlaceholder';

type State = 'checking' | 'embed' | 'fallback';
const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;

/**
 * The project's real website, inside the page.
 *
 * The server first checks whether the site allows framing (see /api/embed-check).
 * If it does, the site is shown in a browser-style frame: "desktop" renders it at a
 * true 1280px width scaled down to fit, "mobile" at phone width, both scrollable.
 * If it does not (X-Frame-Options / CSP), we respect that and show the screenshot
 * with an "Open live project" button instead.
 */
export function LiveProjectPreview({ project, onOpenImage }: { project: Project; onOpenImage?: (src: string) => void }) {
    const t = useTranslations('projectDetail');
    const [state, setState] = useState<State>('checking');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [loaded, setLoaded] = useState(false);
    const frame = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const url = project.demoUrl!;

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/embed-check?slug=${encodeURIComponent(project.slug)}`)
            .then((r) => (r.ok ? r.json() : { embeddable: false }))
            .then((v: { embeddable: boolean }) => !cancelled && setState(v.embeddable ? 'embed' : 'fallback'))
            .catch(() => !cancelled && setState('fallback'));
        return () => { cancelled = true; };
    }, [project.slug, url]);

    useEffect(() => {
        const el = frame.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, [state]);

    // On narrow screens "desktop" would be unreadably small; start on mobile there.
    useEffect(() => {
        if (window.innerWidth < 640) setDevice('mobile');
    }, []);

    const scale = device === 'desktop' && width ? Math.min(1, width / DESKTOP_WIDTH) : 1;
    const frameHeight = device === 'desktop' ? Math.max(360, Math.round((width || 900) * 0.58)) : 640;

    const openButton = (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03] active:scale-[0.98]">
            {t('openLive')} <ExternalLink className="h-4 w-4 rtl:-scale-x-100" />
        </a>
    );

    if (state !== 'embed') {
        return (
            <div className="space-y-4">
                <div
                    className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-black/15 bg-secondary/5 shadow-2xl dark:border-border/40 md:aspect-[2/1]"
                    onClick={() => project.image && onOpenImage?.(project.image)}
                >
                    {project.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.image} alt={project.title} className="h-full w-full cursor-zoom-in object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                        <ProjectPlaceholder className="rounded-none border-0 bg-transparent pb-0 [&>div.z-10]:scale-125" title={project.title} slug={project.slug} category={project.category} />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    {state === 'checking' && (
                        <span className="absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('checkingLive')}
                        </span>
                    )}
                </div>
                {state === 'fallback' && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{t('embedBlocked')}</p>
                        {openButton}
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-border/60 bg-secondary/30 p-1" role="group" aria-label={t('livePreview')}>
                    {(['desktop', 'mobile'] as const).map((d) => (
                        <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d}
                            className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                                device === d ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                            {d === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                            {t(d)}
                        </button>
                    ))}
                </div>
                {openButton}
            </div>

            <div className="overflow-hidden rounded-3xl border border-black/15 bg-neutral-100 shadow-2xl dark:border-border/40 dark:bg-neutral-900">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b border-black/10 px-4 py-2.5 dark:border-white/10">
                    <div className="flex gap-1.5" aria-hidden>
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div dir="ltr" className="min-w-0 flex-1 truncate rounded-md bg-white/70 px-3 py-1 text-center text-xs text-neutral-500 dark:bg-white/5 dark:text-neutral-400">
                        {url.replace(/^https?:\/\//, '')}
                    </div>
                </div>

                <div ref={frame} className="relative flex justify-center bg-neutral-200/60 dark:bg-black" style={{ height: frameHeight }}>
                    {!loaded && (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="me-2 h-4 w-4 animate-spin" /> {t('loadingLive')}
                        </div>
                    )}
                    {device === 'desktop' ? (
                        <iframe
                            key="desktop"
                            src={url}
                            title={project.title}
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                            onLoad={() => setLoaded(true)}
                            className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                            style={{ width: DESKTOP_WIDTH, height: frameHeight / scale, transform: `scale(${scale})` }}
                        />
                    ) : (
                        <div className="my-4 overflow-hidden rounded-[2rem] border-[6px] border-neutral-900 bg-white shadow-xl dark:border-neutral-700" style={{ width: MOBILE_WIDTH + 12, height: frameHeight - 32 }}>
                            <iframe
                                key="mobile"
                                src={url}
                                title={project.title}
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                                onLoad={() => setLoaded(true)}
                                className="h-full w-full border-0"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
