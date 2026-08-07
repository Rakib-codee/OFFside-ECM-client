"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const ATTRACT_RADIUS = 50;
const PULL_STRENGTH = 0.35;

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
}

/** Wrapper that makes its child subtly follow the cursor when it comes near. */
export default function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isFinePointer() || prefersReducedMotion()) {
      return;
    }

    const moveX = gsap.quickTo(element, "x", { duration: 0.4, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const reach = Math.max(rect.width, rect.height) / 2 + ATTRACT_RADIUS;

      if (distance < reach) {
        moveX(deltaX * PULL_STRENGTH);
        moveY(deltaY * PULL_STRENGTH);
      } else {
        moveX(0);
        moveY(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.set(element, { x: 0, y: 0 });
    };
  }, []);

  return (
    <div ref={ref} className={className ? `inline-block ${className}` : "inline-block"}>
      {children}
    </div>
  );
}
