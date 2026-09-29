"use client";

import React from "react";
import { motion } from "framer-motion";
import { ZoomParallax } from "@/components/ui/zoom-parallax";
import { portfolioData } from "@/data/portfolio";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';
import { useTranslations } from 'next-intl';

export default function StatsSection({ scrollYProgress, showOnly }: { scrollYProgress?: any, showOnly?: 'top' | 'bottom' }) {
    const tStats = useTranslations('statsSection');
    // Shadows the module import so this component reads translated copy.
    const portfolioData = useLocalizedPortfolio();

    // Deliberately in the authored order, not shuffled. A random sort ran on every
    // mount, so the same visitor saw a different arrangement each time and the
    // strongest photo was rarely the one in the centre slot.
    const images = React.useMemo(
        () => portfolioData.gallery.map((g) => ({ src: g.url, alt: g.title })),
        [portfolioData]
    );

    if (images.length === 0) return null;

    return (
        <section className="relative z-20 bg-background overflow-visible flex flex-col items-center transition-colors duration-500">
            {/* Header for the Gallery Section */}
            {(showOnly === 'top' || !showOnly) && (
                <>
                    <div className="max-w-6xl mx-auto px-6 w-full pt-32 pb-16 text-center space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
                        >
                            {tStats('momentsTitle')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground/80 text-lg md:text-xl font-medium max-w-2xl mx-auto"
                        >
                            {tStats('momentsSubtitle')}
                        </motion.p>
                    </div>

                    {/* Immersive Zoom Parallax Component */}
                    <div className="w-full">
                        <ZoomParallax images={images}>
                            <Link
                                href="/achievements"
                                className="group flex items-center gap-3 px-6 py-3.5 bg-foreground text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl border border-border/10"
                            >
                                {tStats('viewGallery')}
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Link>
                        </ZoomParallax>
                    </div>
                </>
            )}
        </section>
    );
}
