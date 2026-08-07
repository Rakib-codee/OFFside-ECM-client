"use client";

import { useId, type InputHTMLAttributes } from "react";

interface FloatingFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Changing this value re-triggers the shake animation on repeat errors. */
  errorNonce?: number;
}

/** Input with a floating label, glow focus and shake-on-error. */
export default function FloatingField({
  label,
  error,
  errorNonce = 0,
  className,
  ...inputProps
}: FloatingFieldProps) {
  const id = useId();

  return (
    <div className={className}>
      <div
        key={error ? `error-${errorNonce}` : "ok"}
        className={`relative ${error ? "animate-shake" : ""}`}
      >
        <input
          id={id}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`peer h-14 w-full rounded-lg border bg-elevated px-4 pt-4 text-base text-primary transition-shadow focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.1)] focus:outline-none ${
            error ? "border-accent" : "border-line"
          }`}
          {...inputProps}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted transition-all peer-focus:top-3.5 peer-focus:text-xs peer-focus:text-secondary peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
