"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  items: React.ReactNode[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  itemClassName?: string;
}

export const InfiniteMarquee = ({
  items,
  speed = 20,
  direction = "left",
  className,
  itemClassName,
}: InfiniteMarqueeProps) => {
  return (
    // dir="ltr": the loop is two copies slid by -50% (LTR geometry). Under the
    // Arabic RTL page the row anchored right and the slide left the line half empty.
    <div dir="ltr" className={cn("relative flex overflow-hidden py-4", className)}>
      <motion.div
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex whitespace-nowrap"
      >
        {/* Render twice for seamless loop */}
        <div className="flex shrink-0">
          {items.map((item, idx) => (
            <div key={idx} dir="auto" className={cn("flex items-center", itemClassName)}>
              {item}
            </div>
          ))}
        </div>
        <div className="flex shrink-0">
          {items.map((item, idx) => (
            <div key={`second-${idx}`} dir="auto" className={cn("flex items-center", itemClassName)}>
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
