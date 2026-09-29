'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useLocalizedResearch } from '@/hooks/useLocalizedResearch';

/**
 * Compact index of the studies on the home page.
 *
 * The full write-ups live on /research; this is the pointer to them, so the work
 * is visible from the landing page instead of only being reachable through the menu.
 */
export default function ResearchSection() {
    const t = useTranslations('research');
    const research = useLocalizedResearch();
    const isArabic = useLocale() === 'ar';

    return (
        <section className="relative bg-background py-20 md:py-28">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                            {t('label')}
                        </span>
                        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                            {t('title')}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                            {t('subtitle')}
                        </p>
                    </div>

                    <Link
                        href="/research"
                        className="group inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t('viewAll')}
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {research.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.05 }}
                        >
                            <Link
                                href="/research"
                                className="group flex h-full flex-col rounded-2xl border border-black/10 bg-white/60 p-5 transition-colors hover:border-black/25 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"
                            >
                                <span
                                    className="mb-4 h-1 w-10 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                    aria-hidden
                                />
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-lg font-bold">{item.title}</h3>
                                    {!isArabic && (
                                        <span className="text-sm text-muted-foreground" dir="rtl">
                                            {item.titleAr}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                                    {item.subtitle}
                                </p>
                                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                                    {item.summary}
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
                                    {item.fileLabel}
                                    <ArrowUpRight className="h-3 w-3" />
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
