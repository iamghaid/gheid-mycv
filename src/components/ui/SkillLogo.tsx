'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SkillLogo({ src, name, invertInDark, className }: {
    src?: string; name: string; invertInDark?: boolean; className?: string;
}) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const fallback = !src || failedSrc === src;
    return <img src={fallback ? '/skill-logos/skill.svg' : src} alt={name}
        className={cn('h-full w-full object-contain', !fallback && invertInDark && 'dark:invert', className)}
        loading="lazy" decoding="async" onError={() => { if (!fallback) setFailedSrc(src!); }} />;
}
