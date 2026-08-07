"use client";

export const CHECKOUT_STEPS = ["Cart", "Information", "Shipping", "Payment"] as const;

interface ProgressStepsProps {
  currentStep: number;
}

/** Four-step progress bar with animated connector fills. */
export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <ol className="mb-10 flex items-center" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li key={step} className={`flex items-center ${index > 0 ? "flex-1" : ""}`}>
            {index > 0 ? (
              <span className="relative mx-2 h-px flex-1 bg-line" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 bg-success transition-all duration-500 ease-out"
                  style={{ width: isCompleted || isActive ? "100%" : "0%" }}
                />
              </span>
            ) : null}
            <span
              className="flex items-center gap-2"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-300 ${
                  isCompleted
                    ? "border-success bg-success text-white"
                    : isActive
                      ? "border-accent bg-accent text-white"
                      : "border-line text-muted"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  isActive ? "font-medium text-primary" : isCompleted ? "text-secondary" : "text-muted"
                }`}
              >
                {step}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
