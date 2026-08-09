import Image from "next/image";

interface LogoProps {
  className?: string;
  /** "md" for the navbar, "sm" for the footer. */
  size?: "md" | "sm";
}

/** OFFside brand mark and wordmark. */
export default function Logo({ className, size = "md" }: LogoProps) {
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        priority={!isSmall}
        className={`rounded-full ${isSmall ? "h-6 w-6" : "h-8 w-8"}`}
      />
      <span
        className={`font-display font-bold uppercase tracking-tight text-primary ${
          isSmall ? "text-base" : "text-xl"
        }`}
      >
        OFF<span className="text-accent">side</span>
      </span>
    </span>
  );
}
