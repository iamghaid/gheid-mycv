import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, Github, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MagneticEffect from "@/components/ui/MagneticEffect";
import { useLocalizedPortfolio } from "@/hooks/useLocalizedPortfolio";
import { getProjectCover } from "@/lib/projectCover";
import { useTranslations } from "next-intl";

interface ProjectData {
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
  slug: string;
}

// Derived from the portfolio data rather than a second hardcoded copy, so adding a
// project shows up here automatically. Projects without a screenshot get the
// generated cover instead of the stock photo this list used to carry.
export function ArgentLoopInfiniteSlider() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Built per render so titles, descriptions and categories follow the locale.
  const portfolioData = useLocalizedPortfolio();
  const tPage = useTranslations('projectsPage');
  const PROJECT_DATA: ProjectData[] = React.useMemo(
    () =>
      portfolioData.projects.map((project) => ({
        title: project.title,
        image:
          project.image ||
          getProjectCover({ slug: project.slug, title: project.title, category: project.category }),
        category: project.category || "Project",
        year: new Date(project.startDate).getFullYear().toString(),
        description: project.description,
        slug: project.slug,
      })),
    [portfolioData]
  );
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 30, mass: 1 });

  // Height of one entry in the card (the card scrolls its entries internally by
  // exactly this much). Phones stack image over text, so they need a taller card.
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const STEP = compact ? 430 : 270;

  const projectArea = 0.85;
  const projectStep = projectArea / PROJECT_DATA.length; 
  const transWindow = 0.05; 

  const scrollMap = [0];
  const yMap = ["0vh"];
  const internalYMap = ["0px"];

  PROJECT_DATA.forEach((_, i) => {
    if (i === 0) return;
    const boundary = i * projectStep;
    scrollMap.push(boundary - transWindow / 2, boundary + transWindow / 2);
    yMap.push(`-${(i-1)*100}vh`, `-${i*100}vh`);
    internalYMap.push(`-${(i-1)*STEP}px`, `-${i*STEP}px`);
  });

  scrollMap.push(projectArea, 1);
  yMap.push(`-${(PROJECT_DATA.length-1)*100}vh`, `-${(PROJECT_DATA.length-1)*100}vh`);
  internalYMap.push(`-${(PROJECT_DATA.length-1)*STEP}px`, `-${(PROJECT_DATA.length-1)*STEP}px`);

  const currentY = useTransform(smoothProgress, scrollMap, yMap);
  const contentInternalY = useTransform(smoothProgress, scrollMap, internalYMap);

  const bgOpacity = useTransform(smoothProgress, [0, 0.05, projectArea, 1], [0, 1, 1, 0]);
  const mainUIOpacity = useTransform(smoothProgress, [0, 0.05, projectArea, 1], [0, 1, 1, 0]);
  const buttonOpacity = useTransform(smoothProgress, [projectArea, projectArea + 0.05], [0, 1]);
  const finalContainerY = useTransform(smoothProgress, [projectArea, projectArea + 0.05], ["0px", compact ? "-160px" : "-250px"]);
  const imageY = useTransform(smoothProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      <style>{`
        .argent-slider-wrapper {
            position: sticky;
            top: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: hsl(var(--background));
            z-index: 20;
        }
        .project-list {
            position: absolute;
            width: 100%;
            height: 100%;
            will-change: transform;
        }
        .project {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .project img {
            width: 100%;
            height: 124%;
            object-fit: cover;
            filter: brightness(0.3) blur(10px);
            transform: scale(1.05);
            will-change: transform;
        }
        .mist-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, transparent 20%, hsl(var(--background) / 0.8) 100%);
            z-index: 5;
            pointer-events: none;
        }
        .minimap-bar-outer {
            width: min(85vw, 1400px);
            background: white !important;
            color: #0a0a0a;
            border-radius: 1.25rem;
            box-shadow: 0 50px 120px -30px rgba(0,0,0,0.6);
            overflow: hidden;
        }
        @media (max-width: 767px) {
            .minimap-bar-outer { width: calc(100vw - 32px); }
        }
        /* DEFAULT (Light Mode) Base State */
        .custom-btn {
            background: black;
            color: white;
            border-radius: 9999px;
            padding: 1.25rem 3rem;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-btn-arrow,
        .custom-btn-github {
            background: black;
            color: white;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* DARK MODE Base State */
        .dark .custom-btn,
        .dark .custom-btn-arrow,
        .dark .custom-btn-github {
            background: white;
            color: black;
        }

        /* Independent GitHub hover */
        .custom-btn-github:hover {
            background: #c1e44a !important;
            color: black !important;
        }

        /* Synchronized View More + Arrow hover */
        .group-projects:hover .custom-btn,
        .group-projects:hover .custom-btn-arrow {
            background: #c1e44a !important;
            color: black !important;
        }

        .slide-overlay {
            position: absolute;
            bottom: 3rem;
            inset-inline-start: 5%;
            z-index: 110;
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        .slide-line {
            width: 140px;
            height: 1px;
            position: relative;
        }
        .slide-progress {
            position: absolute;
            top: 0;
            inset-inline-start: 0;
            height: 100%;
            will-change: width;
        }
      `}</style>
      
      <div className="argent-slider-wrapper">
        <motion.div style={{ opacity: bgOpacity }}>
          <div className="mist-overlay" />
          <motion.div className="project-list" style={{ y: currentY }}>
            {PROJECT_DATA.map((data, i) => (
              <div key={i} className="project" style={{ top: `${i * 100}vh` }}>
                <motion.img src={data.image} alt={data.title} style={{ y: imageY }} />
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <motion.div 
            style={{ y: finalContainerY, willChange: "transform" }}
            className="flex flex-col items-center"
          >
            <motion.div
              style={{ opacity: mainUIOpacity, height: STEP }}
              className="minimap-bar-outer"
            >
              {/* The entries scroll inside the card; each is one STEP tall. */}
              <motion.div style={{ y: contentInternalY }} className="relative w-full h-full">
                {PROJECT_DATA.map((data, i) => {
                  const num = (i + 1).toString().padStart(2, "0");
                  return (
                    <div
                      key={data.slug}
                      className="absolute inset-x-0 grid grid-rows-[190px_minmax(0,1fr)_auto] md:grid-rows-1 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)_minmax(0,1fr)] gap-0 md:gap-8 md:px-8 lg:px-10"
                      style={{ top: `${i * STEP}px`, height: STEP }}
                    >
                      {/* Screenshot — shown whole on a blurred fill so every project
                          sits in the same frame whatever the screenshot's shape. */}
                      <div className="relative md:order-2 overflow-hidden bg-neutral-100 md:my-4 md:rounded-xl">
                        <img src={data.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-60" />
                        <img src={data.image} alt={data.title} className="relative block h-full w-full object-contain p-3" />
                      </div>

                      {/* Number, category, description */}
                      <div className="md:order-1 flex min-w-0 flex-col justify-start md:justify-between gap-2 px-5 pt-4 md:px-0 md:py-8">
                        <div className="flex items-baseline justify-between gap-3 md:block">
                          <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-neutral-400">{num}</p>
                          <h4 className="md:hidden text-xl font-semibold leading-tight tracking-tight text-end">{data.title}</h4>
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{data.category}</p>
                        <p className="text-[13px] leading-relaxed text-neutral-600 line-clamp-3">{data.description}</p>
                      </div>

                      {/* Title, year, link */}
                      <div className="md:order-3 flex min-w-0 items-center justify-between gap-3 px-5 pb-4 md:flex-col md:items-end md:px-0 md:py-8 text-end">
                        <h4 className="hidden md:block text-2xl lg:text-3xl font-semibold leading-tight tracking-tight text-balance">{data.title}</h4>
                        <p className="font-mono text-[11px] font-bold tabular-nums text-neutral-500">{data.year}</p>
                        <Link
                          href={`/projects/${data.slug}`}
                          className="pointer-events-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-700 hover:text-black transition-colors"
                        >
                          <span className="border-b border-black/15 pb-0.5">{tPage('viewMore')}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            <div className="h-[200px] w-full flex items-center justify-center pt-10">
              <motion.div 
                style={{ 
                  opacity: buttonOpacity,
                  pointerEvents: useTransform(smoothProgress, (v) => v > projectArea ? "auto" : "none")
                }}
              >
                <div className="flex items-center gap-4 pointer-events-auto">
                  <MagneticEffect>
                    <a 
                      href="https://github.com/iamghaid" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="custom-btn-github hover:scale-110 active:scale-95 transition-transform shadow-xl block"
                      title="GitHub Profile"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  </MagneticEffect>
                  
                  <MagneticEffect>
                    <div className="group-projects flex items-center gap-2">
                      <Link href="/projects" className="custom-btn group-hover:scale-105 active:scale-95 group-hover:shadow-[0_0_30px_rgba(193,228,74,0.3)]">
                        {tPage('viewMore')}
                      </Link>
                      <Link href="/projects" className="custom-btn-arrow group-hover:scale-110 active:scale-95 transition-transform shadow-xl">
                        <ArrowUpRight className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </MagneticEffect>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          style={{ opacity: useTransform(smoothProgress, [0, 0.05, projectArea, projectArea + 0.05], [0, 1, 1, 0]) }}
          className="slide-overlay"
        >
           <span className="text-foreground/40 font-mono text-[10px] tracking-[0.5em] uppercase">{tPage('page')}</span>
           <div className="slide-line bg-foreground/10">
              <motion.div 
                className="slide-progress bg-foreground" 
                style={{ width: useTransform(smoothProgress, [0, projectArea], ["0%", "100%"]) }} 
              />
           </div>
           <motion.span className="text-foreground font-mono text-[11px] tabular-nums font-bold">
              {useTransform(smoothProgress, (v) => {
               const idx = Math.min(Math.floor(v / projectStep), PROJECT_DATA.length - 1);
               return `${idx + 1} / ${PROJECT_DATA.length}`;
             })}
           </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
