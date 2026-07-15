"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const SOFT_EASE = [0.22, 0.61, 0.36, 1] as const;

type Kind = "heart" | "petal" | "sparkle" | "glow";

type Piece = {
  kind: Kind;
  left: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
};

const GLYPH: Record<Kind, string> = {
  heart: "❤️",
  petal: "🌹",
  sparkle: "✨",
  glow: "⭐",
};

const COUNTS: Record<Kind, number> = {
  heart: 7,
  petal: 6,
  sparkle: 9,
  glow: 5,
};

// Client-only celebratory burst, triggered once on mount. Random is fine
// here (no SSR involved — it only ever mounts after a user click).
function makePieces(): Piece[] {
  const pieces: Piece[] = [];
  (Object.keys(COUNTS) as Kind[]).forEach((kind) => {
    for (let i = 0; i < COUNTS[kind]; i++) {
      pieces.push({
        kind,
        left: 6 + Math.random() * 88,
        bottom: -6 - Math.random() * 10,
        size: kind === "sparkle" || kind === "glow" ? 10 + Math.random() * 10 : 16 + Math.random() * 14,
        duration: 3.4 + Math.random() * 2.6,
        delay: Math.random() * 1.1,
        drift: (Math.random() - 0.5) * 60,
        rotate: (Math.random() - 0.5) * 50,
      });
    }
  });
  return pieces;
}

export default function Celebration() {
  const pieces = useMemo(() => makePieces(), []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            fontSize: p.size,
            filter:
              p.kind === "sparkle" || p.kind === "glow"
                ? "drop-shadow(0 0 6px rgba(255,238,205,0.85))"
                : "drop-shadow(0 0 8px rgba(217,138,134,0.55))",
          }}
          initial={{ opacity: 0, y: 0, x: 0, rotate: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.95, 0.9, 0],
            y: [-0, -160 - p.size * 3],
            x: [0, p.drift],
            rotate: [0, p.rotate],
            scale: [0.6, 1, 0.94],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: SOFT_EASE,
          }}
        >
          {GLYPH[p.kind]}
        </motion.span>
      ))}
    </div>
  );
}
