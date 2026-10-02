"use client";

import React from "react";
import { SkillLogo } from "./SkillLogo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocalizedPortfolio } from "@/hooks/useLocalizedPortfolio";

const ScrollerItem = ({
    name,
    icon,
    invertInDark,
}: {
    name: string;
    icon: string;
    invertInDark?: boolean;
}) => (
    <div className="flex items-center gap-4 px-12 py-4 transition-all duration-300 group">
        <div className="relative w-10 h-10 flex-shrink-0 transition-all duration-500">
            {/*
              These are full-colour brand logos, so only the few that are dark
              artwork (GitHub, Express, Microsoft) get inverted on dark backgrounds.
              Inverting all of them — which is what a blanket `dark:invert` did —
              stripped every logo down to a grey silhouette.
            */}
            <SkillLogo src={icon} name={name} invertInDark={invertInDark} />
        </div>
        <p className="text-xl font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-500 whitespace-nowrap">
            {name}
        </p>
    </div>
);

// Both rows are pinned to LTR: each loop is two copies slid by -50%, and under the
// Arabic page's RTL direction the rows anchored to the right edge, leaving part of
// the line empty as they moved.
export const BrandScroller = () => {
    // Skills marked "Show in logo rows" in the admin (tech row: everything but tools).
    const techStackItems = useLocalizedPortfolio().techStack;
    if (!techStackItems.length) return null;
    return (
        <div dir="ltr" className="relative flex overflow-hidden py-2 w-full px-8 md:px-16 lg:px-24 [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
            <motion.div
                animate={{
                    x: ["-50%", "0%"],
                }}
                transition={{
                    duration: 30,
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex whitespace-nowrap"
            >
                {/* Render twice for seamless loop */}
                <div className="flex shrink-0">
                    {techStackItems.map((item, idx) => (
                        <ScrollerItem key={`tech-1-${idx}`} name={item.name} icon={item.icon} invertInDark={item.iconInvertInDark} />
                    ))}
                </div>
                <div className="flex shrink-0">
                    {techStackItems.map((item, idx) => (
                        <ScrollerItem key={`tech-2-${idx}`} name={item.name} icon={item.icon} invertInDark={item.iconInvertInDark} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export const BrandScrollerReverse = () => {
    const toolItems = useLocalizedPortfolio().tools;
    if (!toolItems.length) return null;
    return (
        <div dir="ltr" className="relative flex overflow-hidden py-2 w-full px-8 md:px-16 lg:px-24 [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
            <motion.div
                animate={{
                    x: ["0%", "-50%"],
                }}
                transition={{
                    duration: 30,
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex whitespace-nowrap"
            >
                {/* Render twice for seamless loop */}
                <div className="flex shrink-0">
                    {toolItems.map((item, idx) => (
                        <ScrollerItem key={`tool-1-${idx}`} name={item.name} icon={item.icon} invertInDark={item.iconInvertInDark} />
                    ))}
                </div>
                <div className="flex shrink-0">
                    {toolItems.map((item, idx) => (
                        <ScrollerItem key={`tool-2-${idx}`} name={item.name} icon={item.icon} invertInDark={item.iconInvertInDark} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
