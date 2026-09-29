'use client';

import Image from 'next/image';
import { Mail, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';
import { cn } from '@/lib/utils';

/**
 * Static identity card shown where the interactive 3D lanyard can't run — on phones
 * and tablets, or if the WebGL card fails to load.
 *
 * Layout notes, because both were reported as wrong:
 *
 * - **Sizing is height-led.** The card takes whatever height its column gives it and
 *   derives its width from the aspect ratio, so it can never be taller than the
 *   column and can never be cropped along the top edge. A fixed aspect box inside a
 *   fixed-height column, which is what this replaced, overflowed on short viewports.
 *
 * - **The photo is the flexible element, the text is fixed.** The portrait is
 *   `flex-1 min-h-0`, so it absorbs every pixel the text block doesn't need. An
 *   earlier version gave the photo a fixed `38%` of the card width, which left it
 *   small on every screen and wasted the space underneath. Now a taller card means a
 *   bigger photo, automatically, with no breakpoint to maintain.
 */
export function IdentityCard({ className }: { className?: string }) {
    const { personal } = useLocalizedPortfolio();
    const t = useTranslations('contact.card');

    return (
        <div className={cn('flex h-full w-full items-center justify-center p-3 sm:p-4', className)}>
            <div
                className={cn(
                    'relative flex h-full max-h-[620px] w-auto max-w-full flex-col overflow-hidden',
                    'aspect-[3/4] rounded-3xl border border-black/10 dark:border-white/15',
                    'bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl',
                    'shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]'
                )}
            >
                {/* Lanyard slot, echoing the 3D card this stands in for */}
                <div className="flex shrink-0 justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-black/15 dark:bg-white/20" />
                </div>

                {/* Portrait — takes all the height the text below doesn't claim. */}
                <div className="relative mx-3 mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5">
                    <Image
                        src={personal.avatar}
                        alt={personal.name}
                        fill
                        sizes="(max-width: 640px) 70vw, 420px"
                        className="object-cover object-top"
                        priority
                    />
                </div>

                {/* Details — intrinsically sized, so it never squeezes the portrait out. */}
                <div className="shrink-0 px-4 pb-3 pt-3 text-center">
                    <p className="truncate text-[clamp(0.95rem,1.6vh,1.25rem)] font-black leading-tight">
                        {personal.name}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[clamp(0.65rem,1.1vh,0.8rem)] leading-snug text-primary">
                        {personal.title}
                    </p>

                    <div className="mt-2 space-y-1 text-[clamp(0.6rem,1vh,0.72rem)] text-muted-foreground">
                        <p className="flex items-center justify-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{personal.location}</span>
                        </p>
                        <a
                            href={`mailto:${personal.email}`}
                            className="flex items-center justify-center gap-1.5 transition-colors hover:text-foreground"
                        >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span dir="ltr" className="truncate">{personal.email}</span>
                        </a>
                    </div>
                </div>

                <div className="shrink-0 border-t border-black/10 px-4 py-2 text-center dark:border-white/10">
                    <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70">
                        {t('label')}
                    </p>
                </div>
            </div>
        </div>
    );
}
