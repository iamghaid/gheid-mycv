"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

import { useTranslations } from 'next-intl';
import Image from "next/image";
import { cn } from "@/lib/utils";

export const HeroParallax = ({
  products,
  isLowPowerMode,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  isLowPowerMode?: boolean;
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Spring smooths ONLY the rotation to prevent aliasing jitter ("shaking")
  const rotateSpringConfig = { stiffness: 200, damping: 20 };

  const translateX = useTransform(scrollYProgress, [0, 1], [0, isLowPowerMode ? 200 : 800]);
  const translateXReverse = useTransform(scrollYProgress, [0, 1], [0, isLowPowerMode ? -200 : -800]);

  const rotateXRaw = useTransform(scrollYProgress, [0, 0.2], [isLowPowerMode ? 0 : 5, 0]);
  const rotateX = useSpring(rotateXRaw, rotateSpringConfig);

  const opacity = useTransform(scrollYProgress, [0, 0.2], [isLowPowerMode ? 0.8 : 0.2, 1]);

  const rotateZRaw = useTransform(scrollYProgress, [0, 0.2], [isLowPowerMode ? 0 : 5, 0]);
  const rotateZ = useSpring(rotateZRaw, rotateSpringConfig);
  // On phones the tiles start much closer to their resting place: the desktop
  // -500px offset pulled the first row up over the heading and its intro text.
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const yStart = isLowPowerMode ? -100 : compact ? -60 : -500;
  const yEnd = isLowPowerMode ? 100 : compact ? 160 : 500;
  const translateY = useTransform(scrollYProgress, [0, 0.2], [yStart, yEnd]);
  return (
    <div
      ref={ref}
      className={cn(
        "pt-10 pb-20 sm:pb-40 overflow-hidden antialiased relative flex flex-col self-auto",
        isLowPowerMode
          ? "h-[100vh] sm:h-[120vh]"
          : "h-[180vh] sm:h-[200vh] lg:h-[250vh] [perspective:2000px] [transform-style:preserve-3d]"
      )}
    >
      <Header />
      {/*
        The rows are LTR geometry (two over-wide rows slid in opposite directions), so
        they are pinned to LTR; under RTL the rows anchored to the right edge and the
        slide exposed empty space. `gap` replaces `space-x-*`, which also misbehaves
        in RTL.
      */}
      <motion.div
        dir="ltr"
        style={{
          translateY,
          opacity,
          backfaceVisibility: 'hidden',
        }}
        className="relative z-0"
      >
        <motion.div className={cn("flex flex-row-reverse gap-6 sm:gap-10 lg:gap-16 mb-8 sm:mb-14 lg:mb-20", isLowPowerMode && "mb-10 gap-8")}>
          {firstRow.map((product, i) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={`${product.title}-${i}`}
              isLowPowerMode={isLowPowerMode}
            />
          ))}
        </motion.div>
        <motion.div className={cn("flex flex-row gap-6 sm:gap-10 lg:gap-16 mb-8 sm:mb-14 lg:mb-20", isLowPowerMode && "mb-10 gap-8")}>
          {secondRow.map((product, i) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={`${product.title}-${i}`}
              isLowPowerMode={isLowPowerMode}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

import { Mouse } from "lucide-react";

export const Header = () => {
    const tPage = useTranslations('projectsPage');
  const t = useTranslations('projectHeader');
  return (
    <div className="max-w-7xl relative z-10 mx-auto pt-28 md:pt-48 px-5 md:px-4 w-full">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold dark:text-white leading-[1.1] text-balance">
        {t('title')}
      </h1>
      <p
        className="max-w-2xl text-base md:text-xl mt-5 md:mt-8 leading-relaxed text-neutral-600 dark:text-neutral-300"
        dangerouslySetInnerHTML={{ __html: t.raw('subtitle') }}
      />

      {/* Scroll Indicator */}
      <motion.div
        className="absolute start-5 md:start-4 -bottom-24 md:-bottom-48 hidden sm:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <div className="w-[1px] h-10 md:h-16 bg-gradient-to-b from-transparent via-neutral-400 to-transparent relative overflow-hidden">
          <motion.div
            className="absolute top-0 w-full h-1/2 bg-white blur-[1px]"
            animate={{ y: [0, 40, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium">{tPage('scroll')}</span>
      </motion.div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
  isLowPowerMode,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
  isLowPowerMode?: boolean;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={isLowPowerMode ? {} : {
        y: -12,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "group/product relative shrink-0 aspect-[16/10]",
        isLowPowerMode ? "w-[14rem] md:w-[20rem]" : "w-[15rem] sm:w-[22rem] md:w-[28rem] lg:w-[32rem]"
      )}
    >
      {/*
        One frame for every screenshot. Screenshots come in different shapes (phone
        mock-ups, full-width web pages, generated covers), and cropping them all to
        the same box cut some awkwardly. Each one is shown whole instead, over a
        blurred, darkened fill of itself, so every tile has identical proportions.
      */}
      <a
        href={product.link}
        className="absolute inset-0 block overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.5)] transition-shadow duration-500 group-hover/product:shadow-2xl"
      >
        <Image
          src={product.thumbnail}
          fill
          aria-hidden
          alt=""
          className="object-cover scale-110 blur-2xl opacity-60 dark:opacity-40"
          sizes="200px"
        />
        <Image
          src={product.thumbnail}
          fill
          className="object-contain p-3 sm:p-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/product:scale-[1.03]"
          alt={product.title}
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 450px, 520px"
        />
        {/* Caption bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-10 opacity-0 translate-y-2 transition-all duration-300 group-hover/product:opacity-100 group-hover/product:translate-y-0">
          <h2 className="truncate text-sm sm:text-base font-semibold text-white">{product.title}</h2>
          <span aria-hidden className="shrink-0 text-white/80">↗</span>
        </div>
      </a>
    </motion.div>
  );
};
