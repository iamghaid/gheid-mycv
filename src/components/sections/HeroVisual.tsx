import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Mail, ArrowDown, ArrowDownRight, Bot, Zap, ExternalLink, MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import gsap from "gsap";
import { ProfileCard } from "@/components/ui/profile-card";
import { Spotlight } from "@/components/ui/spotlight-new";
import { useLocale, useTranslations } from 'next-intl';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';

export function HeroVisual({ isExiting = false }: { isExiting?: boolean }) {
    const tStats = useTranslations('statsSection');
    const tA11y = useTranslations('a11y');
    // Shadows the module import so this component reads translated copy.
    const portfolioData = useLocalizedPortfolio();

  const { personal } = portfolioData;
  const t = useTranslations('hero');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  // The Latin headline is set in tight, uppercase, near-zero-leading type. Arabic has
  // no case, its letterforms carry ascenders and descenders, and tight tracking breaks
  // the joins — so the Arabic cut gets its own metrics instead of inheriting these.
  const headlineClass = isArabic
    ? 'text-[clamp(2.25rem,8vw,9rem)] font-bold leading-[1.25] tracking-normal text-shiny will-change-transform px-4'
    : 'text-[clamp(3rem,11vw,13rem)] font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-4';
  const sideNoteClass = isArabic
    ? 'text-[11px] md:text-sm text-muted-foreground leading-loose max-w-[220px] md:max-w-[240px] font-medium tracking-normal'
    : 'text-[10px] md:text-xs text-muted-foreground leading-relaxed max-w-[200px] md:max-w-[220px] font-medium uppercase tracking-[0.2em]';
  const [showProfile, setShowProfile] = useState(false);
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number; icon: 'zap' | 'bot' | null }>({
    show: false,
    text: '',
    x: 0,
    y: 0,
    icon: null
  });

  const githubRef = useRef(null);
  const linkedinRef = useRef(null);
  const emailRef = useRef(null);
  const zapRef = useRef(null);
  const zapSmallRef = useRef(null);
  const botRef = useRef(null);

  useEffect(() => {
    if (!isExiting) return;

    const ctx = gsap.context(() => {
      // Reveal + Loop for GitHub
      gsap.fromTo(githubRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(githubRef.current, {
              y: -10,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Reveal + Loop for LinkedIn
      gsap.fromTo(linkedinRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.1,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(linkedinRef.current, {
              y: 10,
              duration: 2.5,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Reveal + Loop for Email
      gsap.fromTo(emailRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(emailRef.current, {
              x: 10,
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Zap pulsing - Energetic heartbeat effect
      gsap.to([zapRef.current, zapSmallRef.current], {
        scale: 1.2,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        force3D: true
      });

      // Bot floating - Responsive and smooth
      gsap.to(botRef.current, {
        rotation: 8,
        y: -10,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        force3D: true
      });
    });

    return () => ctx.revert();
  }, [isExiting]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/20"
    >
      {/* Background Pattern */}
      <div className="w-full absolute h-full z-0 bg-[radial-gradient(circle,_#888_0.5px,_transparent_0.5px)] dark:bg-[radial-gradient(circle,_#444_0.5px,_transparent_0.5px)] opacity-20 [background-size:24px_24px]" />

      {/* Spotlight Effect - Dramatic lighting */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <Spotlight
          duration={10}
          xOffset={120}
          translateY={-300}
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, .15) 0, hsla(0, 0%, 100%, .05) 50%, transparent 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .1) 0, hsla(0, 0%, 100%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .08) 0, hsla(0, 0%, 100%, 0) 80%, transparent 100%)"
        />
      </div>

      <main className="relative flex-1 flex flex-col justify-center pt-40 pb-20 z-10 max-w-[105rem] w-full mx-auto">
        <div className="flex relative gap-4 px-6 md:items-center w-full flex-col justify-center">

          {/* Follow-Cursor Tooltip */}
          <AnimatePresence>
            {tooltip.show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="fixed pointer-events-none z-[100] flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold px-4 py-2.5 rounded-full shadow-2xl"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  x: "-50%",
                  y: "-150%", // offset slightly above the cursor
                }}
              >
                {tooltip.icon === 'zap' && <ExternalLink className="w-4 h-4" />}
                {tooltip.icon === 'bot' && <MessageSquare className="w-4 h-4" />}
                <span className="text-sm">{tooltip.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 1: APPLIED AI / ذكاء اصطناعي */}
          <div dir={isArabic ? 'rtl' : 'ltr'} className="md:flex gap-8 items-center relative">
            <motion.p
              initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={cn(sideNoteClass, 'text-start md:text-end')}
            >
              {t('intro', { name: personal.name })}
            </motion.p>
            <div className="relative">
              <div ref={githubRef} className="absolute -top-4 right-0 md:right-2 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                  target="_blank"
                  className="block"
                >
                  <Github size={32} />
                </a>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={headlineClass}
              >
                {t('headline.line1')}
              </motion.h1>
            </div>
          </div>

          {/* Line 2: SOFT [ICON] WARE / مهندسة [ICON] برمجيات */}
          <div dir={isArabic ? 'rtl' : 'ltr'} className="md:flex gap-8 items-center relative">
            <div className="relative">
              <div ref={linkedinRef} className="absolute -top-8 left-4 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={personal.socialLinks.find(s => s.platform === 'LinkedIn')?.url}
                  target="_blank"
                  className="block"
                >
                  <Linkedin size={32} />
                </a>
              </div>
              <div ref={emailRef} className="absolute -bottom-12 right-24 md:right-36 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={`mailto:${personal.email}`}
                  className="block"
                >
                  <Mail size={32} />
                </a>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={cn(headlineClass, 'md:flex items-center')}
              >
                <span>{t('headline.line2a')}</span>
                <div
                  ref={zapRef}
                  className={cn('hidden lg:block relative cursor-pointer group', isArabic ? 'mx-[0.18em]' : 'mx-[0.05em]')}
                  onClick={() => window.open('https://github.com/iamghaid', '_blank')}
                  onMouseEnter={(e) => setTooltip({ show: true, text: t('workspaceTooltip'), icon: 'zap', x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                >
                  <Zap className="w-[0.8em] h-[0.8em] text-sky-400 group-hover:text-sky-300 transition-colors" strokeWidth={1.5} />
                </div>
                <div
                  ref={zapSmallRef}
                  className={cn('block lg:hidden relative cursor-pointer group', isArabic ? 'mx-[0.15em]' : 'mx-[0.02em]')}
                  onClick={() => window.open('https://github.com/iamghaid', '_blank')}
                  onMouseEnter={(e) => setTooltip({ show: true, text: t('workspaceTooltip'), icon: 'zap', x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                >
                  <Zap className="w-[0.8em] h-[0.8em] text-sky-400 group-hover:text-sky-300 transition-colors" strokeWidth={2} />
                </div>
                <span>{t('headline.line2b')}</span>
              </motion.h1>
            </div>
          </div>

          {/* Line 3: EN [ICON] GINEER / من الفكرة [ICON] للنشر */}
          <div dir={isArabic ? 'rtl' : 'ltr'} className="md:flex gap-8 items-center relative">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(headlineClass, 'md:flex items-center')}
            >
              <span>{t('headline.line3a')}</span>
              <div
                ref={botRef}
                className={cn('relative cursor-pointer group', isArabic ? 'mx-[0.18em]' : 'mx-[0.05em]')}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  window.dispatchEvent(new CustomEvent('portfolio:toggle-chatbot', {
                    detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                  }));
                }}
                onMouseEnter={(e) => setTooltip({ show: true, text: t('assistantTooltip'), icon: 'bot', x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
              >
                <Bot className="w-[0.85em] h-[0.85em] text-yellow-500 fill-yellow-500/10 group-hover:text-yellow-400 group-hover:fill-yellow-400/20 transition-colors" />
              </div>
              <span>{t('headline.line3b')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={cn(sideNoteClass, 'pt-4 md:pt-8')}
            >
              {t('collaboration')}
            </motion.p>
          </div>
        </div>

        {/* Separator Section */}
        <div className="mx-auto max-w-[105rem] w-full px-8 md:px-20 mt-12 md:mt-24">
          <div className="flex items-center gap-6">
            <Separator className="flex-1 h-[1px] bg-foreground/10 hidden md:block" />
            <div
              dir={isArabic ? 'rtl' : 'ltr'}
              className={cn(
                'whitespace-nowrap font-bold text-muted-foreground',
                isArabic ? 'text-xs md:text-sm tracking-normal' : 'text-[10px] md:text-xs tracking-[0.3em] uppercase'
              )}
            >
              {t('locationLine')}
            </div>
            <Link
              href="/resume"
              className="group flex items-center"
            >
              <motion.div
                className="relative flex items-center bg-zinc-100 dark:bg-white h-12 w-12 group-hover:w-44 rounded-full transition-all duration-500 ease-[0.23,1,0.32,1] overflow-hidden shadow-xl"
              >
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-150 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-black pl-6 pr-12">
                  {tStats('viewResumeHero')}
                </span>
                <div className="absolute right-0 flex items-center justify-center size-12 text-zinc-900 dark:text-black group-hover:rotate-45 transition-transform duration-500">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>

      {/* Award/Badge Vertical - MOVED TO LEFT */}
      <div
        className="absolute left-0 top-1/2 z-50 hidden md:flex items-center transform -translate-y-1/2 group/container"
        onMouseEnter={() => setShowProfile(true)}
        onMouseLeave={() => setShowProfile(false)}
      >
        {/* The Badge Trigger */}
        <div className="relative z-50">
          <motion.div
            whileHover={{ x: 10 }}
            className="bg-white text-black py-10 px-4 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl rounded-r-3xl border-r border-y border-zinc-200 cursor-pointer"
          >
            <span className="rotate-0 [writing-mode:vertical-rl]">{tA11y('availableForOpportunity')}</span>
          </motion.div>
        </div>

        {/* Profile Card Sidebar/Drawer Effect - Connected to avoid gap */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="pl-4 pointer-events-auto"
              style={{ width: 'max-content' }}
            >
              <ProfileCard
                name={personal.name}
                title={personal.title}
                description={personal.bio}
                imageUrl={personal.avatar}
                githubUrl={personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                linkedinUrl={personal.socialLinks.find(s => s.platform === 'LinkedIn')?.url}
                className="!max-w-4xl scale-[0.8] origin-left"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
