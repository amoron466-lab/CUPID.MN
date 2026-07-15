"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { createPortal } from "react-dom";
import Sparkle from "./icons/Sparkle";
import InvitationFrame from "./icons/InvitationFrame";
import YesNoButtons from "./YesNoButtons";
import Celebration from "./Celebration";
import { playHeartbeatThump, playSparkleChime } from "@/lib/sound";
import { useSiteConfig } from "@/components/SiteConfigContext";

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;
const SOFT_EASE = [0.22, 0.61, 0.36, 1] as const;

type Stage = "asking" | "celebrating" | "message" | "details";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The fully opened invitation — a vintage-luxury card in its own right,
// not a scaled-up copy of the folded letter. Location / date / time are
// left as empty placeholders for now; they're filled in dynamically later.
export default function OpenInvitation({
  className = "",
  onNoReset,
}: {
  className?: string;
  // Closes the envelope back up, called once the NO-flow fold-back finishes.
  onNoReset?: () => Promise<void>;
}) {
  const config = useSiteConfig();
  const [stage, setStage] = useState<Stage>("asking");
  const [locked, setLocked] = useState(false);
  const [detailStep, setDetailStep] = useState(0);
  const [messageVariant, setMessageVariant] = useState<"main" | "alt">("main");

  const cardPulse = useAnimation();
  const glowPulse = useAnimation();
  const paperPulse = useAnimation();
  const scrimPulse = useAnimation();
  const [scrimActive, setScrimActive] = useState(false);

  // NO-flow: frozen once the button is finally caught, folding the card back
  // out of view once the fail sound finishes.
  const [frozen, setFrozen] = useState(false);
  const [noMessageVisible, setNoMessageVisible] = useState(false);
  const [folding, setFolding] = useState(false);
  const foldControls = useAnimation();
  const failAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/fail.mp4");
    audio.preload = "auto";
    failAudioRef.current = audio;
  }, []);

  function playFailSound(): Promise<void> {
    return new Promise((resolve) => {
      const audio = failAudioRef.current;
      if (!audio) {
        resolve();
        return;
      }
      const onEnded = () => {
        audio.removeEventListener("ended", onEnded);
        resolve();
      };
      audio.currentTime = 0;
      audio.addEventListener("ended", onEnded);
      audio.play().catch(() => {
        audio.removeEventListener("ended", onEnded);
        resolve();
      });
    });
  }

  async function handleNoCaught() {
    setFrozen(true);
    setNoMessageVisible(true);

    await sleep(300);
    await playFailSound();

    // the NO button lives in a document.body portal (so its dodge can roam
    // the viewport) — it needs to be told to fade out in step with the
    // card's own fold-back, or it's left floating on screen after the card
    // is already gone.
    setFolding(true);

    await foldControls.start({
      scale: 0.25,
      y: 140,
      opacity: 0,
      rotate: -6,
      filter: "blur(16px)",
      transition: { duration: 1, ease: PREMIUM_EASE },
    });

    if (onNoReset) await onNoReset();

    await sleep(2000);
    window.location.reload();
  }

  async function handleYes() {
    if (locked) return;
    setLocked(true);
    setScrimActive(true);

    for (let beat = 0; beat < 2; beat++) {
      playHeartbeatThump();
      cardPulse.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.42, ease: SOFT_EASE },
      });
      glowPulse.start({
        opacity: [0, 0.85, 0],
        transition: { duration: 0.42, ease: SOFT_EASE },
      });
      paperPulse.start({
        opacity: [0, 0.32, 0],
        transition: { duration: 0.42, ease: SOFT_EASE },
      });
      scrimPulse.start({
        opacity: [0, 0.34, 0],
        transition: { duration: 0.42, ease: SOFT_EASE },
      });
      await sleep(450);
    }

    setScrimActive(false);
    setStage("celebrating");

    await sleep(400);
    playSparkleChime();
    setStage("message");
    setTimeout(() => setMessageVariant("alt"), 5000);

    await sleep(1000);
    setStage("details");
    setDetailStep(1);
    await sleep(550);
    setDetailStep(2);
    await sleep(550);
    setDetailStep(3);
    await sleep(550);
    setDetailStep(4);
  }

  function handleMapsClick() {
    window.open(config.mapsUrl, "_blank", "noopener,noreferrer");
  }

  const showButtons = stage === "asking" || stage === "celebrating";
  const showDetails = stage === "details";

  return (
    <motion.div
      initial={{ scale: 1, y: 0, opacity: 1, rotate: 0, filter: "blur(0px)" }}
      animate={foldControls}
      className={`relative ${className}`}
    >
      {frozen &&
        typeof document !== "undefined" &&
        createPortal(
          <div aria-hidden className="fixed inset-0 z-[70]" style={{ pointerEvents: "auto" }} />,
          document.body
        )}

      {/* warm glow that blooms around the card on each heartbeat — sits outside
          the card's own clipped edges so it reads as an aura, not paper texture */}
      <motion.div
        aria-hidden
        animate={glowPulse}
        initial={{ opacity: 0 }}
        className="pointer-events-none absolute -inset-8 rounded-[24px] blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(227,189,143,0.55) 0%, rgba(217,138,134,0.28) 55%, rgba(217,138,134,0) 78%)",
        }}
      />

      {scrimActive &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={scrimPulse}
            className="pointer-events-none fixed inset-0 z-[60] bg-black"
          />,
          document.body
        )}

      <motion.div
        animate={cardPulse}
        className="relative h-full w-full overflow-hidden rounded-[14px]"
        style={{
          backgroundImage:
            "linear-gradient(165deg, #fffcf6 0%, #fdf1e0 38%, #f5e0c0 72%, #eed4ac 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -22px 34px -24px rgba(122,70,48,0.24), inset 0 0 50px -12px rgba(96,44,26,0.19), inset 0 0 0 1px rgba(255,255,255,0.5), inset 0 0 0 2px rgba(120,60,30,0.1), inset 0 0 30px -6px rgba(60,24,16,0.1), 0 22px 46px -22px rgba(20,6,4,0.36), 0 10px 20px -10px rgba(20,6,4,0.2), 0 40px 80px -16px rgba(20,6,4,0.16)",
        }}
      >
        {/* fine paper fiber, tinted warm and blended into the stock */}
        <div className="paper-fiber pointer-events-none absolute inset-0 opacity-[0.3]" />

        {/* paper grain, embedded via multiply so it reads as texture, not an overlay */}
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.4]" />

        {/* soft vignette toward the edges, like a printed card catching light unevenly, with slightly deeper corners */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(125% 100% at 50% 42%, rgba(122,70,48,0) 52%, rgba(107,26,38,0.065) 88%, rgba(80,36,22,0.13) 100%)",
          }}
        />

        {/* whisper of a highlight, upper-left, as if catching window light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 22% 14%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        {/* paper brightening pulse, synced to the heartbeat */}
        <motion.div
          aria-hidden
          animate={paperPulse}
          initial={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 45%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        {/* original decorative border — wide faceted band, rose medallions, heart-in-arch crest */}
        <InvitationFrame className="pointer-events-none absolute inset-0 h-full w-full" />

        {stage === "celebrating" && <Celebration />}

        <div className="relative flex h-full flex-col items-center px-[18%] pt-[26%] pb-[19%] text-center">
          {/* heading, sitting just under the crest — kept quiet so it doesn't compete with the question */}
          <h2
            className="font-classic font-medium uppercase text-invite-burgundy/75"
            style={{
              letterSpacing: "0.36em",
              fontSize: "clamp(0.62rem, 2.05vw, 0.9rem)",
              textShadow: "0 1px 0 rgba(255,255,255,0.65), 0 -0.5px 0 rgba(107,26,38,0.12)",
            }}
          >
            Урилга
          </h2>

          <Sparkle className="mt-[4%] h-2.5 w-2.5 shrink-0 text-invite-gold/70" />

          {/* main question, in luxury calligraphy — crossfades to the success
              message once the yes-sequence resolves */}
          {/* fixed to roughly two lines of the question's own responsive
              font size (not just min-h-[2.6em], which only covered ~1 line) —
              otherwise swapping in the shorter one-line "brooooooo" message
              lets this box shrink, which shifts every button below it up */}
          <div
            className="relative mt-[6%] flex w-full items-center justify-center"
            style={{ minHeight: "clamp(5.3rem, 20vw, 8.9rem)" }}
          >
            <AnimatePresence mode="wait">
              {noMessageVisible ? (
                <motion.p
                  key="no-message"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: SOFT_EASE }}
                  className="font-script"
                  style={{
                    fontSize: "clamp(2.1rem, 7.8vw, 3.4rem)",
                    lineHeight: 1.16,
                    letterSpacing: "-0.01em",
                    rotate: "-1deg",
                    color: "#3a0a10",
                    textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                  }}
                >
                  brooooooo😭
                </motion.p>
              ) : stage !== "message" && stage !== "details" ? (
                <motion.p
                  key="question"
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: PREMIUM_EASE }}
                  className="font-script text-invite-wine"
                  style={{
                    fontSize: "clamp(2.3rem, 8.6vw, 3.85rem)",
                    lineHeight: 1.16,
                    letterSpacing: "-0.01em",
                    rotate: "-1deg",
                    textShadow:
                      "0 1px 0 rgba(255,255,255,0.55), 0 0 26px rgba(200,161,101,0.16)",
                  }}
                >
                  {config.question}
                </motion.p>
              ) : (
                <motion.div
                  key="message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, ease: PREMIUM_EASE }}
                  className="font-classic italic font-medium text-invite-wine"
                  style={{
                    fontSize: "clamp(2.025rem, 7.5vw, 3.075rem)",
                    lineHeight: 1.3,
                    letterSpacing: "0.005em",
                    textShadow: "0 1px 0 rgba(255,255,255,0.55), 0 0 20px rgba(200,161,101,0.16)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {messageVariant === "main" ? (
                      <motion.p
                        key="main"
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(6px)" }}
                        transition={{ duration: 0.7, ease: PREMIUM_EASE }}
                      >
                        {config.successMessage}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="alt"
                        initial={{ opacity: 0, filter: "blur(6px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(6px)" }}
                        transition={{ duration: 0.7, ease: PREMIUM_EASE }}
                      >
                        {config.psMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* generous open writing area, spacer */}
          <div className="min-h-[2%] flex-1" />

          {/* mid ornament, echoing the letterhead rule */}
          <div className="flex items-center gap-2.5 text-invite-gold/80">
            <span className="h-px w-10 bg-current opacity-60 sm:w-14" />
            <span className="h-1 w-1 rotate-45 bg-invite-rose/70" />
            <span className="h-px w-10 bg-current opacity-60 sm:w-14" />
          </div>

          <div className="min-h-[2%] flex-1" />

          {/* buttons before the answer, date details and map link after it */}
          <div className="flex w-full max-w-full flex-col items-center gap-[6%]">
            <AnimatePresence mode="wait">
              {showButtons ? (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: PREMIUM_EASE }}
                  className="flex w-full justify-center"
                >
                  <YesNoButtons
                    locked={locked}
                    onYes={handleYes}
                    onNoCaught={handleNoCaught}
                    folding={folding}
                    yesText={config.yesButtonText}
                    noText={config.noButtonText}
                  />
                </motion.div>
              ) : showDetails ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, ease: PREMIUM_EASE }}
                  className="flex w-full max-w-[88%] flex-col items-stretch gap-[6%] font-classic text-invite-wine/90"
                >
                  {detailStep >= 1 && (
                    <DetailRow icon={<PinIcon />} label="Байршил" value={config.location} />
                  )}
                  {detailStep >= 2 && (
                    <DetailRow icon={<CalendarIcon />} label="Огноо" value={config.date} />
                  )}
                  {detailStep >= 3 && (
                    <DetailRow icon={<ClockIcon />} label="Цаг" value={config.time} />
                  )}
                  {detailStep >= 4 && (
                    <motion.button
                      type="button"
                      onClick={handleMapsClick}
                      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.7, ease: PREMIUM_EASE }}
                      className="mt-[4%] self-center rounded-full font-classic font-medium uppercase"
                      style={{
                        letterSpacing: "0.12em",
                        fontSize: "clamp(0.72rem, 2.3vw, 0.92rem)",
                        padding: "clamp(0.5rem, 1.8vw, 0.75rem) clamp(1.4rem, 4.5vw, 2.2rem)",
                        minHeight: "48px",
                        minWidth: "48px",
                        touchAction: "manipulation",
                        color: "#3a1608",
                        backgroundImage:
                          "linear-gradient(150deg, #f6dfae 0%, #dcb676 45%, #c8a165 100%)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -3px 6px -2px rgba(122,70,48,0.4), 0 8px 18px -8px rgba(80,50,10,0.55)",
                      }}
                    >
                      Google Maps
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div key="gap" className="h-[1px] w-full" />
              )}
            </AnimatePresence>
          </div>

          <div className="min-h-[2%] flex-1" />

          {/* footer ornament — the mirrored crest below already closes the card */}
          <Sparkle className="h-2.5 w-2.5 shrink-0 text-invite-gold/70" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex w-full max-w-full items-center gap-[4%]">
      <span
        className="flex shrink-0 items-center justify-center text-invite-gold/85"
        style={{ width: "clamp(1.07rem, 3.02vw, 1.45rem)", height: "clamp(1.07rem, 3.02vw, 1.45rem)" }}
        aria-hidden
      >
        {icon}
      </span>
      <span
        className="shrink-0 whitespace-nowrap text-left font-medium uppercase italic"
        style={{
          letterSpacing: "0.18em",
          fontSize: "clamp(0.78rem, 2.39vw, 1.04rem)",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="h-px flex-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, currentColor 0, currentColor 3px, transparent 3px, transparent 7px)",
          opacity: 0.35,
          color: "var(--color-invite-gold)",
        }}
      />
      {value && (
        <span
          className="shrink-0 whitespace-nowrap text-right font-medium"
          style={{
            fontSize: "clamp(0.74rem, 2.2vw, 0.98rem)",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

// Slim linework icons, drawn to match the invitation's engraved gold detailing —
// standing in for the flat, generic look of platform emoji.
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21.5c-.3 0-.58-.12-.78-.34C8.2 17.9 5.5 14.2 5.5 10.4 5.5 6.6 8.4 3.5 12 3.5s6.5 3.1 6.5 6.9c0 3.8-2.7 7.5-5.72 10.76-.2.22-.48.34-.78.34Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.6" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5.5" width="16" height="14.5" rx="1.6" stroke="currentColor" strokeWidth="1.05" />
      <path d="M4 9.4h16" stroke="currentColor" strokeWidth="1.05" />
      <path d="M8 3.4v3.4M16 3.4v3.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="8.4" cy="13.1" r="0.75" fill="currentColor" />
      <circle cx="12" cy="13.1" r="0.75" fill="currentColor" />
      <circle cx="15.6" cy="13.1" r="0.75" fill="currentColor" />
      <circle cx="8.4" cy="16.3" r="0.75" fill="currentColor" />
      <circle cx="12" cy="16.3" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.1" stroke="currentColor" strokeWidth="1.05" />
      <path d="M12 7.6V12l3.1 1.9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
