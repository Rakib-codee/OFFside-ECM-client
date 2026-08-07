"use client";

import { useState, type FormEvent } from "react";
import Reveal from "@/components/fx/Reveal";
import { useT } from "@/lib/i18n/locale";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitState = "idle" | "error" | "success";

/** "Join the Squad" — email capture with a morphing success button. */
export default function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setState("error");
      return;
    }
    setState("success");
  };

  return (
    <section className="px-5 py-20 md:py-36" aria-label="Newsletter">
      <Reveal className="mx-auto max-w-[600px] text-center">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">{t("news.title")}</h2>
        <p className="mt-3 text-secondary">
          {t("news.sub")}
        </p>
        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            {t("news.emailLabel")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") {
                setState("idle");
              }
            }}
            placeholder={t("news.placeholder")}
            disabled={state === "success"}
            className={`h-14 flex-1 rounded-lg border bg-elevated px-5 text-base text-primary placeholder:text-muted transition-shadow focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,59,48,0.2)] ${
              state === "error" ? "animate-shake border-accent" : "border-line focus:border-accent"
            }`}
            aria-invalid={state === "error"}
            aria-describedby={state === "error" ? "newsletter-error" : undefined}
          />
          <button
            type="submit"
            disabled={state === "success"}
            className={`h-14 rounded-lg px-8 font-medium transition-all duration-[400ms] ease-in-out ${
              state === "success"
                ? "bg-success text-white"
                : "bg-cta text-cta-text hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[0_8px_24px_rgba(255,59,48,0.3)] active:scale-95"
            }`}
          >
            {state === "success" ? t("news.success") : t("news.cta")}
          </button>
        </form>
        {state === "error" ? (
          <p id="newsletter-error" role="alert" className="mt-2 text-sm text-accent">
            {t("news.error")}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted">{t("news.privacy")}</p>
      </Reveal>
    </section>
  );
}
