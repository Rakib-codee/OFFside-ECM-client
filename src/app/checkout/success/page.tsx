"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import TransitionLink from "@/components/fx/TransitionLink";
import { formatPrice } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";

const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = ["#ff3b30", "#007aff", "#ffffff", "#34c759"];
const DELIVERY_DAYS = 5;

interface StoredOrder {
  number: string;
  email: string;
  total: number;
  itemCount: number;
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const checkRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Load the order stored by the checkout step
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("offside-order");
      if (raw) {
        setOrder(JSON.parse(raw) as StoredOrder);
      }
    } catch {
      // Corrupt storage — fall back to the generic confirmation
    }
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + DELIVERY_DAYS);
    setDeliveryDate(
      estimated.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    );
  }, []);

  // Checkmark draws itself, then confetti bursts
  useEffect(() => {
    const check = checkRef.current;
    const circle = circleRef.current;
    if (!check || !circle) {
      return;
    }
    if (prefersReducedMotion()) {
      return;
    }
    const checkLength = check.getTotalLength();
    const circleLength = circle.getTotalLength();
    gsap.set(circle, { strokeDasharray: circleLength, strokeDashoffset: circleLength });
    gsap.set(check, { strokeDasharray: checkLength, strokeDashoffset: checkLength });
    const timeline = gsap.timeline();
    timeline
      .to(circle, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" })
      .to(check, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .add(() => burstConfetti(confettiRef.current));
    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-[600px] flex-col items-center justify-center overflow-visible px-5 py-32 text-center">
      <div ref={confettiRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />

      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <circle
          ref={circleRef}
          cx="48"
          cy="48"
          r="44"
          stroke="#34c759"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          ref={checkRef}
          d="M30 49l13 13 23-27"
          stroke="#34c759"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h1 className="mt-8 font-display text-4xl font-semibold">Order confirmed</h1>
      <p className="mt-3 text-secondary">
        Thanks for backing the badge{order?.email ? ` — a receipt is on its way to ${order.email}` : ""}.
      </p>

      <dl className="mt-8 w-full rounded-2xl border border-line bg-card p-6 text-left text-sm">
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">Order number</dt>
          <dd className="font-medium tnum">{order?.number ?? "ORD-000000"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">Items</dt>
          <dd className="font-medium tnum">{order?.itemCount ?? "—"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">Total</dt>
          <dd className="font-medium tnum">{order ? formatPrice(order.total) : "—"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">Estimated delivery</dt>
          <dd className="font-medium">{deliveryDate}</dd>
        </div>
      </dl>

      <TransitionLink
        href="/shop"
        className="mt-10 rounded-lg bg-white px-10 py-4 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95"
      >
        Continue shopping
      </TransitionLink>
    </main>
  );
}

/** 50-particle confetti burst from the checkmark. */
function burstConfetti(container: HTMLDivElement | null) {
  if (!container) {
    return;
  }
  const particles = Array.from({ length: CONFETTI_COUNT }, () => {
    const particle = document.createElement("span");
    const size = 4 + Math.random() * 6;
    particle.style.cssText = `position:absolute;left:50%;top:35%;width:${size}px;height:${size}px;border-radius:${Math.random() > 0.5 ? "50%" : "1px"};background:${
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    };`;
    container.appendChild(particle);
    return particle;
  });

  particles.forEach((particle) => {
    gsap.to(particle, {
      x: (Math.random() - 0.5) * 500,
      y: Math.random() * -300 - 40,
      rotation: Math.random() * 540,
      duration: 0.9 + Math.random() * 0.5,
      ease: "power2.out",
    });
    gsap.to(particle, {
      y: "+=420",
      opacity: 0,
      delay: 0.5,
      duration: 1.1,
      ease: "power1.in",
      onComplete: () => particle.remove(),
    });
  });
}
