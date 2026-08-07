"use client";

import TransitionLink from "@/components/fx/TransitionLink";
import { useT } from "@/lib/i18n/locale";

export default function AccountContent() {
  const t = useT();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[600px] flex-col items-center justify-center px-5 py-32 text-center">
      <h1 className="font-display text-4xl font-semibold">{t("account.title")}</h1>
      <p className="mt-4 text-secondary">{t("account.copy")}</p>
      <TransitionLink
        href="/shop"
        className="mt-10 rounded-lg bg-cta px-10 py-4 font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95"
      >
        {t("account.back")}
      </TransitionLink>
    </main>
  );
}
