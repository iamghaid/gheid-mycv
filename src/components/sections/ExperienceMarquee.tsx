import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
} from "framer-motion";
import Image from "next/image";
import { Experience } from "@/types";
import { usePerformance } from "@/hooks/usePerformance";
import { cn } from "@/lib/utils";

interface ParallaxProps {
    children: React.ReactNode;
    baseVelocity: number;
    isLowPowerMode?: boolean;
}

function ParallaxText({ children, baseVelocity = 100, isLowPowerMode = false }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);

    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });

    // Always positive acceleration factor — direction is handled separately
    const velocityFactor = useTransform(smoothVelocity, (latest) => {
        return (Math.abs(latest) / 1000) * 5;
    });

    // Measure actual pixel width of one content copy
    const measure = useCallback(() => {
        if (contentRef.current) {
            setContentWidth(contentRef.current.scrollWidth);
        }
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener("resize", measure);
        // Re-measure after images may have loaded
        const t1 = setTimeout(measure, 300);
        const t2 = setTimeout(measure, 1000);
        return () => {
            window.removeEventListener("resize", measure);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [measure]);

    /**
     * Pixel-based transform with modulo wrapping.
     *
     * baseX accumulates upward continuously. The transform converts it
     * to a translateX value that cycles seamlessly over one content width.
     *
     * - baseVelocity > 0 (row1): logos move LEFT → RIGHT
     *   translateX cycles: -contentWidth → 0 → -contentWidth → 0 ...
     *
     * - baseVelocity < 0 (row2): logos move RIGHT → LEFT
     *   translateX cycles: 0 → -contentWidth → 0 → -contentWidth ...
     */
    const x = useTransform(baseX, (v) => {
        if (contentWidth <= 0) return "0px";
        const mod = ((v % contentWidth) + contentWidth) % contentWidth;

        if (baseVelocity > 0) {
            // Left-to-right: start at -contentWidth, move toward 0
            return `${-contentWidth + mod}px`;
        } else {
            // Right-to-left: start at 0, move toward -contentWidth
            return `${-mod}px`;
        }
    });

    const isHovered = useRef(false);

    useAnimationFrame((_t, delta) => {
        if (isHovered.current || isLowPowerMode) return;

        // Clamp delta to prevent large jumps when returning from background tab
        const clampedDelta = Math.min(delta, 50);

        let moveBy = Math.abs(baseVelocity) * (clampedDelta / 1000);

        const vf = velocityFactor.get();
        if (vf > 0) {
            moveBy += moveBy * vf;
        }

        // Always accumulate forward — direction is handled in the transform
        baseX.set(baseX.get() + moveBy);
    });

    if (isLowPowerMode) {
        return (
            <div className="overflow-hidden whitespace-nowrap w-full py-1">
                <div
                    className={cn(
                        "flex",
                        baseVelocity > 0
                            ? "animate-marquee-reverse"
                            : "animate-marquee"
                    )}
                >
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="overflow-hidden whitespace-nowrap w-full py-1"
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
        >
            <motion.div
                className="flex"
                style={{ x, willChange: "transform" }}
            >
                {/* First copy — ref attached for measuring pixel width */}
                <div ref={contentRef} className="flex gap-4 shrink-0 pr-4">
                    {children}
                </div>
                <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                <div className="flex gap-4 shrink-0 pr-4">{children}</div>
            </motion.div>
        </div>
    );
}

type Org = {
    /** Display name — always rendered when no logo file is present. */
    name: string;
    /** Optional logo dropped into /public/assets. Falls back to the name if missing. */
    logo?: string;
    /** Set for logos that are dark artwork on a transparent background. */
    invertInDark?: boolean;
};

const GalleryItem = ({ org }: { org: Org }) => {
    const [logoFailed, setLogoFailed] = useState(false);
    const showLogo = Boolean(org.logo) && !logoFailed;

    return (
        <div className="relative shrink-0 w-[clamp(140px,30vw,200px)] h-[clamp(80px,15vw,120px)] md:w-[280px] md:h-[160px] flex items-center justify-center group cursor-default transition-all duration-300 hover:scale-105">
            {showLogo ? (
                <Image
                    src={org.logo as string}
                    alt={org.name}
                    fill
                    sizes="(max-width: 768px) 160px, 280px"
                    unoptimized
                    onError={() => setLogoFailed(true)}
                    className={`object-contain grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300 scale-90 md:scale-100 ${org.invertInDark ? 'dark:invert' : ''}`}
                />
            ) : (
                <span className="px-4 text-center text-xs md:text-base font-bold uppercase tracking-[0.15em] text-muted-foreground/70 group-hover:text-foreground transition-colors duration-300 leading-snug">
                    {org.name}
                </span>
            )}
        </div>
    );
};

/**
 * Organisations Gheid has actually studied, trained, volunteered or worked with.
 * To show a real logo, drop the file into /public/assets and set `logo` below —
 * until then the name is rendered as text, and a missing file falls back to text too.
 */
const organisations: Org[] = [
    { name: 'Arab Open University' },
    { name: 'Mabda AI' },
    { name: 'IBM SkillsBuild' },
    { name: 'eYouth' },
    { name: 'Google Developer Groups' },
    { name: 'NewTech' },
    { name: 'Infaz Innovation' },
    { name: 'Andalusia Hospital' },
    { name: 'The Bridge' },
    { name: 'Jeddah Girls Club' },
    { name: 'Positive Development Association' },
    { name: 'Marjan Al Sharq' },
    { name: 'Global Eagle Travel' },
];

export default function ExperienceMarquee() {
    const { isLowPowerMode } = usePerformance();

    const half = Math.ceil(organisations.length / 2);
    const row1 = organisations.slice(0, half);
    const row2 = organisations.slice(half);

    const ensureLength = (items: Org[]) => {
        if (items.length === 0) return items;
        let repeated = [...items];
        while (repeated.length < 12) {
            repeated = [...repeated, ...items];
        }
        return repeated;
    };

    return (
        <section className="py-2 md:py-8 bg-background relative z-10 overflow-hidden">
            {/* Fog/Blur Blending */}
            <div className="absolute top-0 left-0 w-full h-16 md:h-32 bg-gradient-to-b from-background via-background/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-16 md:h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-20 pointer-events-none" />

            <div className="flex flex-col gap-2">
                {/* Row 1: LEFT → RIGHT */}
                <ParallaxText baseVelocity={40} isLowPowerMode={isLowPowerMode}>
                    {ensureLength(row1).map((org, idx) => (
                        <GalleryItem key={`r1-${idx}`} org={org} />
                    ))}
                </ParallaxText>

                {/* Row 2: RIGHT → LEFT */}
                <ParallaxText baseVelocity={-40} isLowPowerMode={isLowPowerMode}>
                    {ensureLength(row2).map((org, idx) => (
                        <GalleryItem key={`r2-${idx}`} org={org} />
                    ))}
                </ParallaxText>
            </div>
        </section>
    );
}
