"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  EASE_OUT,
  prefersReducedMotion,
  REVEAL_DISTANCE,
  REVEAL_DURATION,
  REVEAL_STAGGER,
} from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animate direct children with a stagger instead of the wrapper itself. */
  staggerChildren?: boolean;
  delay?: number;
}

/**
 * Reusable scroll reveal: fade + rise when the element enters the viewport.
 * Falls back to a simple fade for reduced-motion users.
 */
export default function Reveal({
  children,
  className,
  staggerChildren = false,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const targets = staggerChildren ? Array.from(element.children) : [element];
    if (targets.length === 0) {
      return;
    }

    const reduced = prefersReducedMotion();
    const tween = gsap.fromTo(
      targets,
      reduced ? { opacity: 0 } : { opacity: 0, y: REVEAL_DISTANCE },
      {
        opacity: 1,
        y: 0,
        duration: reduced ? 0.3 : REVEAL_DURATION,
        ease: EASE_OUT,
        delay,
        stagger: reduced ? 0 : REVEAL_STAGGER,
        paused: true,
      },
    );

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 85%",
      once: true,
      onEnter: () => tween.play(),
    });

    return () => {
      trigger.kill();
      tween.kill();
    };
  }, [staggerChildren, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
