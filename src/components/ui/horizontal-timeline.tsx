"use client";
import { cn } from "@/lib/utils";
import {
  useScroll,
  useTransform,
  motion,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from 'next-intl';

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  isEnd?: boolean;
  period?: string;
}

/** Playhead travel, as fractions of the viewport width from the starting edge. */
const TIP_RANGE: [number, number] = [0.08, 0.55];
const TIP_RANGE_COMPACT: [number, number] = [0.1, 0.6];

export const HorizontalTimeline = ({ data }: { data: TimelineEntry[] }) => {
  const tPage = useTranslations('experiencePage');
  // Arabic reads right-to-left, so the timeline does too: the track is anchored to
  // the right edge, slides rightwards, and the progress line grows from the right.
  const isRTL = useLocale() === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [scrollWidth, setScrollWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      const updateDimensions = () => {
        if (scrollRef.current) {
          setScrollWidth(scrollRef.current.scrollWidth);
          setViewportWidth(window.innerWidth);
        }
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });

      resizeObserver.observe(scrollRef.current);
      window.addEventListener("resize", updateDimensions);

      return () => {
        if (scrollRef.current) {
          resizeObserver.unobserve(scrollRef.current);
        }
        resizeObserver.disconnect();
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, [data]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const w = window.innerWidth;
    // Distance of the progress tip from the line's starting edge.
    const [from, to] = w < 1024 ? TIP_RANGE_COMPACT : TIP_RANGE;
    const blueLineTip = (from + (to - from) * latest) * w;

    let current = -1;
    for (let i = 0; i < data.length; i++) {
      const el = itemRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        const nextEl = itemRefs.current[i + 1];
        const nextRect = nextEl?.getBoundingClientRect();
        // Item start/end measured from the starting edge (left in LTR, right in RTL).
        const start = isRTL ? w - rect.right : rect.left;
        const end = nextRect
          ? (isRTL ? w - nextRect.right : nextRect.left)
          : start + rect.width;

        if (blueLineTip >= start && blueLineTip < end) {
          current = i;
          break;
        }
      }
    }
    setActiveIndex(current);
  });

  // Transform scroll progress into horizontal movement
  const xTransform = useTransform(
    scrollYProgress,
    [0, 1],
    [0, (isRTL ? 1 : -1) * Math.max(0, scrollWidth - viewportWidth + 200)] // Stop exactly when the far edge comes into view
  );

  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  // The progress tip works as a playhead: on desktop it travels only across the
  // part of the screen where an item's card (which opens on the far side of its
  // marker) still fits — sweeping the full width opened the last cards past the far
  // edge. Below 1024px the items are spaced about a screen apart, so no position
  // works; there the active card is shown in a centred panel instead (see below).
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const [tipFrom, tipTo] = isCompact ? TIP_RANGE_COMPACT : TIP_RANGE;
  const progressWidth = useTransform(scrollYProgress, [0, 1], [`${tipFrom * 100}%`, `${tipTo * 100}%`]);

  return (
    <div
      className="w-full bg-background font-sans relative"
      ref={containerRef}
      style={{ height: "400vh" }} // Tall container for scrolling
    >
      {/* Header/Title area - Now outside the sticky container so it scrolls away normally */}
      <div className="absolute top-12 md:top-24 start-0 px-4 md:px-8 lg:px-10 z-20 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-[clamp(2rem,10vw,4.5rem)] font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 tracking-tight pb-2 leading-[1.1]"
            whileHover={{ scale: 1.02, originX: isRTL ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >{tPage('professionalJourney')}</motion.h2>
          <motion.p
            className="text-neutral-600 dark:text-neutral-400 text-base md:text-xl max-w-2xl leading-relaxed"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >{tPage('journeyTimelineDesc')}</motion.p>
        </motion.div>
      </div>

      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full max-w-[100vw] z-40">
        {/* The horizontal track */}
        <div className="relative w-full flex items-center justify-center h-full">
          {/* Background Line - Faded at edges */}
          <div className="absolute left-0 w-full top-1/2 -translate-y-1/2 overflow-hidden h-[2px] bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]" />

          {/* Progress Line */}
          <motion.div
            style={{
              width: progressWidth,
              opacity: opacityTransform,
            }}
            className="absolute start-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r rtl:bg-gradient-to-l from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full z-10"
          />

          {/* Scrolling Content */}
          <motion.div
            ref={scrollRef}
            style={{ x: xTransform }}
            className="flex flex-row items-center px-8 md:px-32 w-max gap-12 md:gap-24 absolute start-0 top-1/2 -translate-y-1/2 z-20"
          >
            {data.map((item, index) => {
              const isEven = index % 2 === 0; // Alternating logic
              const isActive = activeIndex === index;

              return (
                <div
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className="relative w-[300px] sm:w-[320px] md:w-[420px] shrink-0 h-0 group cursor-pointer"
                >
                  {/* Circle marker directly on the line */}
                  <div className={cn(
                    "absolute top-1/2 start-0 -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-10 h-10 rounded-full bg-background flex items-center justify-center border-none z-20 transition-transform duration-500",
                    isActive ? "scale-125" : "group-hover:scale-125"
                  )}>
                    <div className={cn(
                      "h-4 w-4 rounded-full border p-2 transition-colors duration-500",
                      isActive
                        ? "bg-primary border-primary"
                        : "bg-neutral-300 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-700 group-hover:bg-primary group-hover:border-primary"
                    )} />
                  </div>

                  {item.isEnd ? (
                    <>
                      {/* Mask to hide the line after the end circle */}
                      <div
                        className="absolute top-1/2 start-5 h-[20px] w-full bg-background -translate-y-1/2 z-10"
                        style={{
                          // Extends the mask past the end of the track, on the side the line runs out to.
                          boxShadow: [400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000]
                            .map((d) => `${isRTL ? -d : d}px 0 0 0 hsl(var(--background))`)
                            .join(', ')
                        }}
                      />
                      {/* The content block for View More (small card) */}
                      <div className={cn(
                        "absolute start-10 top-1/2 -translate-y-1/2 z-30 transition-transform duration-500",
                        isActive ? "scale-105 translate-x-2 rtl:-translate-x-2" : "group-hover:scale-105 group-hover:translate-x-2 rtl:group-hover:-translate-x-2"
                      )}>
                        {item.content}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* TITLE - Fades out on hover */}
                      <div className={cn(
                        "absolute start-8 w-[250px] sm:w-[280px] md:w-[350px] transition-all duration-500 z-20",
                        !isEven ? 'bottom-4' : 'top-4'
                      )}>
                        <h3 className={cn(
                          "text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-400 tracking-tight transition-all duration-500",
                          isActive ? "opacity-0 translate-x-2 rtl:-translate-x-2" : "group-hover:opacity-0 group-hover:translate-x-2 rtl:group-hover:-translate-x-2"
                        )}>
                          {item.title}
                        </h3>
                      </div>

                      {/* DATE - Fades in on hover, on the OPPOSITE side */}
                      {item.period && (
                        <div className={cn(
                          "absolute start-8 transition-all duration-500 z-20 pointer-events-none max-lg:hidden",
                          !isEven ? 'top-4' : 'bottom-4',
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          !isEven && isActive ? "-translate-y-1" : "",
                          !isEven && !isActive ? "group-hover:-translate-y-1" : "",
                          isEven && isActive ? "translate-y-1" : "",
                          isEven && !isActive ? "group-hover:translate-y-1" : ""
                        )}>
                          <div className="inline-block px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm">
                            <span className="text-[10px] md:text-xs font-mono text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">{item.period}</span>
                          </div>
                        </div>
                      )}

                      {/* CARD - Appears on the SAME side as Title, replacing it */}
                      <div className={cn(
                        "absolute start-8 w-full pe-4 transition-all duration-500 ease-out z-30 max-lg:hidden",
                        !isEven ? 'bottom-2' : 'top-2',
                        isActive ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100",
                        !isEven && !isActive ? "translate-y-4 group-hover:translate-y-0" : "",
                        isEven && !isActive ? "-translate-y-4 group-hover:translate-y-0" : ""
                      )}>
                        {item.content}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </motion.div>
          {/* Compact screens: the active item's card, centred under the line. */}
          {isCompact && (
            <div className="absolute inset-x-0 top-[calc(50%+32px)] z-40 flex justify-center px-4 pointer-events-none">
              <AnimatePresence mode="wait">
                {activeIndex >= 0 && data[activeIndex] && !data[activeIndex].isEnd && (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-auto w-full max-w-[400px] [&>div]:!mt-0 [&>div]:!w-full"
                  >
                    {data[activeIndex].period && (
                      <span className="mb-2 inline-block rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                        {data[activeIndex].period}
                      </span>
                    )}
                    {data[activeIndex].content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
