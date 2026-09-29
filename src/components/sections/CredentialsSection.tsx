'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Languages as LanguagesIcon, Award } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { formatDate } from '@/lib/utils';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';

/**
 * Education and spoken languages.
 *
 * Both were already in the portfolio data but had nowhere on the site that
 * displayed them, so degree, GPA, honours and language levels were invisible.
 */
export default function CredentialsSection() {
    const locale = useLocale();
    // Shadows the module import so this component reads translated copy.
    const portfolioData = useLocalizedPortfolio();

    const t = useTranslations('credentials');
    const { education, personal } = portfolioData;
    const languages = personal.languages ?? [];

    return (
        <section className="relative bg-background py-20 md:py-28">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                        {t('label')}
                    </span>
                    <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                        {t('title')}
                    </h2>
                </motion.div>

                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Education — spans two columns on wide screens, full width below */}
                    <div className="lg:col-span-2 space-y-5">
                        {education.map((edu, i) => (
                            <motion.article
                                key={edu.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.45, delay: i * 0.05 }}
                                className="rounded-2xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-7"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 shrink-0 rounded-xl border border-black/10 bg-black/[0.03] p-2.5 dark:border-white/10 dark:bg-white/5">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold leading-tight sm:text-xl">
                                            {edu.institution}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {edu.degree}
                                            {edu.major ? ` — ${edu.major}` : ''}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                                            <span className="font-mono">
                                                {formatDate(edu.startDate, locale)}
                                                {' — '}
                                                {edu.isOngoing ? t('present') : edu.endDate ? formatDate(edu.endDate, locale) : ''}
                                            </span>
                                            {edu.gpa && (
                                                <span className="rounded-full border border-black/10 px-2.5 py-1 font-semibold text-foreground dark:border-white/15">
                                                    {t('gpa')} <span dir="ltr">{edu.gpa}</span>
                                                </span>
                                            )}
                                        </div>

                                        {edu.achievements && edu.achievements.length > 0 && (
                                            <ul className="mt-4 space-y-2">
                                                {edu.achievements.map((achievement) => (
                                                    <li
                                                        key={achievement}
                                                        className="flex items-start gap-2 text-sm text-muted-foreground"
                                                    >
                                                        <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                                                        <span>{achievement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {edu.activities && edu.activities.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {edu.activities.map((activity) => (
                                                    <span
                                                        key={activity}
                                                        className="rounded-full bg-black/[0.04] px-3 py-1 text-xs text-muted-foreground dark:bg-white/[0.06]"
                                                    >
                                                        {activity}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Languages */}
                    {languages.length > 0 && (
                        <motion.aside
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: 0.1 }}
                            className="rounded-2xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-7"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-black/10 bg-black/[0.03] p-2.5 dark:border-white/10 dark:bg-white/5">
                                    <LanguagesIcon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold">{t('languages')}</h3>
                            </div>

                            <ul className="mt-5 space-y-4">
                                {languages.map((language) => (
                                    <li
                                        key={language.name}
                                        className="flex items-baseline justify-between gap-3 border-b border-black/5 pb-3 last:border-0 last:pb-0 dark:border-white/5"
                                    >
                                        <span className="font-semibold">{language.name}</span>
                                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {language.level}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.aside>
                    )}
                </div>
            </div>
        </section>
    );
}
