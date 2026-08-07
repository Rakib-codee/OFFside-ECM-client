"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent } from "react";
import gsap from "gsap";
import { EASE_IN_OUT, prefersReducedMotion } from "@/lib/motion";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  /** Called just before navigation starts (e.g. close a menu overlay). */
  onNavigate?: () => void;
};

/**
 * Internal link that squeezes the current page up before routing.
 * The matching enter animation lives in app/template.tsx.
 */
export default function TransitionLink({
  href,
  onNavigate,
  onClick,
  children,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    onNavigate?.();

    const target = typeof href === "string" ? href : href.pathname ?? "/";
    const page = document.getElementById("page-content");

    if (prefersReducedMotion() || !page) {
      router.push(target);
      return;
    }

    gsap.to(page, {
      scaleY: 0.95,
      y: -30,
      opacity: 0,
      duration: 0.4,
      ease: EASE_IN_OUT,
      transformOrigin: "top center",
      onComplete: () => router.push(target),
    });
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
