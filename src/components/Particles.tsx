const PARTICLE_COUNT = 22;

// Deterministic pseudo-random so server and client markup match exactly.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Particles({ dimmed = false }: { dimmed?: boolean }) {
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const left = seeded(i, 1) * 100;
    const top = 20 + seeded(i, 2) * 70;
    const size = 1.5 + seeded(i, 3) * 2.5;
    const duration = 14 + seeded(i, 4) * 16;
    const delay = -seeded(i, 5) * 20;
    const opacity = 0.15 + seeded(i, 6) * 0.35;
    // depth: smaller particles sit "farther back" — softer, dimmer, slower
    const depth = size / 4;
    const blur = (1 - depth) * 0.6;
    return { left, top, size, duration, delay, opacity, blur };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ opacity: dimmed ? 0.7 : 1 }}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-particle absolute rounded-full bg-gold-300"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--particle-opacity": p.opacity,
              boxShadow: "0 0 6px rgba(227,189,143,0.5)",
              filter: p.blur > 0.08 ? `blur(${p.blur.toFixed(2)}px)` : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
