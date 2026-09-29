'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { portfolioData } from '@/data/portfolio';
import { cn } from '@/lib/utils';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';

export default function GalleryPage() {
    const tA11y = useTranslations('a11y');
    // Shadows the module import so this component reads translated copy.
    const portfolioData = useLocalizedPortfolio();

    const t = useTranslations('gallery');
    const items = portfolioData.gallery;

    const categories = useMemo(() => {
        const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean))) as string[];
        return ['all', ...unique];
    }, [items]);

    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const visibleItems = useMemo(
        () => (activeCategory === 'all' ? items : items.filter((item) => item.category === activeCategory)),
        [items, activeCategory]
    );

    const close = useCallback(() => setLightboxIndex(null), []);
    const next = useCallback(
        () => setLightboxIndex((i) => (i === null ? i : (i + 1) % visibleItems.length)),
        [visibleItems.length]
    );
    const prev = useCallback(
        () => setLightboxIndex((i) => (i === null ? i : (i - 1 + visibleItems.length) % visibleItems.length)),
        [visibleItems.length]
    );

    useEffect(() => {
        if (lightboxIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightboxIndex, close, next, prev]);

    const active = lightboxIndex === null ? null : visibleItems[lightboxIndex];

    return (
        <main className="min-h-screen px-5 sm:px-6 pt-28 md:pt-32 pb-24 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <h1 className="text-4xl md:text-5xl font-black mb-4">{t('title')}</h1>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
                    {t('subtitle')}
                </p>
            </motion.div>

            {categories.length > 2 && (
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setLightboxIndex(null);
                            }}
                            className={cn(
                                'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border',
                                activeCategory === category
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:border-foreground'
                            )}
                        >
                            {category === 'all' ? t('filter.all') : category}
                        </button>
                    ))}
                </div>
            )}

            {/* Wrapping row, centred: an incomplete last row sits in the middle instead
                of leaving a single photo stranded on the left. */}
            <div className="flex flex-wrap justify-center gap-6">
                {visibleItems.map((item, i) => (
                    <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
                            <Image
                                src={item.url}
                                alt={item.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                            />
                        </div>
                        <h3 className="mt-4 font-bold text-sm">{item.title}</h3>
                        {item.description && (
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                {item.description}
                            </p>
                        )}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-16 backdrop-blur-sm sm:px-16"
                        onClick={close}
                    >
                        <button
                            onClick={close}
                            aria-label={tA11y('close')}
                            className="absolute top-6 end-6 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {visibleItems.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prev();
                                    }}
                                    aria-label={tA11y('previous')}
                                    className="absolute start-4 p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        next();
                                    }}
                                    aria-label={tA11y('next')}
                                    className="absolute end-4 p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                                </button>
                            </>
                        )}

                        <motion.div
                            key={active.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex h-full w-full max-w-4xl flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/*
                              Height-led, not aspect-led. A fixed `aspect-[3/2]` box on a
                              full-width element was taller than the screen on short and
                              narrow viewports, which pushed the caption out of view and
                              cropped the image. `min-h-0` lets this flex child shrink, and
                              `object-contain` keeps the whole photo visible at any size.
                            */}
                            <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl">
                                <Image
                                    src={active.url}
                                    alt={active.title}
                                    fill
                                    sizes="(max-width: 768px) 92vw, 896px"
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="mt-4 shrink-0 text-center">
                                <h2 className="text-white font-bold">{active.title}</h2>
                                {active.description && (
                                    <p className="mt-1 text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
                                        {active.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
