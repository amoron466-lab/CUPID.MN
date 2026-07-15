import type { HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function GlassCard({
  children,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`relative border border-blush-200/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_-10px_24px_rgba(0,0,0,0.22)_inset,0_18px_50px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    >
      {/* top glass highlight — simulates light catching the upper edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-[inherit] bg-gradient-to-b from-white/[0.07] via-white/[0.015] to-transparent"
      />
      {/* faint corner glint — a single asymmetric highlight, like a specular hit */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-[18%] h-px w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
