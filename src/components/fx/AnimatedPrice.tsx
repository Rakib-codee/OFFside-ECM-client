"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { formatPrice } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";

interface AnimatedPriceProps {
  value: number;
  className?: string;
}

/** Price display that rolls to new values like a slot machine. */
export default function AnimatedPrice({ value, className }: AnimatedPriceProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const previousValue = useRef(value);

  useEffect(() => {
    const span = spanRef.current;
    if (!span || previousValue.current === value) {
      return;
    }
    if (prefersReducedMotion()) {
      span.textContent = formatPrice(value);
      previousValue.current = value;
      return;
    }
    const counter = { amount: previousValue.current };
    const tween = gsap.to(counter, {
      amount: value,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        span.textContent = formatPrice(Math.round(counter.amount));
      },
    });
    previousValue.current = value;
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span ref={spanRef} className={`tnum ${className ?? ""}`}>
      {formatPrice(value)}
    </span>
  );
}
