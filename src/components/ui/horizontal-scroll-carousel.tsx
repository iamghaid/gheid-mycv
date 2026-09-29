"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useMemo, useRef } from "react";
import { portfolioData as basePortfolioData } from "@/data/portfolio";
import { useLocalizedPortfolio } from "@/hooks/useLocalizedPortfolio";
import {
  Users, Brain, Users2, MessageSquare, Puzzle,
  RefreshCw, BookOpen, Network, LineChart, Search
} from "lucide-react";
import { getSkillIllustration } from "@/lib/skillIllustration";
import { useTranslations } from 'next-intl';

// Lucide icon per soft skill.
const skillIcons: Record<string, any> = {
  'Problem Solving': Puzzle,
  'Systemic Thinking': Network,
  'Critical Thinking': Brain,
  'Continuous Learning': BookOpen,
  'Analytical Thinking': LineChart,
  'Adaptability': RefreshCw,
  'Leadership': Users,
  'Communication': MessageSquare,
  'Teamwork': Users2,
  'Research Skills': Search,
};

// Card artwork is generated locally — see lib/skillIllustration. The remote
// illustration host this used before is unreachable, which left the cards empty.

type SkillCard = {
  id: number;
  title: string;
  description?: string;
  url: string;
  Icon: (typeof skillIcons)[string];
};

export const HorizontalScrollCarousel = () => {
    const tPage = useTranslations('skillsPage');
  const targetRef = useRef(null);
  // Built per render rather than at module load so the card titles follow the locale.
  const portfolioData = useLocalizedPortfolio();
  const englishSkills = basePortfolioData.softSkills;

  const allCards: SkillCard[] = useMemo(
    () =>
      portfolioData.softSkills.slice(0, 10).map((skill, index) => ({
        id: index + 1,
        title: skill.name,
        description: skill.description,
        // Artwork and icon are keyed off the untranslated name so they stay stable.
        url: getSkillIllustration({ name: englishSkills[index]?.name ?? skill.name }),
        Icon: skillIcons[englishSkills[index]?.name ?? skill.name] || Users,
      })),
    [portfolioData, englishSkills]
  );

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-68%']);

  return (
    <section
      ref={targetRef}
      className="relative h-[350vh] bg-background"
    >
      <div className="sticky top-0 flex flex-col h-screen overflow-hidden pb-8 md:pb-12">

        {/* Title Section (Didorong ke paling atas layar) */}
        <div className="w-full px-6 md:px-24 pt-5 md:pt-6 z-20 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[0.95] pb-1">{tPage('strategicDirectives')}</h2>
            <div className="w-16 h-1 bg-primary mt-3 mb-3 rounded-full opacity-80"></div>
            <p className="text-muted-foreground text-sm md:text-base font-medium max-w-2xl leading-relaxed line-clamp-2">{tPage('strategicDirectivesDesc')}</p>
          </motion.div>
        </div>

        {/* Carousel Items (Rata atas dengan jarak pasti agar teks tidak nempel) */}
        <div className="flex-1 min-h-0 w-full relative mt-3 lg:mt-4">
          {/*
            The viewport is pinned to LTR and the track is an ordinary flex child rather
            than an absolutely positioned one. Previously the track was `absolute` with no
            inset: under dir="rtl" its static position anchored to the right edge, so the
            whole strip started ~2800px off-screen and the section rendered as a blank
            black band in Arabic. As a flex child it is centred vertically by the wrapper
            and starts at the left edge in both locales, leaving translateX to do the
            scrolling. Card text inside still follows the page direction.
          */}
          <div dir="ltr" className="absolute inset-0 flex items-center overflow-hidden">
            <motion.div
              style={{ x }}
              className="flex h-full items-center gap-6 md:gap-8 px-6 md:px-24 w-max"
            >
              {allCards.map((card) => {
                return <Card card={card} key={card.id} />;
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ card }: { card: SkillCard }) => {
  const { Icon } = card;
  return (
    <div
      key={card.id}
      className="group relative h-full min-h-[220px] max-h-[440px] w-[240px] sm:w-[280px] md:w-[320px] lg:w-[380px] overflow-hidden bg-card/40 hover:bg-card/60 border border-border/80 shadow-sm flex-shrink-0 transition-colors duration-500 rounded-none"
    >
      {/* Sci-fi Corner Brackets (On Hover) */}
      <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-[2px] border-l-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-[2px] border-r-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-[2px] border-l-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-[2px] border-r-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />

      <div className="absolute inset-0 z-0 flex items-center justify-center p-6 sm:p-8 transition-transform duration-700 group-hover:scale-[1.03] opacity-60 group-hover:opacity-100">
        <img
          src={card.url}
          alt={card.title}
          className="w-full h-full object-contain dark:invert-0 invert"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent transition-opacity duration-500 opacity-90 group-hover:opacity-100 pointer-events-none"></div>

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8 lg:p-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="p-2 border border-border bg-background/50 backdrop-blur-sm rounded-none">
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
          </div>
          <span className="text-[10px] lg:text-xs font-mono text-muted-foreground uppercase tracking-widest">
            #{String(card.id).padStart(2, '0')}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground mb-2 lg:mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 leading-tight">
          {card.title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150 border-t border-border/50 pt-3 lg:pt-4">
          {card.description}
        </p>
      </div>
    </div>
  );
};

export default HorizontalScrollCarousel;
