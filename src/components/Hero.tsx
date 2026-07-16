"use client";

import { motion, type Variants } from "framer-motion";
import GlassCard from "./GlassCard";
import Envelope from "./icons/Envelope";
import HeartOutline from "./icons/HeartOutline";
import Sparkle from "./icons/Sparkle";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.17, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(14px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero({ onBegin }: { onBegin?: () => void }) {
  return (
    <section className="relative flex h-stage flex-col items-center justify-center overflow-hidden px-10 pt-40 pb-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-3xl flex-col items-center text-center"
      >
        {/* focal illustration — reserved space for future interaction */}
        <motion.div
          variants={item}
          className="relative mt-14 flex h-[560px] w-full max-w-2xl items-center justify-center"
        >
          {/* glow beneath envelope, offset slightly off-center to avoid symmetry */}
          <div
            aria-hidden
            className="animate-glow-pulse absolute h-52 w-52 translate-x-[6%] translate-y-[4%] rounded-full bg-rose-400/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute h-32 w-32 -translate-x-[18%] -translate-y-[10%] rounded-full bg-gold-300/15 blur-2xl"
          />

          {/* sparkles */}
          <Sparkle className="animate-twinkle absolute left-[13%] top-[16%] h-3 w-3 text-gold-300/80" />
          <Sparkle
            className="animate-twinkle absolute right-[15%] top-[32%] h-2.5 w-2.5 text-gold-300/70"
            style={{ animationDelay: "1.4s" }}
          />
          <Sparkle
            className="animate-twinkle absolute bottom-[20%] left-[24%] h-2 w-2 text-blush-200/70"
            style={{ animationDelay: "2.6s" }}
          />

          {/* tiny hearts */}
          <HeartOutline
            className="animate-heart-drift absolute left-[9%] bottom-[24%] h-4 w-4 text-rose-400/60"
            style={{ animationDelay: "0.4s" }}
          />
          <HeartOutline
            className="animate-heart-drift absolute right-[11%] bottom-[34%] h-3 w-3 text-rose-400/50"
            style={{ animationDelay: "1.8s" }}
          />
          <HeartOutline
            className="animate-heart-drift absolute right-[24%] top-[14%] h-3.5 w-3.5 text-rose-400/45"
            style={{ animationDelay: "3s" }}
          />

          {/* envelope — tilted a fraction so nothing reads as perfectly centered */}
          <div
            className="animate-float-y relative z-10 w-[58%] max-w-[420px] -rotate-[2deg] drop-shadow-[0_24px_44px_rgba(0,0,0,0.55)]"
          >
            <Envelope className="w-full" />
          </div>
        </motion.div>

        {/* continue action */}
        <motion.div variants={item} className="mt-[3.25rem]">
          {/* ambient glow beneath the button, blooms softly on hover */}
          <div className="group/wrap relative inline-block">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 -bottom-2 top-1 -z-10 rounded-full bg-rose-400/25 opacity-0 blur-xl transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/wrap:opacity-70"
            />
            <GlassCard className="group relative overflow-hidden rounded-full p-[1px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] active:translate-y-0 active:duration-150">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-400/0 via-rose-400/45 to-rose-400/0 opacity-50 transition-opacity duration-500 group-hover:opacity-100"
              />
              <button
                type="button"
                onClick={onBegin}
                style={{ touchAction: "manipulation" }}
                className="relative flex items-center gap-3 overflow-hidden rounded-full bg-wine-900/60 px-9 py-4 text-ivory shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_10px_28px_rgba(0,0,0,0.4)] transition-[colors,box-shadow] duration-300 hover:bg-wine-900/35 group-active:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_4px_14px_rgba(0,0,0,0.35)]"
              >
                {/* shimmer sweep, visible only on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <span className="animate-shimmer-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                </span>
                <span className="relative font-classic text-[20px] italic tracking-[0.02em] text-shadow-soft">
                  Эхлэх
                </span>
                <span
                  aria-hidden
                  className="relative text-rose-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                >
                  →
                </span>
              </button>
            </GlassCard>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
