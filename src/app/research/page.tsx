'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Book } from '@/components/ui/book';
import { useLocalizedResearch } from '@/hooks/useLocalizedResearch';

export default function ResearchPage() {
    const research = useLocalizedResearch();
    const t = useTranslations('research');
    const isArabic = useLocale() === 'ar';

    return (
        <>
            <main className="min-h-screen px-5 sm:px-6 pt-28 md:pt-32 pb-24 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14 md:mb-20"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{t('pageTitle')}</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
                        {t('pageSubtitle')}
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-20">
                    {research.map((item, i) => (
                        <motion.article
                            key={item.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="group flex flex-col items-center text-center"
                        >
                            <a
                                href={item.fileUrl || undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${item.title} — ${item.fileLabel}`}
                                className="relative mb-8 block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2"
                            >
                                <Book
                                    title={item.title}
                                    eyebrow={item.date.match(/\d{4}|[٠-٩]{4}/)?.[0]}
                                    cover={item.cover}
                                    color={item.color}
                                    variant={item.variant}
                                    textured
                                    width={{ sm: 160, md: 180, lg: 200 }}
                                />
                                {/* Ground shadow — tightens as the book lifts */}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute -bottom-5 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-[100%] bg-black/25 blur-md transition-all duration-500 group-hover:w-[65%] group-hover:opacity-60 dark:bg-black/70"
                                />
                            </a>

                            <div className="flex w-full max-w-xs flex-col items-center">
                                <h3 className="text-xl font-black leading-tight">{item.title}</h3>
                                {item.status === 'in-progress' && (
                                    <span className="mt-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                        {t('inProgress')}
                                    </span>
                                )}
                                {!isArabic && (
                                    <p dir="rtl" className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">{item.titleAr}</p>
                                )}
                                <span className="mt-3 h-0.5 w-8 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
                                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    {item.subtitle}
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-500">
                                    {item.context} · {item.date}
                                </p>

                                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    {item.summary}
                                </p>

                                {item.links.filter((link) => /\.(mp4|webm)(\?|$)/i.test(link.url)).map((link) => (
                                    <figure key={link.url} className="mt-5 w-full overflow-hidden rounded-xl border border-neutral-200 bg-black dark:border-neutral-800">
                                        <video controls playsInline preload="none" poster={item.id === 'bayan' ? '/research/bayan-video-poster.png' : undefined} aria-label={link.label} className="aspect-video w-full object-contain">
                                            <source src={link.url} type={/\.webm(\?|$)/i.test(link.url) ? 'video/webm' : 'video/mp4'} />
                                            <a href={link.url}>{link.label}</a>
                                        </video>
                                        <figcaption className="bg-background px-3 py-2 text-xs text-muted-foreground">{link.label}</figcaption>
                                    </figure>
                                ))}

                                {item.fileUrl && <Link
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-600 transition-colors hover:border-neutral-400 hover:text-foreground dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600"
                                >
                                    {item.fileLabel}
                                    <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                                </Link>}
                                {item.links.length > 0 && (
                                    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
                                        {item.links.map((l) => (
                                            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-neutral-500 underline-offset-4 hover:text-foreground hover:underline dark:text-neutral-400">
                                                {l.label}
                                                <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.article>
                    ))}
                </div>
            </main>
        </>
    );
}
