"use client";

import React from "react";
import { useResponsive } from "@/components/ui/use-responsive";
import clsx from "clsx";

/**
 * Cover emblem: two overlapping rings. It keeps the two-circle motif the covers
 * always had, but as one centred mark with a consistent position on every book,
 * instead of an illustration that sat centred on some covers and off to one side on
 * others.
 */
const DefaultIllustration = (
  <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden>
    <circle cx="23" cy="22" r="17" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" />
    <circle cx="41" cy="22" r="17" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
    <path d="M32 7.9a17 17 0 0 1 0 28.2a17 17 0 0 1 0-28.2Z" fill="currentColor" fillOpacity="0.28" />
  </svg>
);

interface ResponsiveProp<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

interface BookProps {
  title: string;
  /** Small line above the emblem, e.g. the year. */
  eyebrow?: string;
  variant?: "simple" | "stripe";
  width?: number | ResponsiveProp<number>;
  color?: string;
  textColor?: string;
  illustration?: React.ReactNode;
  textured?: boolean;
  className?: string;
}

export const Book = ({
  title,
  eyebrow,
  variant = "stripe",
  width = 196,
  color,
  textColor = "#fafafa",
  illustration,
  textured = false,
  className
}: BookProps) => {
  const _width = useResponsive(width);
  const _color = color ? color : variant === "simple" ? "var(--ds-background-200)" : "var(--ds-amber-600)";
  const _illustration = illustration ? illustration : DefaultIllustration;

  return (
    /*
      The 3D construction (page block rotated 90° at the right edge, back cover pushed
      behind) is LTR geometry. Under dir="rtl" the absolutely positioned page block
      fell back to the right-hand static position and showed as a detached white bar
      beside the cover, so the book itself is always laid out LTR; the title restores
      its own direction.
    */
    <div dir="ltr" className={clsx("inline-block w-fit", className)} style={{ perspective: 900 }}>
      <div
        className="aspect-[49/60] w-fit relative rotate-0 book-rotate"
        style={{ transformStyle: "preserve-3d", minWidth: _width, containerType: "inline-size" }}
      >
        {/* Front cover */}
        <div
          className="flex flex-col h-full rounded-l-md rounded-r-lg overflow-hidden shadow-book relative after:absolute after:inset-0 after:border after:border-gray-alpha-400 after:shadow-book-border after:rounded-l-md after:rounded-r-lg"
          style={{ width: _width, background: _color, color: textColor }}
        >
          {/* Upper panel: eyebrow + emblem */}
          <div
            className={clsx(
              "relative flex flex-col items-center justify-center gap-[5cqw] px-[10%] pl-[16%]",
              variant === "stripe" ? "h-[56%]" : "h-[58%]"
            )}
          >
            {eyebrow && (
              <span className="absolute top-[7cqw] right-[8cqw] text-[5.5cqw] font-mono font-semibold tracking-[0.18em] uppercase opacity-70">
                {eyebrow}
              </span>
            )}
            <div className="w-[46%] aspect-[64/44] opacity-90 transition-transform duration-700 ease-out group-hover:scale-105">
              {_illustration}
            </div>
          </div>

          {/* Lower panel: title. The stripe variant darkens it into a band. */}
          <div
            className={clsx(
              "relative flex-1 flex flex-col justify-end gap-[3cqw] p-[8%] pl-[16%]",
              variant === "stripe" ? "bg-black/35" : "bg-book-gradient"
            )}
          >
            <span className="block h-px w-[22%] bg-current opacity-40" />
            <span
              dir="auto"
              className="block text-[11cqw] font-bold leading-[1.15] tracking-[-.01em] text-balance [overflow-wrap:anywhere]"
            >
              {title}
            </span>
          </div>

          {/* Spine / binding shading along the left edge */}
          <div className="absolute inset-y-0 left-0 w-[8.2%] mix-blend-overlay" style={{ background: "var(--ds-book-bind)" }} />
          <div className="absolute inset-y-0 left-[8.2%] w-px bg-black/20" />

          {textured && (
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-[url('/noise.svg')] bg-repeat" />
          )}
        </div>

        {/* Page block, visible when the book turns */}
        <div
          className="h-[calc(100%_-_2_*_3px)] w-[calc(29cqw_-_2px)] absolute top-[3px] left-0"
          style={{
            background: "repeating-linear-gradient(90deg, #e9e6df 0 1px, #f7f5f0 1px 3px)",
            transform: `translateX(calc(${_width} * 1px - 29cqw / 2 - 3px)) rotateY(90deg) translateX(calc(29cqw / 2))`
          }}
        />
        {/* Back cover */}
        <div
          className="absolute left-0 top-0 rounded-l-md rounded-r-lg h-full"
          style={{ width: _width, background: _color, filter: "brightness(0.7)", transform: "translateZ(calc(-1 * 29cqw))" }}
        />
      </div>
    </div>
  );
};
