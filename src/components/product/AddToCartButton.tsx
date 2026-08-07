"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

const LOADING_MS = 700;
const SUCCESS_RESET_MS = 2000;

type ButtonState = "idle" | "loading" | "success";

interface AddToCartButtonProps {
  price: number;
  disabled?: boolean;
  /** Runs when the fake processing finishes — actually adds to the cart. */
  onAdd: () => void;
}

/** Full-width CTA that shrinks to a spinner, then springs back green. */
export default function AddToCartButton({ price, disabled, onAdd }: AddToCartButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleClick = () => {
    if (state !== "idle" || disabled) {
      return;
    }
    setState("loading");
    timers.current.push(
      setTimeout(() => {
        setState("success");
        onAdd();
        timers.current.push(setTimeout(() => setState("idle"), SUCCESS_RESET_MS));
      }, LOADING_MS),
    );
  };

  return (
    <div className="flex h-14 justify-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || state !== "idle"}
        aria-live="polite"
        className={`flex h-14 items-center justify-center overflow-hidden font-medium transition-all duration-[400ms] ease-in-out ${
          state === "loading"
            ? "w-14 rounded-full bg-black text-white"
            : "w-full rounded-lg"
        } ${
          state === "success"
            ? "bg-success text-white"
            : state === "idle"
              ? disabled
                ? "cursor-not-allowed bg-elevated text-muted"
                : "bg-cta text-cta-text hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
              : ""
        }`}
      >
        {state === "loading" ? (
          <span
            aria-label="Adding to cart"
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
        ) : state === "success" ? (
          "Added ✓"
        ) : disabled ? (
          "Select a size"
        ) : (
          `Add to cart — ${formatPrice(price)}`
        )}
      </button>
    </div>
  );
}
