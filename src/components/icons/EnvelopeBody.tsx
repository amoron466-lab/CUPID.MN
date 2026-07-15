export default function EnvelopeBody({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="body-env-body" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#4a1420" />
          <stop offset="45%" stopColor="#2c070d" />
          <stop offset="100%" stopColor="#180307" />
        </linearGradient>
        <linearGradient id="body-env-sheen" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="body-env-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="body-env-rim" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#f4c9b8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f4c9b8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grounding contact shadow */}
      <ellipse cx="100" cy="142" rx="76" ry="10" fill="url(#body-env-shadow)" />

      {/* envelope body */}
      <rect
        x="4"
        y="22"
        width="192"
        height="112"
        rx="10"
        fill="url(#body-env-body)"
        stroke="rgba(244,232,228,0.16)"
        strokeWidth="1"
      />

      <rect x="4" y="22" width="192" height="112" rx="10" fill="url(#body-env-rim)" />

      {/* inner fold lines — the open "mouth" the flap hinges from */}
      <path
        d="M4 32 L100 94 L196 32"
        stroke="rgba(244,232,228,0.2)"
        strokeWidth="1.2"
        fill="none"
      />

      <path
        d="M4 32 L100 94 L196 32 L196 40 L100 100 L4 40 Z"
        fill="#000000"
        opacity="0.2"
      />

      <path
        d="M4 22 L60 22 L164 134 L104 134 Z"
        fill="url(#body-env-sheen)"
        style={{ mixBlendMode: "screen" }}
      />
    </svg>
  );
}
