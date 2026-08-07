"use client";

import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { useT } from "@/lib/i18n/locale";

export default function NotFound() {
  const t = useT();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[600px] flex-col items-center justify-center px-5 py-32 text-center">
      <div className="w-36 opacity-30 motion-safe:animate-[float-slow_6s_ease-in-out_infinite]">
        <JerseyGraphic
          colors={{ body: "#2a2a2a", sleeve: "#1a1a1a", accent: "#ff3b30", text: "#ff3b30" }}
          view="back"
          number={404}
          name="Offside"
        />
      </div>
      <h1 className="mt-8 font-display text-4xl font-semibold">{t("notfound.title")}</h1>
      <p className="mt-3 text-secondary">{t("notfound.copy")}</p>
      <TransitionLink
        href="/"
        className="mt-10 rounded-lg bg-cta px-10 py-4 font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95"
      >
        {t("notfound.back")}
      </TransitionLink>
    </main>
  );
}
