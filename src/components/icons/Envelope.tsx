export default function Envelope({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="env-body" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#4a1420" />
          <stop offset="45%" stopColor="#2c070d" />
          <stop offset="100%" stopColor="#180307" />
        </linearGradient>
        <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d1a26" />
          <stop offset="60%" stopColor="#440c14" />
          <stop offset="100%" stopColor="#2e070e" />
        </linearGradient>
        <radialGradient id="env-seal" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#fbe4bb" />
          <stop offset="30%" stopColor="#e3bd8f" />
          <stop offset="68%" stopColor="#b98650" />
          <stop offset="100%" stopColor="#7a5228" />
        </radialGradient>
        <linearGradient id="env-sheen" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="env-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="env-rim" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#f4c9b8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f4c9b8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grounding contact shadow — softer, wider falloff for realism */}
      <ellipse cx="100" cy="142" rx="76" ry="10" fill="url(#env-shadow)" />

      {/* envelope body */}
      <rect
        x="4"
        y="22"
        width="192"
        height="112"
        rx="10"
        fill="url(#env-body)"
        stroke="rgba(244,232,228,0.16)"
        strokeWidth="1"
      />

      {/* ambient rim light along the top edge, as if lit from above */}
      <rect x="4" y="22" width="192" height="112" rx="10" fill="url(#env-rim)" />

      {/* inner fold lines */}
      <path
        d="M4 32 L100 94 L196 32"
        stroke="rgba(244,232,228,0.2)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* subtle inner shadow along top of body for depth under the flap */}
      <path
        d="M4 32 L100 94 L196 32 L196 40 L100 100 L4 40 Z"
        fill="#000000"
        opacity="0.2"
      />

      {/* flap */}
      <path
        d="M4 30 C4 25 8 22 12 22 L188 22 C192 22 196 25 196 30 L100 92 Z"
        fill="url(#env-flap)"
        stroke="rgba(244,232,228,0.18)"
        strokeWidth="1"
      />

      {/* fine highlight along the flap's upper edge — catches the key light */}
      <path
        d="M14 23.5 L186 23.5"
        stroke="rgba(244,232,228,0.28)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />

      {/* diagonal glass sheen across body + flap */}
      <path
        d="M4 22 L60 22 L164 134 L104 134 Z"
        fill="url(#env-sheen)"
        style={{ mixBlendMode: "screen" }}
      />

      {/* soft halo behind the seal so it reads as the illustration's focal point */}
      <circle cx="100" cy="59" r="21" fill="#f2c98f" opacity="0.14" style={{ filter: "blur(6px)" }} />

      {/* wax seal */}
      <circle cx="100" cy="59" r="13.5" fill="url(#env-seal)" />
      <circle
        cx="100"
        cy="59"
        r="13.5"
        fill="none"
        stroke="#5a3a1a"
        strokeOpacity="0.4"
        strokeWidth="0.75"
      />
      <circle
        cx="100"
        cy="59"
        r="13.5"
        fill="none"
        stroke="#fff3d9"
        strokeOpacity="0.2"
        strokeWidth="0.5"
        transform="translate(-0.4 -0.4)"
      />
      {/* tiny laurel sprigs flanking the heart, pressed into the wax */}
      <path
        d="M90.5 59c1.8-1.3 3-1.2 4.2-.2M90.9 61.6c1.7-1 2.9-.85 4-.1M91.6 56.5c1.6-1 2.7-.85 3.7-.15"
        stroke="#5a3a1a"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M109.5 59c-1.8-1.3-3-1.2-4.2-.2M109.1 61.6c-1.7-1-2.9-.85-4-.1M108.4 56.5c-1.6-1-2.7-.85-3.7-.15"
        stroke="#5a3a1a"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
      <path
        d="M100 52.2c-2.4-3-8-2.6-8 1.8 0 3.4 4.6 6 8 8.7 3.4-2.7 8-5.3 8-8.7 0-4.4-5.6-4.8-8-1.8z"
        fill="#5a1520"
        opacity="0.85"
      />
      {/* fine engraved double-line, as if hand-cut into the seal die */}
      <path
        d="M100 54.1c-1.85-2-5.9-1.55-5.9 1.55 0 2.5 3.35 4.5 5.9 6.6 2.55-2.1 5.9-4.1 5.9-6.6 0-3.1-4.05-3.55-5.9-1.55z"
        fill="none"
        stroke="#8a6a3a"
        strokeWidth="0.4"
        opacity="0.4"
      />
      {/* tiny flourish above the heart, completing the crest */}
      <path
        d="M96.7 51c1-1 2.2-1.4 3.3-1.3 1.1-.1 2.3.3 3.3 1.3"
        stroke="#5a3a1a"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.45"
        fill="none"
      />
      <circle
        className="animate-seal-shine"
        cx="95.5"
        cy="54.5"
        r="3.2"
        fill="#fff3d9"
        opacity="0.4"
        style={{ mixBlendMode: "soft-light" }}
      />
    </svg>
  );
}
