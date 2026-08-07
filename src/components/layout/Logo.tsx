interface LogoProps {
  className?: string;
}

/** OFFside wordmark — angled slash nods to the linesman's flag. */
export default function Logo({ className }: LogoProps) {
  return (
    <span
      className={`font-display text-xl font-bold uppercase tracking-tight ${className ?? ""}`}
    >
      OFF<span className="text-accent">side</span>
      <span className="ml-1 inline-block h-4 w-[3px] -skew-x-12 bg-accent align-middle" />
    </span>
  );
}
