'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';
import { useSiteView } from '@/providers/ContentProvider';
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
 * - **The photo is a centred square.** It sits in the flexible middle row and keeps
 *   a 1:1 box, so it is never stretched and never cropped off-centre; on a short
 *   card it simply scales down. The name and role sit directly under it.
 */
export function IdentityCard({ className }: { className?: string }) {
    const { personal } = useLocalizedPortfolio();
    const t = useTranslations('contact.card');
    // Name, role and photo are edited in the admin (Profile → Contact card).
    const card = useSiteView().card;

    return (
        <div className={cn('flex h-full w-full items-center justify-center p-3 sm:p-4', className)}>
            <div
                className={cn(
                    'relative flex h-full max-h-[600px] w-auto max-w-full flex-col overflow-hidden',
                    'aspect-[5/7] rounded-3xl border border-black/10 dark:border-white/15',
                    'bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl',
                    'shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]'
                )}
            >
                {/* Accent strip + lanyard slot, echoing the 3D card this stands in for */}
                <div className="h-1.5 w-full shrink-0 bg-[#1E6B52]" />
                <div className="flex shrink-0 justify-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-black/15 dark:bg-white/20" />
                </div>

                {/* Square portrait, centred. The whole photo is shown (it is square), so
                    nothing is stretched or cut; it shrinks only if the card is short. */}
                <div className="flex min-h-0 flex-1 items-center justify-center px-[9%] pt-3">
                    <div className="relative aspect-square h-auto max-h-full w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5">
                        <Image
                            src={card.avatar || personal.avatar}
                            alt={card.name}
                            fill
                            sizes="(max-width: 640px) 80vw, 380px"
                            className="object-cover object-center"
                            priority
                        />
                    </div>
                </div>

                {/* Name and role, directly under the photo */}
                <div className="shrink-0 px-4 pb-4 pt-4 text-center">
                    <p dir="rtl" className="text-[clamp(1.1rem,2.2vh,1.5rem)] font-black leading-snug">
                        {card.name}
                    </p>
                    <p dir="ltr" className="mt-1 text-[clamp(0.75rem,1.4vh,0.95rem)] font-semibold tracking-wide text-[#1E6B52] dark:text-[#8FD3B6]">
                        {card.role}
                    </p>
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-[clamp(0.62rem,1.1vh,0.75rem)] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{personal.location}</span>
                    </p>
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
