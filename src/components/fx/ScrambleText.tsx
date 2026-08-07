"use client";

import { useCallback, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&";
const SCRAMBLE_DURATION_MS = 200;
const SCRAMBLE_TICK_MS = 30;

interface ScrambleTextProps {
  text: string;
  className?: string;
}

/** Text that scrambles through random characters on hover before settling. */
export default function ScrambleText({ text, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplay(text);
  }, [text]);

  const start = useCallback(() => {
    if (prefersReducedMotion() || intervalRef.current) {
      return;
    }
    const startedAt = performance.now();
    intervalRef.current = setInterval(() => {
      if (performance.now() - startedAt >= SCRAMBLE_DURATION_MS) {
        stop();
        return;
      }
      const scrambled = text
        .split("")
        .map((char) =>
          char === " "
            ? char
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
        )
        .join("");
      setDisplay(scrambled);
    }, SCRAMBLE_TICK_MS);
  }, [text, stop]);

  return (
    <span className={className} onMouseEnter={start} onMouseLeave={stop} aria-label={text}>
      {display}
    </span>
  );
}
