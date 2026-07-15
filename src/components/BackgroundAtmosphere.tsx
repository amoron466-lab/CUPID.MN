"use client";

import { useEffect, useRef } from "react";

export default function BackgroundAtmosphere() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (prefersReduced || !canHover || !glowRef.current) return;

    const el = glowRef.current;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.3;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      x += (targetX - x) * 0.045;
      y += (targetY - y) * 0.045;
      el.style.setProperty("--glow-x", `${x}px`);
      el.style.setProperty("--glow-y", `${y}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-wine-950">
      {/* base gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 95% at 48% 6%, #40101a 0%, #2c070d 28%, #1c0409 52%, #100207 76%, #0b0103 100%)",
        }}
      />

      {/* secondary undertone — adds a second color temperature for depth */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(80% 60% at 78% 82%, rgba(74,15,26,0.5) 0%, rgba(74,15,26,0) 62%)",
        }}
      />

      {/* far haze layer — a barely-there color shift that sits behind everything,
          the kind of layer a compositor adds last to unify the palette */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 45% at 20% 22%, rgba(217,138,134,0.05) 0%, rgba(217,138,134,0) 70%)",
        }}
      />

      {/* key light — soft spotlight above hero, tighter falloff for realism */}
      <div
        className="cursor-glow absolute h-[46vh] w-[46vh] rounded-full opacity-80 animate-drift-a will-change-transform"
        style={{
          left: 0,
          top: 0,
          marginLeft: "-23vh",
          marginTop: "-23vh",
          background:
            "radial-gradient(circle, rgba(217,138,134,0.24) 0%, rgba(217,138,134,0.09) 38%, rgba(217,138,134,0.02) 62%, rgba(217,138,134,0) 72%)",
          filter: "blur(22px)",
        }}
      />

      {/* tight hot core inside the key light — a small sharper highlight so the
          glow reads as a light source and not just a blurred circle */}
      <div
        className="cursor-glow absolute h-[10vh] w-[10vh] rounded-full opacity-70 will-change-transform"
        style={{
          left: 0,
          top: 0,
          marginLeft: "-5vh",
          marginTop: "-5vh",
          background:
            "radial-gradient(circle, rgba(244,232,228,0.18) 0%, rgba(244,232,228,0) 75%)",
          filter: "blur(14px)",
        }}
      />

      {/* broad ambient wash behind the key light, wider + softer */}
      <div
        className="absolute left-1/2 top-[-16%] h-[76vh] w-[76vh] -translate-x-1/2 rounded-full opacity-60 animate-drift-a will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(190,60,70,0.3) 0%, rgba(190,60,70,0.1) 48%, rgba(190,60,70,0) 66%)",
          filter: "blur(70px)",
        }}
      />

      {/* gold rim glow — lower-left, distant light source */}
      <div
        className="absolute bottom-[-15%] left-[-10%] h-[55vh] w-[55vh] rounded-full opacity-55 animate-drift-b will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(227,189,143,0.17) 0%, rgba(227,189,143,0.05) 46%, rgba(227,189,143,0) 68%)",
          filter: "blur(75px)",
        }}
      />

      {/* deep wine pool — lower-right, grounds the composition */}
      <div
        className="absolute bottom-[-22%] right-[-14%] h-[62vh] w-[62vh] rounded-full animate-drift-c will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(74,15,26,0.52) 0%, rgba(74,15,26,0.18) 44%, rgba(74,15,26,0) 70%)",
          filter: "blur(85px)",
        }}
      />

      {/* faint secondary rim, opposite corner, very subtle to avoid symmetry */}
      <div
        className="absolute right-[6%] top-[8%] h-[30vh] w-[30vh] rounded-full opacity-40 animate-drift-b will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(217,138,134,0.14) 0%, rgba(217,138,134,0) 72%)",
          filter: "blur(50px)",
        }}
      />

      {/* thin horizon reflection — a low, wide sliver of warmth near the base,
          suggests light bouncing off an unseen surface below the fold */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22vh] opacity-45"
        style={{
          background:
            "linear-gradient(to top, rgba(217,138,134,0.06) 0%, rgba(217,138,134,0) 100%)",
        }}
      />

      {/* cinematic vignette — deepened corners, transparent stage for hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 105% at 50% 42%, transparent 34%, rgba(4,0,1,0.22) 66%, rgba(4,0,1,0.48) 84%, rgba(2,0,0,0.76) 100%)",
        }}
      />

      {/* top + bottom edge fade for extra depth framing */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,0,0,0.38) 0%, transparent 16%, transparent 80%, rgba(2,0,0,0.52) 100%)",
        }}
      />

      {/* grain */}
      <div className="grain-overlay absolute inset-0 opacity-[0.045] mix-blend-overlay" />
    </div>
  );
}
