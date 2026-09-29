'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GPA_LABEL } from '@/data/profileStats';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface NodeData {
    id: string;
    label: string;
    description: string;
    imageUrl?: string;
    orbitIndex: number; // 0 for inner, 1 for outer
    angle: number; // degrees along the orbit, 0 = right, 90 = bottom (screen space)
}

interface InnovativeExperienceHeroProps {
    type: 'education' | 'journey' | 'experience';
    title: string;
    highlight: string;
    description: string;
}

/**
 * Node layout per tab. Labels and descriptions are message keys resolved at render
 * time, so the orbit content follows the reader's language.
 *
 * Angles are chosen per tab rather than spread evenly: nodes on the upper arc carry
 * their label above, nodes on the lower arc below, and the angles keep neighbouring
 * labels apart horizontally so they never collide in either language.
 */
const NODE_LAYOUT: Record<string, { key: string; orbitIndex: number; angle: number; imageUrl: string }[]> = {
    education: [
        { key: 'aou', orbitIndex: 0, angle: 240, imageUrl: "/journey/arabopenuniversity1.webp" },
        { key: 'deansList', orbitIndex: 1, angle: 60, imageUrl: "/certificate/deans-list.jpg" },
    ],
    journey: [
        { key: 'entertainmentClub', orbitIndex: 1, angle: 240, imageUrl: "/journey/arabopenuniversity1.webp" },
        { key: 'computerClub', orbitIndex: 0, angle: 330, imageUrl: "/journey/arabopenuniversity1.webp" },
        { key: 'anaIjabi', orbitIndex: 1, angle: 60, imageUrl: "/certificate/ana-ijabi.jpg" },
        { key: 'programmingCompetition', orbitIndex: 0, angle: 150, imageUrl: "/certificate/programming-creativity.jpg" },
    ],
    experience: [
        { key: 'freelanceDeveloper', orbitIndex: 1, angle: 240, imageUrl: "/about/gheid.jpg" },
        { key: 'mabdaWorkshop', orbitIndex: 1, angle: 330, imageUrl: "/certificate/mabda-ai.jpg" },
        { key: 'hackathons', orbitIndex: 1, angle: 110, imageUrl: "/certificate/after-med-hackathon.jpg" },
    ],
};

/* Orbit geometry, in the SVG's 1000 × 600 user space. */
const VIEW_W = 1000;
const VIEW_H = 600;
const CX = 500;
const CY = 300;
const TILT = -15; // degrees
const ORBITS = [
    { rx: 250, ry: 110 }, // inner
    { rx: 400, ry: 180 }, // outer
];

function pointOnOrbit(orbitIndex: number, angleDeg: number) {
    const { rx, ry } = ORBITS[orbitIndex];
    const t = (angleDeg * Math.PI) / 180;
    const phi = (TILT * Math.PI) / 180;
    const x = CX + rx * Math.cos(t) * Math.cos(phi) - ry * Math.sin(t) * Math.sin(phi);
    const y = CY + rx * Math.cos(t) * Math.sin(phi) + ry * Math.sin(t) * Math.cos(phi);
    return { x, y };
}

export function InnovativeExperienceHero({ type, title, highlight, description }: InnovativeExperienceHeroProps) {
    const tNodes = useTranslations('experiencePage.nodes');
    const tStats = useTranslations('statsSection');
    const layout = NODE_LAYOUT[type] || NODE_LAYOUT.experience;
    const nodes: NodeData[] = layout.map((node) => ({
        id: node.key,
        label: tNodes(node.key),
        description:
            node.key === 'aou' ? tNodes('aouDesc', { gpa: GPA_LABEL }) : tNodes(`${node.key}Desc`),
        orbitIndex: node.orbitIndex,
        angle: node.angle,
        imageUrl: node.imageUrl,
    }));
    const [activeNode, setActiveNode] = useState<string | null>(null);

    return (
        <section className="relative w-full py-4 lg:py-6 bg-transparent transition-colors duration-500">
            <div className="w-full mx-auto px-2 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-12 items-center">

                {/* Copy column */}
                <div className="relative z-20 min-w-0 space-y-8 lg:pe-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-[clamp(2.25rem,7vw,4rem)] font-bold text-black dark:text-white tracking-tight leading-[1.1] text-balance">
                            {title}
                            <br />
                            <span className="text-neutral-400 dark:text-neutral-500">{highlight}</span>
                        </h2>

                        <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
                            {description}
                        </p>

                        <div className="pt-2">
                            <Link
                                href="/resume"
                                className="group flex items-center gap-2 w-fit px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold text-sm transition-all hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                                {tStats('viewResume')}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Orbit column */}
                <div className="relative min-w-0">
                    {/*
                      The orbit is drawn in LTR geometry on purpose: node coordinates are
                      absolute percentages of the SVG, so they must not be mirrored. Each
                      label restores the page direction for its own text.
                    */}
                    <div dir="ltr" className="relative mx-auto w-full max-w-[760px] aspect-[5/3]">
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                            aria-hidden
                        >
                            {ORBITS.map((o, i) => (
                                <ellipse
                                    key={i}
                                    cx={CX}
                                    cy={CY}
                                    rx={o.rx}
                                    ry={o.ry}
                                    transform={`rotate(${TILT} ${CX} ${CY})`}
                                    className="stroke-neutral-400 dark:stroke-neutral-600 opacity-60 dark:opacity-50 motion-safe:animate-[orbit-dash_40s_linear_infinite]"
                                    style={{ animationDirection: i === 0 ? 'reverse' : 'normal' }}
                                    fill="none"
                                    strokeWidth="1.5"
                                    strokeDasharray="6 8"
                                    vectorEffect="non-scaling-stroke"
                                />
                            ))}
                            {/* Core */}
                            <circle cx={CX} cy={CY} r="5" className="fill-neutral-400 dark:fill-neutral-500" />
                            <circle cx={CX} cy={CY} r="16" className="fill-none stroke-neutral-300 dark:stroke-neutral-700" strokeWidth="1" />
                        </svg>

                        {nodes.map((node, i) => (
                            <OrbitalNode
                                key={node.id}
                                node={node}
                                index={i}
                                isActive={activeNode === node.id}
                                onActivate={() => setActiveNode(node.id)}
                                onDeactivate={() => setActiveNode((cur) => (cur === node.id ? null : cur))}
                                onToggle={() => setActiveNode((cur) => (cur === node.id ? null : node.id))}
                            />
                        ))}
                    </div>

                    {/*
                      Phone legend. Below sm the orbit is too small to carry text beside
                      each node, so nodes show their number and the labels are listed here
                      instead — readable, and never crossed by an orbit line.
                    */}
                    <ol className="sm:hidden mt-4 grid gap-2">
                        {nodes.map((node, i) => (
                            <li key={node.id}>
                                <button
                                    type="button"
                                    onClick={() => setActiveNode((cur) => (cur === node.id ? null : node.id))}
                                    className={cn(
                                        "w-full flex items-start gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors",
                                        activeNode === node.id
                                            ? "border-neutral-400 dark:border-neutral-500 bg-neutral-100 dark:bg-neutral-900"
                                            : "border-neutral-200 dark:border-neutral-800"
                                    )}
                                >
                                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white dark:bg-white dark:text-black">
                                        {i + 1}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-bold text-black dark:text-white">{node.label}</span>
                                        <span className="block text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{node.description}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function OrbitalNode({ node, index, isActive, onActivate, onDeactivate, onToggle }: {
    node: NodeData;
    index: number;
    isActive: boolean;
    onActivate: () => void;
    onDeactivate: () => void;
    onToggle: () => void;
}) {
    const { x, y } = pointOnOrbit(node.orbitIndex, node.angle);
    const nearTop = y < CY;

    // Detail card placement: horizontally it opens toward the centre of the orbit;
    // vertically it opens on the side opposite the label, so the two never overlap.
    const cardHorizontal = x < 330 ? 'left-[-20px]' : x > 670 ? 'right-[-20px]' : 'left-1/2 -translate-x-1/2';
    const cardVertical = nearTop ? 'top-[calc(100%+12px)]' : 'bottom-[calc(100%+12px)]';

    return (
        <div
            className="absolute"
            style={{
                left: `${(x / VIEW_W) * 100}%`,
                top: `${(y / VIEW_H) * 100}%`,
                zIndex: isActive ? 50 : 20,
            }}
            onMouseEnter={onActivate}
            onMouseLeave={onDeactivate}
        >
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
                {/* Soft pulse, staggered per node */}
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-neutral-400/30 dark:bg-neutral-500/30 motion-safe:animate-ping"
                    style={{ animationDuration: '3s', animationDelay: `${index * 0.6}s` }}
                />
                <button
                    type="button"
                    aria-label={node.label}
                    aria-expanded={isActive}
                    onClick={onToggle}
                    onFocus={onActivate}
                    onBlur={onDeactivate}
                    className={cn(
                        "relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto",
                        "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm",
                        isActive && "scale-110 shadow-lg border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700"
                    )}
                >
                    <span className="sm:hidden text-[11px] font-bold">{index + 1}</span>
                    <Plus className={cn("hidden sm:block w-4 h-4 transition-transform duration-500", isActive && "rotate-45")} />
                </button>

                {/* Detail card (tablet and up; phones use the legend under the orbit) */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: nearTop ? -8 : 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: nearTop ? -8 : 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={cn("hidden sm:block absolute z-50 pointer-events-none", cardHorizontal, cardVertical)}
                        >
                            <div
                                dir="auto"
                                className="w-[260px] md:w-[300px] bg-neutral-950/95 dark:bg-neutral-50/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 border border-white/10 dark:border-black/5 text-start"
                            >
                                <div className="space-y-1">
                                    <h4 className="text-neutral-100 dark:text-neutral-900 font-bold text-base leading-snug">{node.label}</h4>
                                    <p className="text-neutral-400 dark:text-neutral-600 text-sm leading-relaxed">{node.description}</p>
                                </div>
                                {node.imageUrl && (
                                    <div className="aspect-video relative rounded-xl bg-neutral-900/50 dark:bg-neutral-200/50 overflow-hidden border border-white/5 dark:border-black/5">
                                        <Image src={node.imageUrl} alt="" fill sizes="300px" className="object-cover" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/*
              Label: placed outward from the orbit (above nodes on the upper arc, below
              nodes on the lower arc) and centred on the node, on an opaque pill so a
              dashed line can only pass behind it, never through the words. Hidden on
              phones in favour of the legend.
            */}
            <div
                className={cn(
                    "hidden sm:block absolute left-0 -translate-x-1/2 pointer-events-none",
                    nearTop ? "bottom-[22px]" : "top-[22px]"
                )}
            >
                <span
                    dir="auto"
                    className={cn(
                        "block w-max max-w-[150px] md:max-w-[180px] rounded-lg px-2.5 py-1 text-center text-xs md:text-sm font-bold leading-snug text-balance",
                        "bg-background/90 backdrop-blur-sm border border-neutral-200/70 dark:border-neutral-800/70",
                        "text-black dark:text-white transition-opacity duration-300",
                        isActive ? "opacity-100" : "opacity-80"
                    )}
                >
                    {node.label}
                </span>
            </div>
        </div>
    );
}
