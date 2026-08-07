"use client";

interface QtyStepperProps {
  value: number;
  onChange: (nextValue: number) => void;
  label?: string;
}

export default function QtyStepper({ value, onChange, label }: QtyStepperProps) {
  const buttonClass =
    "flex h-7 w-7 items-center justify-center rounded border border-line text-sm text-secondary transition-colors hover:border-white hover:text-primary";

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label ?? "Quantity"}>
      <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className="w-5 text-center text-sm text-primary tnum" aria-live="polite">
        {value}
      </span>
      <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
