import { useId } from "react";
import type { JerseyColors } from "@/lib/types";

interface JerseyGraphicProps {
  colors: JerseyColors;
  view?: "front" | "back";
  /** Player name printed across the shoulders (back view). */
  name?: string;
  /** Big back number (back view). */
  number?: string | number;
  className?: string;
  label?: string;
}

/**
 * Self-contained SVG jersey used for product cards, galleries and the
 * live customizer — colorway, name and number are all driven by props.
 */
export default function JerseyGraphic({
  colors,
  view = "front",
  name,
  number,
  className,
  label,
}: JerseyGraphicProps) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 300 340"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* Sleeves */}
      <path
        d="M95,40 L38,86 C32,92 32,98 36,104 L52,124 C56,130 62,130 68,126 L92,108 Z"
        fill={colors.sleeve}
      />
      <path
        d="M205,40 L262,86 C268,92 268,98 264,104 L248,124 C244,130 238,130 232,126 L208,108 Z"
        fill={colors.sleeve}
      />

      {/* Torso */}
      <path
        d="M95,40 C115,28 185,28 205,40 L208,108 L208,296 C208,308 200,314 186,316 C162,320 138,320 114,316 C100,314 92,308 92,296 L92,108 Z"
        fill={colors.body}
      />

      {/* Side accent stripes */}
      <path d="M97,60 L97,300" stroke={colors.accent} strokeWidth="3" opacity="0.85" />
      <path d="M203,60 L203,300" stroke={colors.accent} strokeWidth="3" opacity="0.85" />

      {/* Collar */}
      <path
        d="M126,32 C134,26 142,23 150,23 C158,23 166,26 174,32 L150,54 Z"
        fill={colors.accent}
      />
      <path d="M132,33 C140,29 160,29 168,33 L150,48 Z" fill="#0a0a0a" opacity="0.55" />

      {view === "front" ? (
        <g>
          {/* Crest */}
          <circle cx="116" cy="92" r="11" fill={colors.accent} />
          <circle cx="116" cy="92" r="5" fill={colors.body} />
          {/* Sponsor wordmark */}
          <text
            x="150"
            y="168"
            textAnchor="middle"
            fill={colors.accent}
            fontSize="26"
            fontWeight="700"
            letterSpacing="6"
            fontFamily="var(--font-space-grotesk), sans-serif"
          >
            OFFSIDE
          </text>
        </g>
      ) : (
        <g>
          {name ? (
            <text
              x="150"
              y="98"
              textAnchor="middle"
              fill={colors.text}
              fontSize="21"
              fontWeight="600"
              letterSpacing="5"
              fontFamily="var(--font-oswald), sans-serif"
            >
              {name.toUpperCase().slice(0, 12)}
            </text>
          ) : null}
          {number !== undefined && number !== "" ? (
            <text
              x="150"
              y="228"
              textAnchor="middle"
              fill={colors.text}
              fontSize="116"
              fontWeight="600"
              fontFamily="var(--font-oswald), sans-serif"
            >
              {String(number).slice(0, 2)}
            </text>
          ) : null}
        </g>
      )}

      {/* Fabric shading */}
      <path
        d="M95,40 C115,28 185,28 205,40 L208,108 L208,296 C208,308 200,314 186,316 C162,320 138,320 114,316 C100,314 92,308 92,296 L92,108 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
