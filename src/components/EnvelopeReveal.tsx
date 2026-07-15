"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";
import EnvelopeBody from "./icons/EnvelopeBody";
import EnvelopeFlap from "./icons/EnvelopeFlap";
import HeartOutline from "./icons/HeartOutline";
import Sparkle from "./icons/Sparkle";
import LetterReveal from "./LetterReveal";

const PARTICLE_COUNT = 10;
const BURST_COUNT = 16;
const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;
const SOFT_EASE = [0.22, 0.61, 0.36, 1] as const;

type Stage = "entering" | "idle" | "opening" | "opened";

// Deterministic pseudo-random so server and client markup match exactly.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = seeded(i, 1) * Math.PI * 2;
  const radius = 30 + seeded(i, 2) * 30;
  return {
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius * 0.7,
    size: 1.5 + seeded(i, 3) * 2,
    duration: 3.6 + seeded(i, 4) * 3,
    delay: seeded(i, 5) * 1.8,
  };
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// celebratory burst of hearts + sparkles that fires once when the letter opens
const burst = Array.from({ length: BURST_COUNT }, (_, i) => {
  const angle = (i / BURST_COUNT) * Math.PI * 2 + seeded(i, 7) * 0.6;
  const distance = (70 + seeded(i, 8) * 90) * 3;
  return {
    angle,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.75 - 60,
    size: (10 + seeded(i, 9) * 10) * 3,
    rotate: (seeded(i, 10) - 0.5) * 90,
    delay: seeded(i, 11) * 0.25,
    isHeart: i % 2 === 0,
  };
});

export default function EnvelopeReveal() {
  const [stage, setStage] = useState<Stage>("entering");

  const envelope = useAnimation();
  const flap = useAnimation();
  const light = useAnimation();

  const congratsAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio("/sounds/congrats.mp4");
    audio.preload = "auto";
    audio.volume = 0.5;
    congratsAudioRef.current = audio;
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  // The opened invitation portals here instead of into wrapRef — wrapRef is
  // capped to the envelope's own small size (aspect-[4/3] w-[62%] max-w-[460px]),
  // so anything nested inside it inherits that box. This outer div is the
  // full h-[680px] stage, giving the invitation its own layout context.
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);

  // hover tilt + lift, all spring-smoothed for a handcrafted, unhurried feel
  const rotateX = useSpring(0, { stiffness: 220, damping: 15 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 15 });
  const liftY = useSpring(0, { stiffness: 250, damping: 18 });
  const hoverGlow = useSpring(0, { stiffness: 190, damping: 22 });

  const shadowX = useTransform(rotateY, [-8, 8], [-16, 16]);
  const shadowBlur = useTransform(liftY, [-26, 0], [58, 34]);
  const shadowOpacity = useTransform(liftY, [-26, 0], [0.28, 0.5]);
  const dropShadow = useMotionTemplate`drop-shadow(${shadowX}px 26px ${shadowBlur}px rgba(0,0,0,${shadowOpacity}))`;

  // spotlight drifts a whisper toward the cursor — subtle, not a spotlight-follow
  const spotlightX = useTransform(rotateY, [-8, 8], [-10, 10]);
  const spotlightY = useTransform(rotateX, [-6, 6], [8, -8]);

  useEffect(() => {
    let cancelled = false;

    async function enter() {
      await envelope.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.9, ease: PREMIUM_EASE },
      });
      if (!cancelled) setStage("idle");
    }

    enter();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (stage !== "idle" || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rotateY.set(nx * 8);
    rotateX.set(-ny * 6);
  }

  function handlePointerEnter() {
    if (stage !== "idle") return;
    liftY.set(-10);
    hoverGlow.set(1);
  }

  function handlePointerLeave() {
    if (stage !== "idle") return;
    rotateX.set(0);
    rotateY.set(0);
    liftY.set(0);
    hoverGlow.set(0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    void handleClick();
  }

  async function handleClick() {
    if (stage !== "idle") return;
    setStage("opening");

    const audio = congratsAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }

    rotateX.set(0);
    rotateY.set(0);
    hoverGlow.set(1);
    liftY.set(-22);

    await sleep(330);

    const flapDone = flap.start({
      rotateX: -108,
      transition: { duration: 1.3, ease: PREMIUM_EASE },
    });
    light.start({
      opacity: 1,
      scale: 1.2,
      transition: { duration: 1.6, ease: SOFT_EASE, delay: 0.4 },
    });

    await flapDone;
    setStage("opened");
  }

  // Reverse of handleClick's open sequence — used to gently close the
  // envelope back up after a NO-flow reset, right before the whole site
  // reloads to look like a first-time visit.
  async function closeEnvelope() {
    light.start({
      opacity: 0,
      scale: 0.6,
      transition: { duration: 0.9, ease: SOFT_EASE },
    });
    rotateX.set(0);
    rotateY.set(0);
    liftY.set(0);
    hoverGlow.set(0);

    await flap.start({
      rotateX: 0,
      transition: { duration: 1.1, ease: PREMIUM_EASE },
    });
  }

  const interactive = stage === "idle";

  return (
    <div
      ref={setStageEl}
      className="relative flex h-[680px] max-h-[80dvh] w-full max-w-2xl items-center justify-center sm:h-[800px]"
    >
      {/* soft spotlight behind the envelope, drifting a touch with the tilt */}
      <motion.div
        aria-hidden
        className="pointer-events-none animate-glow-pulse absolute h-72 w-72 rounded-full bg-rose-400/25 blur-3xl"
        style={{ x: spotlightX, y: spotlightY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-40 w-40 -translate-y-[8%] rounded-full bg-gold-300/15 blur-2xl"
        style={{ x: spotlightX, y: spotlightY }}
      />

      {/* tiny particles drifting around the envelope — brighten once it opens */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-gold-300"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            boxShadow:
              stage === "opened" || stage === "opening"
                ? "0 0 9px rgba(255,238,205,0.85)"
                : "0 0 6px rgba(227,189,143,0.5)",
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity:
              stage === "opened" || stage === "opening"
                ? [0, 0.9, 0]
                : [0, 0.6, 0],
            y: [-4, -20],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* warm light emerging from inside, once the flap opens */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={light}
        className="pointer-events-none absolute h-56 w-56 rounded-full blur-2xl"
        style={{
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle, rgba(255,238,205,0.78) 0%, rgba(251,228,187,0.32) 45%, rgba(227,189,143,0) 72%)",
        }}
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.6 }}
        animate={light}
        className="pointer-events-none absolute h-16 w-16 rounded-full blur-md"
        style={{
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle, rgba(255,247,225,0.9) 0%, rgba(255,238,205,0.28) 60%, rgba(255,238,205,0) 100%)",
        }}
      />

      {/* celebratory burst — hearts and sparkles fly outward once the letter opens */}
      <AnimatePresence>
        {stage === "opened" && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            {burst.map((b, i) =>
              b.isHeart ? (
                <motion.div
                  key={i}
                  className="absolute text-rose-400"
                  style={{
                    filter:
                      "drop-shadow(0 0 14px rgba(217,138,134,0.95)) drop-shadow(0 0 30px rgba(217,138,134,0.6))",
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    x: b.x,
                    y: b.y,
                    scale: 1.7,
                    rotate: b.rotate,
                  }}
                  transition={{
                    duration: 1,
                    delay: b.delay,
                    ease: SOFT_EASE,
                  }}
                >
                  <HeartOutline style={{ width: b.size, height: b.size }} />
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  className="absolute text-gold-300"
                  style={{
                    filter:
                      "drop-shadow(0 0 16px rgba(255,238,205,0.95)) drop-shadow(0 0 34px rgba(227,189,143,0.7))",
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    x: b.x,
                    y: b.y,
                    scale: 1.7,
                    rotate: b.rotate,
                  }}
                  transition={{
                    duration: 0.85,
                    delay: b.delay,
                    ease: SOFT_EASE,
                  }}
                >
                  <Sparkle style={{ width: b.size * 0.8, height: b.size * 0.8 }} />
                </motion.div>
              )
            )}
          </div>
        )}
      </AnimatePresence>

      {/* envelope — the only interactive object on the page */}
      <motion.div
        ref={wrapRef}
        initial={{ opacity: 0, y: 46, scale: 0.86 }}
        animate={envelope}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label={interactive ? "Open envelope" : undefined}
        className={`relative z-10 aspect-[4/3] w-[62%] max-w-[460px] -rotate-[2deg] ${
          interactive ? "cursor-pointer" : "cursor-default"
        }`}
        style={{
          y: liftY,
          rotateX,
          rotateY,
          perspective: 900,
          filter: dropShadow,
          // once opened, the envelope itself steps aside so the letter (which
          // sits behind it, poking through the transparent svg margins) is
          // the only clickable/hoverable thing left
          pointerEvents: stage === "opened" ? "none" : "auto",
          touchAction: "manipulation",
        }}
      >
        {/* subtle glow that blooms as the cursor arrives */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-[28%] bg-rose-400/30 blur-2xl"
          style={{ opacity: hoverGlow }}
        />

        <LetterReveal
          active={stage === "opened"}
          portalTarget={stageEl}
          onNoReset={closeEnvelope}
        />

        <EnvelopeBody className="relative w-full" />

        {/* wax seal catching the light on hover */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[39%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md"
          style={{
            opacity: hoverGlow,
            background:
              "radial-gradient(circle, rgba(255,243,217,0.8) 0%, rgba(255,243,217,0) 70%)",
          }}
        />

        <motion.div
          initial={{ rotateX: 0 }}
          animate={flap}
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 14.7%",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <EnvelopeFlap className="w-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
