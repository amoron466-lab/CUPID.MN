"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "./Hero";
import EnvelopeReveal from "./EnvelopeReveal";
import { getSongAudio, unlockAudio } from "@/lib/sound";

export type Phase = "home" | "sentence1" | "sentence2" | "envelope";

const SENTENCE_1 = "Сайн уу, сайхан амьтан минь.";
const SENTENCE_2 = "Чамаас нэг юм асуух гээдээ хө...";

// Quiet target volume the background song fades up to — not full blast.
const SONG_TARGET_VOLUME = 0.09;
const SONG_FADE_MS = 2500;
const SONG_FADE_OUT_MS = 500;

export default function HomeExperience({
  phase,
  setPhase,
}: {
  phase: Phase;
  setPhase: (phase: Phase) => void;
}) {
  // Belt-and-suspenders unlock: the Begin button's own click handler below
  // already calls unlockAudio() synchronously, but a plain window-level
  // listener for the very first pointer/keyboard interaction anywhere means
  // audio still gets unlocked even if that flow ever changes or a visitor
  // reaches this screen by some other path. unlockAudio() is idempotent, so
  // this never double-primes anything.
  useEffect(() => {
    function handleFirstGesture() {
      unlockAudio();
    }
    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, []);

  // Starts the background song the instant Start is pressed — the click is
  // the user gesture browsers require before audio can play — and fades its
  // volume up from silence instead of starting at full volume.
  function playSong() {
    const audio = getSongAudio();
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0;
    void audio.play().catch(() => {});

    const fadeStart = performance.now();
    function fadeStep(now: number) {
      const audio = getSongAudio();
      if (!audio) return;
      const t = Math.min(1, (now - fadeStart) / SONG_FADE_MS);
      audio.volume = SONG_TARGET_VOLUME * t;
      if (t < 1) requestAnimationFrame(fadeStep);
    }
    requestAnimationFrame(fadeStep);
  }

  // Fades the song out and pauses it, resolving only once that's actually
  // done — the NO flow awaits this so the page reload can't happen while
  // the song is still audibly playing.
  function stopSong(): Promise<void> {
    const audio = getSongAudio();
    if (!audio || audio.paused) return Promise.resolve();

    const startVolume = audio.volume;
    const fadeStart = performance.now();
    return new Promise((resolve) => {
      function fadeOutStep(now: number) {
        const audio = getSongAudio();
        if (!audio) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - fadeStart) / SONG_FADE_OUT_MS);
        audio.volume = startVolume * (1 - t);
        if (t < 1) {
          requestAnimationFrame(fadeOutStep);
        } else {
          audio.pause();
          audio.currentTime = 0;
          resolve();
        }
      }
      requestAnimationFrame(fadeOutStep);
    });
  }

  useEffect(() => {
    if (phase === "sentence1") {
      const t = setTimeout(() => setPhase("sentence2"), 3500);
      return () => clearTimeout(t);
    }
    if (phase === "sentence2") {
      const t = setTimeout(() => setPhase("envelope"), 4000);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase]);

  return (
    <AnimatePresence mode="wait">
      {phase === "home" && (
        <motion.div
          key="home"
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Hero
            onBegin={() => {
              // Must run synchronously, first, inside this click handler —
              // iOS Safari only counts audio unlocking as user-initiated
              // while still inside the original gesture's call stack.
              unlockAudio();
              playSong();
              setPhase("sentence1");
            }}
          />
        </motion.div>
      )}

      {phase === "sentence1" && <Sentence key="sentence1" text={SENTENCE_1} />}

      {phase === "sentence2" && <Sentence key="sentence2" text={SENTENCE_2} />}

      {phase === "envelope" && (
        <motion.div
          key="envelope"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-dvh items-center justify-center overflow-hidden px-6"
        >
          <EnvelopeReveal onSongStop={stopSong} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Sentence({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: "blur(22px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(18px)" }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-dvh items-center justify-center overflow-hidden px-6"
    >
      <p className="max-w-4xl text-balance text-center font-display font-light italic leading-[1.22] tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8F5] via-[#FFE7DF] to-[#F7B9AF] text-shadow-soft pr-[0.03em] text-[2.8rem] sm:text-[3.2rem] lg:text-[4.2rem] xl:text-[4.8rem]">
        {text}
      </p>
    </motion.div>
  );
}
