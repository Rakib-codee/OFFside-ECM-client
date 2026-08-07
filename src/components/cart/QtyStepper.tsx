"use client";

import { useT } from "@/lib/i18n/locale";

interface QtyStepperProps {
  value: number;
  onChange: (nextValue: number) => void;
  label?: string;
}

export default function QtyStepper({ value, onChange, label }: QtyStepperProps) {
  const t = useT();
  const buttonClass =
    "flex h-7 w-7 items-center justify-center rounded border border-line text-sm text-secondary transition-colors hover:border-primary hover:text-primary";

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label ?? t("cart.quantity")}>
      <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} aria-label={t("cart.decrease")}>
        −
      </button>
      <span className="w-5 text-center text-sm text-primary tnum" aria-live="polite">
        {value}
      </span>
      <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} aria-label={t("cart.increase")}>
        +
      </button>
    </div>
  );
}
