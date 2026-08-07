"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import TransitionLink from "@/components/fx/TransitionLink";
import { formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/locale";
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

const EMPTY_SUBSCRIBE = () => () => {};

/** Cached per locale so each snapshot stays stable across renders (client-only). */
const cachedDeliveryDates: Partial<Record<string, string>> = {};
function deliveryDateSnapshot(localeTag: string): string {
  if (!cachedDeliveryDates[localeTag]) {
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + DELIVERY_DAYS);
    cachedDeliveryDates[localeTag] = estimated.toLocaleDateString(localeTag, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return cachedDeliveryDates[localeTag]!;
}
const getDeliveryDateEn = () => deliveryDateSnapshot("en-US");
const getDeliveryDateBn = () => deliveryDateSnapshot("bn-BD");

export default function OrderSuccessPage() {
  const t = useT();
  const locale = useLocale();
  const checkRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Order details written by the checkout step (client-only reads)
  const orderRaw = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => sessionStorage.getItem("offside-order"),
    () => null,
  );
  const deliveryDate = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    locale === "bn" ? getDeliveryDateBn : getDeliveryDateEn,
    () => "",
  );
  const order = useMemo(() => {
    if (!orderRaw) {
      return null;
    }
    try {
      return JSON.parse(orderRaw) as StoredOrder;
    } catch {
      return null;
    }
  }, [orderRaw]);

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

      <h1 className="mt-8 font-display text-4xl font-semibold">{t("success.title")}</h1>
      <p className="mt-3 text-secondary">
        {t("success.thanks")}{order?.email ? ` — ${t("success.receipt")} ${order.email}` : ""}.
      </p>

      <dl className="mt-8 w-full rounded-2xl border border-line bg-card p-6 text-left text-sm">
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">{t("success.orderNumber")}</dt>
          <dd className="font-medium tnum">{order?.number ?? "ORD-000000"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">{t("success.items")}</dt>
          <dd className="font-medium tnum">{order?.itemCount ?? "—"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">{t("success.total")}</dt>
          <dd className="font-medium tnum">{order ? formatPrice(order.total) : "—"}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-secondary">{t("success.delivery")}</dt>
          <dd className="font-medium">{deliveryDate}</dd>
        </div>
      </dl>

      <TransitionLink
        href="/shop"
        className="mt-10 rounded-lg bg-cta px-10 py-4 font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95"
      >
        {t("success.continue")}
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
