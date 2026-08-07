"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CUSTOMIZATION_PRICE } from "@/lib/products";
import { formatPrice } from "@/lib/format";

const DEBOUNCE_MS = 200;
const MAX_NAME_LENGTH = 12;

interface CustomizationFieldsProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  /** Debounced values feed the live jersey preview. */
  onNameChange: (name: string) => void;
  onNumberChange: (jerseyNumber: string) => void;
}

export default function CustomizationFields({
  isEnabled,
  onToggle,
  onNameChange,
  onNumberChange,
}: CustomizationFieldsProps) {
  const [name, setName] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Panel unfolds from height 0 when the toggle turns on
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    if (isEnabled) {
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" },
      );
    } else {
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    }
  }, [isEnabled]);

  // Debounced live preview updates
  useEffect(() => {
    const timer = setTimeout(() => onNameChange(isEnabled ? name : ""), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [name, isEnabled, onNameChange]);

  useEffect(() => {
    const timer = setTimeout(() => onNumberChange(isEnabled ? jerseyNumber : ""), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [jerseyNumber, isEnabled, onNumberChange]);

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-sm font-medium">
          Add customization{" "}
          <span className="text-muted">+{formatPrice(CUSTOMIZATION_PRICE)}</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label="Add name and number customization"
          onClick={() => onToggle(!isEnabled)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            isEnabled ? "bg-accent" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              isEnabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </label>

      <div ref={panelRef} className="h-0 overflow-hidden opacity-0">
        <div className="grid grid-cols-2 gap-3 pt-4">
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-secondary">
            Name
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-12 rounded-lg border border-line bg-elevated px-4 text-base normal-case tracking-normal text-primary placeholder:text-muted focus:border-white focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-secondary">
            Number
            <input
              type="text"
              inputMode="numeric"
              value={jerseyNumber}
              onChange={(event) =>
                setJerseyNumber(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
              placeholder="10"
              className="h-12 rounded-lg border border-line bg-elevated px-4 text-base text-primary placeholder:text-muted focus:border-white focus:outline-none tnum"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
