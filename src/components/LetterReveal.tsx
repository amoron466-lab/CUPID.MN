"use client";

import { useEffect, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import OpenInvitation from "./OpenInvitation";

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

// Matches the envelope's rect top (y=22 of a 150-tall viewBox) — the seam
// the letter has to clear before it reads as "above" the envelope.
const RECT_TOP_PCT = 14.7;

const LETTER_WIDTH_PCT = 75;
const FOLDED_HEIGHT_PCT = 40.5;

const HIDDEN_TOP_PCT = 42;
const REST_TOP_PCT = RECT_TOP_PCT - 0.58 * FOLDED_HEIGHT_PCT;
// A small, believable lift — not a journey off past the envelope. The
// unfolded invitation is a separate element entirely (see below), so the
// folded letter no longer needs to travel far before handing off to it.
const LIFT_TOP_PCT = REST_TOP_PCT - 17;

// The opened invitation's box, sized generously but always anchored inside
// the wrap's own 0-100% box so it's guaranteed on-screen at any viewport.
const INVITATION_TOP_PCT = 6;
const INVITATION_HEIGHT_PCT = 88;
const INVITATION_WIDTH_PCT = 87;

type Stage = "hidden" | "rising" | "risen" | "lifting" | "revealed";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function LetterReveal({
  active,
  portalTarget,
  onNoReset,
  onSongStop,
}: {
  active: boolean;
  // Element to mount the opened invitation into. It must NOT be a descendant
  // of the (small, envelope-sized) node LetterReveal itself lives in — the
  // opened invitation needs its own layout context, sized off a bigger box,
  // not the folded letter's percentage-of-envelope box.
  portalTarget: HTMLElement | null;
  // Closes the envelope flap back up — invoked once the NO-flow fold-back
  // finishes, right before the whole page reloads.
  onNoReset?: () => Promise<void>;
  // Stops the background song, resolving once it's actually silent — the
  // NO flow awaits this before reloading the page.
  onSongStop?: () => Promise<void>;
}) {
  const [stage, setStage] = useState<Stage>("hidden");

  const position = useAnimation();

  const liftY = useSpring(0, { stiffness: 255, damping: 18 });
  const glow = useSpring(0, { stiffness: 195, damping: 22 });
  const tiltX = useSpring(0, { stiffness: 225, damping: 16 });

  const shadowY = useTransform(liftY, [-14, 0], [22, 12]);
  const shadowBlur = useTransform(liftY, [-14, 0], [42, 22]);
  const shadowOpacity = useTransform(liftY, [-14, 0], [0.34, 0.22]);
  const dropShadow = useMotionTemplate`drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(20, 6, 4, ${shadowOpacity}))`;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function rise() {
      await sleep(300);
      if (cancelled) return;
      setStage("rising");
      await position.start({
        top: `${REST_TOP_PCT}%`,
        rotate: 0,
        scale: 1,
        transition: { duration: 1.1, ease: PREMIUM_EASE },
      });
      if (!cancelled) setStage("risen");
    }

    rise();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function handlePointerEnter() {
    if (stage !== "risen") return;
    liftY.set(-14);
    glow.set(1);
    tiltX.set(-4);
  }

  function handlePointerLeave() {
    if (stage !== "risen") return;
    liftY.set(0);
    glow.set(0);
    tiltX.set(0);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (stage !== "risen") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    tiltX.set(-4 + nx * -2);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    void handleClick();
  }

  async function handleClick() {
    if (stage !== "risen") return;
    setStage("lifting");
    liftY.set(0);
    tiltX.set(0);
    glow.set(1);

    // the folded letter lifts — a bigger, more physical motion that
    // builds anticipation before handing off to the opened invitation
    await position.start({
      top: `${LIFT_TOP_PCT}%`,
      rotate: 0.6,
      scale: 1.14,
      transition: { duration: 0.62, ease: PREMIUM_EASE },
    });

    // hand off to the separate, fully opened invitation via a crossfade
    setStage("revealed");
  }

  const interactive = stage === "risen";
  const foldedVisible = stage !== "revealed";

  return (
    <>
      <AnimatePresence>
        {foldedVisible && (
        <motion.div
          key="folded-letter"
          className={`absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-[10px] border ${
            interactive ? "cursor-pointer" : "cursor-default"
          }`}
          style={{
            top: `${HIDDEN_TOP_PCT}%`,
            height: `${FOLDED_HEIGHT_PCT}%`,
            width: `${LETTER_WIDTH_PCT}%`,
            rotate: -1.6,
            scale: 0.94,
            borderColor: "rgba(122, 70, 48, 0.16)",
            backgroundImage:
              "linear-gradient(180deg, #fffaf4 0%, #fbecdf 55%, #f2dcc7 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -14px 22px -16px rgba(122,70,48,0.3)",
            filter: dropShadow,
            y: liftY,
            rotateX: tiltX,
            pointerEvents: "auto",
            touchAction: "manipulation",
          }}
          animate={position}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: "blur(10px)",
            transition: { duration: 0.36, ease: PREMIUM_EASE },
          }}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? "Open letter" : undefined}
          aria-hidden={stage === "hidden"}
        >
          {/* subtle paper grain */}
          <div className="grain-overlay pointer-events-none absolute inset-0 opacity-60" />

          {/* soft warm light that blooms on hover */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[20%] blur-2xl"
            style={{
              opacity: glow,
              background:
                "radial-gradient(circle, rgba(255,238,205,0.55) 0%, rgba(255,238,205,0) 70%)",
            }}
          />

          {/* fold crease */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(122,70,48,0) 0%, rgba(122,70,48,0.35) 50%, rgba(122,70,48,0) 100%)",
            }}
          />
        </motion.div>
        )}
      </AnimatePresence>

      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {stage === "revealed" && (
              <motion.div
                key="reveal-glow"
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  width: "70%",
                  height: "60%",
                  zIndex: 15,
                  background:
                    "radial-gradient(circle, rgba(255,238,205,0.55) 0%, rgba(227,189,143,0.22) 45%, rgba(227,189,143,0) 72%)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.9, 0.4], scale: [0.5, 1.3, 1.15] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: PREMIUM_EASE }}
              />
            )}
            {stage === "revealed" && (
              <motion.div
                key="open-invitation"
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: `${INVITATION_TOP_PCT}%`,
                  height: `${INVITATION_HEIGHT_PCT}%`,
                  width: `${INVITATION_WIDTH_PCT}%`,
                  // the folded letter intentionally tucks behind the envelope body
                  // (z-index:auto, same as EnvelopeBody/flap) so it looks like it's
                  // emerging from the seam. The opened invitation is a much bigger
                  // card that overlaps the envelope's own rect, so it needs to sit
                  // above those SVGs regardless of DOM order.
                  zIndex: 20,
                  pointerEvents: "auto",
                }}
                initial={{ opacity: 0, y: 84, scale: 0.3, rotate: -2, filter: "blur(26px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }}
                transition={{
                  opacity: { duration: 0.55, ease: PREMIUM_EASE, delay: 0.05 },
                  filter: { duration: 1.15, ease: PREMIUM_EASE, delay: 0.05 },
                  scale: { type: "spring", stiffness: 44, damping: 12, mass: 1, delay: 0.05 },
                  y: { type: "spring", stiffness: 44, damping: 12, mass: 1, delay: 0.05 },
                  rotate: { type: "spring", stiffness: 44, damping: 12, mass: 1, delay: 0.05 },
                }}
              >
                <OpenInvitation
                  className="h-full w-full"
                  onNoReset={onNoReset}
                  onSongStop={onSongStop}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget
        )}
    </>
  );
}
