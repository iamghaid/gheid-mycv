'use client';

import { cn } from '@/lib/utils';
import { getProjectCover } from '@/lib/projectCover';

interface ProjectPlaceholderProps {
    className?: string;
    title?: string;
    slug?: string;
    category?: string;
}

/**
 * Cover art for a project that has no photograph yet.
 *
 * This used to fetch a random picsum.photos image, which meant every project
 * without a screenshot showed an unrelated stock photo that changed on reload.
 * The cover is now generated from the project's own slug/title/category, so it
 * is stable, offline, and visually part of the site rather than noise.
 */
export function getPlaceholderImageUrl(title: string, slug?: string, category?: string) {
    return getProjectCover({ slug: slug || title, title, category });
}

export function ProjectPlaceholder({
    className,
    title = 'Untitled project',
    slug,
    category,
}: ProjectPlaceholderProps) {
    // Deterministic, so it renders identically on the server and the client —
    // no mounted flag or hydration guard needed.
    const imageUrl = getProjectCover({ slug: slug || title, title, category });

    return (
        <div className={cn('relative w-full h-full overflow-hidden', className)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- inline data: URI, nothing for the optimizer to do */}
            <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/5 dark:bg-black/30 transition-colors duration-500 pointer-events-none" />
        </div>
    );
}
