"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "./Hero";
import EnvelopeReveal from "./EnvelopeReveal";

export type Phase = "home" | "sentence1" | "sentence2" | "envelope";

const SENTENCE_1 = "Сайн уу, сайхан амьтан минь.";
const SENTENCE_2 = "Чамаас нэг юм асуух гээдээ хө...";

export default function HomeExperience({
  phase,
  setPhase,
}: {
  phase: Phase;
  setPhase: (phase: Phase) => void;
}) {
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
          <Hero onBegin={() => setPhase("sentence1")} />
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
          <EnvelopeReveal />
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
