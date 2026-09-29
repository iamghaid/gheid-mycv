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
            <main className="min-h-screen px-6 pt-32 pb-24 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{t('pageTitle')}</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
                        {t('pageSubtitle')}
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {research.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            className="group flex flex-col items-center text-center"
                        >
                            <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="mb-6">
                                <Book
                                    title={item.title}
                                    color={item.color}
                                    variant={item.variant}
                                    textured
                                    width={{ sm: 150, md: 190, lg: 210 }}
                                />
                            </Link>

                            <h3 className="font-black text-lg">{item.title}</h3>
                            {!isArabic && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{item.titleAr}</p>
                            )}
                            <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500 mb-1">
                                {item.subtitle}
                            </p>
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mb-4">
                                {item.context} · {item.date}
                            </p>

                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 max-w-xs">
                                {item.summary}
                            </p>

                            <Link
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
                            >
                                {item.fileLabel}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
        </>
    );
}
