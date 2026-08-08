"use client";

import type { ReactNode } from "react";

interface InfoShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared layout for footer info pages (size guide, FAQ, about, …). */
export default function InfoShell({ title, subtitle, children }: InfoShellProps) {
  return (
    <main className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-28 md:pt-36">
      <h1 className="font-display text-4xl font-semibold md:text-5xl">{title}</h1>
      {subtitle ? <p className="mt-3 text-lg text-secondary">{subtitle}</p> : null}
      <div className="mt-10 flex flex-col gap-10">{children}</div>
    </main>
  );
}
