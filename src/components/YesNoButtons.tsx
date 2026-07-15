"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { animate as animateValue, motion, useMotionValue } from "framer-motion";

const DODGE_RADIUS = 80;
const TOTAL_ESCAPES = 6;
const EDGE_MARGIN = 32;
const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type Rect = { left: number; top: number; width: number; height: number };

// Picks a random point on screen at least `minDist` away from `from`,
// staying clear of the edges. Falls back to the farthest candidate found
// if nothing clears `minDist` (e.g. on a tiny viewport).
function pickTarget(from: { x: number; y: number }, size: Rect, minDist: number) {
  const maxLeft = Math.max(EDGE_MARGIN, window.innerWidth - size.width - EDGE_MARGIN);
  const maxTop = Math.max(EDGE_MARGIN, window.innerHeight - size.height - EDGE_MARGIN);
  let best = { left: EDGE_MARGIN, top: EDGE_MARGIN };
  let bestDist = -1;
  for (let i = 0; i < 10; i++) {
    const left = rand(EDGE_MARGIN, maxLeft);
    const top = rand(EDGE_MARGIN, maxTop);
    const dist = Math.hypot(left - from.x, top - from.y);
    if (dist > bestDist) {
      best = { left, top };
      bestDist = dist;
    }
    if (dist >= minDist) return { left, top };
  }
  return best;
}

// Shared by YES, its NO placeholder, and the portaled NO button — a plain
// CSS equal-split (flex-1 + min-w-0) guarantees identical width and height
// with no JS measurement involved. An earlier version measured natural
// sizes at runtime to force a matching pixel width, but that value didn't
// survive flexbox's own shrink behavior once the row ran out of space: each
// button has a different min-content floor (its own text's natural
// unshrinkable width), so the row shrank them unevenly despite an identical
// target width, clipping one of them. flex-1 alone hits the same wall —
// browsers refuse to shrink a flex item below its own min-content unless
// min-width is explicitly reset, so min-w-0 is what actually makes both
// items split the row exactly 50/50 every time, regardless of content.
const BUTTON_CLASS =
  "flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full font-classic font-medium uppercase disabled:cursor-default";
const BUTTON_STYLE = {
  letterSpacing: "0.12em",
  fontSize: "clamp(0.78rem, 2.5vw, 1rem)",
  padding: "clamp(0.55rem, 2vw, 0.85rem) clamp(1.3rem, 4.5vw, 2.1rem)",
  // guarantees a 48px touch target on small screens without changing the
  // visual size anywhere the clamp() above already exceeds it
  minHeight: "48px",
  minWidth: "48px",
  touchAction: "manipulation",
} as const;

export default function YesNoButtons({
  locked,
  onYes,
  onNoCaught,
  folding = false,
  yesText,
  noText,
}: {
  locked: boolean;
  onYes: () => void;
  onNoCaught: () => void;
  // True once the invitation card starts folding back into the envelope —
  // fades the portaled NO button out in step so it doesn't linger on
  // screen after the card is gone.
  folding?: boolean;
  yesText: string;
  noText: string;
}) {
  const placeholderRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  // Every animated property on the portaled button lives on its own raw
  // MotionValue, driven imperatively via the standalone `animate()` helper.
  // An earlier version used useAnimation()/AnimationControls for
  // opacity+scale+shake — for reasons that didn't reproduce outside this
  // exact portal+motion-value combination, .start() on that controls object
  // never resolved and the button stayed permanently invisible. Raw motion
  // values (used for position below) don't have that problem, so everything
  // moved onto them.
  const leftMV = useMotionValue(0);
  const topMV = useMotionValue(0);
  const widthMV = useMotionValue(0);
  const heightMV = useMotionValue(0);
  const xMV = useMotionValue(0);
  const opacityMV = useMotionValue(0);
  const scaleMV = useMotionValue(1);

  const [attempt, setAttempt] = useState(0);
  const [caught, setCaught] = useState(false);
  const [ready, setReady] = useState(false);

  const baseRef = useRef<Rect | null>(null);
  const posRef = useRef({ left: 0, top: 0 });
  const dodging = useRef(false);
  // Requires the pointer to actually clear DODGE_RADIUS before the next
  // escape can fire. Without this, a jump that lands close to the cursor
  // (e.g. pickTarget's own too-close fallback on a small viewport, or a
  // pointer that keeps chasing the button as it moves) re-triggers the next
  // escape immediately — burning through several of the 6 escapes in one
  // continuous approach instead of one per real attempt, which makes the
  // "give up and go home" case fire long before the 7th click.
  const primed = useRef(true);
  // Flips the instant the first dodge starts (synchronously, alongside
  // dodging.current) and never resets. The sync loop below only checks
  // `attempt > 0` once, when its effect is set up — its recursive rAF loop
  // keeps running every frame afterward based solely on `dodging.current`.
  // When a dodge finishes, dodging.current clears to false *before* React
  // commits the re-render that would cancel that stale loop, so for a frame
  // or two the old loop would otherwise see dodging.current === false and
  // snap the button straight back to the placeholder's original position.
  // Checking this ref inside sync()'s per-frame body (not just at effect
  // setup) closes that gap regardless of React's render timing.
  const everDodgedRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const exhausted = attempt >= TOTAL_ESCAPES;

  // The real, clickable NO button lives in a body-level portal (see below)
  // so its dodge can roam the whole viewport instead of being clipped by
  // the invitation card's overflow-hidden — which also means it's detached
  // from the row's flex layout and can't get its size from flex-1 the way
  // the placeholder does. Until the first dodge, keep both its position AND
  // size glued to the placeholder every frame — the card's own entrance
  // spring is still moving/scaling for a second or so after mount, and a
  // one-shot measurement would lock in whatever transient size/position
  // existed at that instant instead of where the card actually settles.
  useEffect(() => {
    if (attempt > 0) return;
    let frame: number;

    function sync() {
      if (placeholderRef.current && !dodging.current && !everDodgedRef.current) {
        const r = placeholderRef.current.getBoundingClientRect();
        const rect = { left: r.left, top: r.top, width: r.width, height: r.height };
        baseRef.current = rect;
        posRef.current = { left: rect.left, top: rect.top };
        leftMV.set(rect.left);
        topMV.set(rect.top);
        widthMV.set(rect.width);
        heightMV.set(rect.height);
        if (!hasEnteredRef.current) {
          hasEnteredRef.current = true;
          setReady(true);
        }
      }
      frame = requestAnimationFrame(sync);
    }

    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [attempt, leftMV, topMV, widthMV, heightMV]);

  // Fades the portaled NO button in once it has actually mounted (`ready`
  // flips true a render *after* the sync loop above decides it's time).
  useEffect(() => {
    if (!ready) return;
    animateValue(opacityMV, 1, { duration: 0.55, delay: 0.05, ease: PREMIUM_EASE });
  }, [ready, opacityMV]);

  async function runEscape(index: number) {
    if (!baseRef.current) return;
    const size = baseRef.current;
    const from = { x: posRef.current.left, y: posRef.current.top };
    const minDim = Math.min(window.innerWidth, window.innerHeight);

    async function jumpTo(minDist: number, transition: object) {
      const target = pickTarget(from, size, minDist);
      posRef.current = target;
      await Promise.all([
        animateValue(leftMV, target.left, transition),
        animateValue(topMV, target.top, transition),
      ]);
    }

    switch (index) {
      case 0:
        // Attempt 1 — simple smooth slide, clearly across the card
        await jumpTo(minDim * 0.35, { type: "spring", stiffness: 200, damping: 20 });
        break;
      case 1:
        // Attempt 2 — slides much further, well off to the side
        await jumpTo(minDim * 0.55, { type: "spring", stiffness: 200, damping: 20 });
        break;
      case 2:
        // Attempt 3 — escapes noticeably faster
        await jumpTo(minDim * 0.6, { type: "spring", stiffness: 520, damping: 25 });
        break;
      case 3:
        // Attempt 4 — shakes hard for ~300ms, then bolts
        await animateValue(xMV, [0, -22, 20, -18, 16, -10, 0], {
          duration: 0.3,
          ease: "easeInOut",
        });
        xMV.set(0);
        await jumpTo(minDim * 0.65, { type: "spring", stiffness: 420, damping: 22 });
        break;
      case 4:
        // Attempt 5 — plays dead for ~300ms, then rockets clear across the screen
        await sleep(300);
        await jumpTo(minDim * 0.85, { type: "spring", stiffness: 780, damping: 20 });
        break;
      case 5:
        // Attempt 6 — short, tired shuffle, then it gives up and drifts back
        // home so the 7th, successful click lands right where it started
        await jumpTo(minDim * 0.14, { type: "spring", stiffness: 100, damping: 28 });
        await sleep(250);
        posRef.current = { left: size.left, top: size.top };
        await Promise.all([
          animateValue(leftMV, size.left, { type: "spring", stiffness: 130, damping: 22 }),
          animateValue(topMV, size.top, { type: "spring", stiffness: 130, damping: 22 }),
        ]);
        break;
    }
  }

  useEffect(() => {
    if (!ready || locked || caught) return;

    function handleMove(e: globalThis.PointerEvent) {
      if (exhausted || dodging.current || !noRef.current) return;
      const rect = noRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist >= DODGE_RADIUS) {
        primed.current = true;
        return;
      }
      if (!primed.current) return;
      primed.current = false;
      dodging.current = true;
      everDodgedRef.current = true;
      void runEscape(attempt).then(() => {
        dodging.current = false;
        setAttempt((a) => a + 1);
      });
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, locked, caught, exhausted, attempt]);

  async function handleNoClick() {
    if (locked || caught || !exhausted) return;
    setCaught(true);
    onNoCaught();
  }

  // Touch has no hover, so `pointermove` proximity (used for mouse above)
  // never fires before a tap lands. Intercepting the touch on press — before
  // it resolves into a click — reproduces the same "dodges when approached"
  // gag for touch devices instead of letting the first tap catch it outright.
  function handleNoPointerDown(e: PointerEvent) {
    if (e.pointerType !== "touch") return;
    if (locked || caught || exhausted || dodging.current) return;
    e.preventDefault();
    primed.current = false;
    dodging.current = true;
    everDodgedRef.current = true;
    void runEscape(attempt).then(() => {
      dodging.current = false;
      setAttempt((a) => a + 1);
    });
  }

  useEffect(() => {
    if (!folding) return;
    animateValue(opacityMV, 0, { duration: 1, ease: PREMIUM_EASE });
    animateValue(scaleMV, 0.7, { duration: 1, ease: PREMIUM_EASE });
  }, [folding, opacityMV, scaleMV]);

  return (
    <div className="relative flex w-full max-w-[88%] items-center justify-center gap-[16%]">
      <motion.button
        type="button"
        disabled={locked}
        onClick={onYes}
        whileTap={{ scale: 0.94 }}
        className={`relative overflow-hidden ${BUTTON_CLASS}`}
        style={{
          ...BUTTON_STYLE,
          color: "#3a1608",
          backgroundImage: "linear-gradient(150deg, #f6dfae 0%, #dcb676 45%, #c8a165 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 6px -2px rgba(122,70,48,0.4), 0 8px 18px -8px rgba(80,50,10,0.55)",
        }}
      >
        <span className="relative z-10">{yesText}</span>
        <span
          aria-hidden
          className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
        />
      </motion.button>

      <button
        ref={placeholderRef}
        type="button"
        aria-hidden
        tabIndex={-1}
        className={`${BUTTON_CLASS} pointer-events-none opacity-0`}
        style={BUTTON_STYLE}
      >
        {noText}
      </button>

      {ready &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.button
            ref={noRef}
            type="button"
            disabled={locked}
            onClick={handleNoClick}
            onPointerDown={handleNoPointerDown}
            className={`fixed z-[75] overflow-hidden ${BUTTON_CLASS}`}
            style={{
              ...BUTTON_STYLE,
              width: widthMV,
              height: heightMV,
              left: leftMV,
              top: topMV,
              x: xMV,
              opacity: opacityMV,
              scale: scaleMV,
              color: "#3a1608",
              backgroundImage: "linear-gradient(150deg, #f6dfae 0%, #dcb676 45%, #c8a165 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 6px -2px rgba(122,70,48,0.4), 0 8px 18px -8px rgba(80,50,10,0.55)",
            }}
          >
            <span className="relative z-10">{noText}</span>
            <span
              aria-hidden
              className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
          </motion.button>,
          document.body
        )}
    </div>
  );
}
