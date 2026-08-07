"use client";

import { useRef, type ReactNode } from "react";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const MAX_TILT_DEG = 8;

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

/** 3D perspective tilt toward the cursor. Inert on touch and reduced motion. */
export default function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element || !isFinePointer() || prefersReducedMotion()) {
      return;
    }
    const rect = element.getBoundingClientRect();
    const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = ratioX * MAX_TILT_DEG * 2;
    const rotateX = -ratioY * MAX_TILT_DEG * 2;
    element.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  const handleMouseLeave = () => {
    const element = ref.current;
    if (element) {
      element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: "transform 0.1s ease-out", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
