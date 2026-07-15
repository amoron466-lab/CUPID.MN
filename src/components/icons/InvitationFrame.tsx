import { SVGProps } from "react";

// An original, richly-detailed border for the opened invitation card —
// a wide faceted band evoking stained glass, large corner rose medallions,
// and a bold heart-in-arch crest at the top. Inspired by vintage
// stained-glass invitation art, but every shape, palette and layout here
// is original — no traced artwork, no copied composition.
export default function InvitationFrame(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 340 460"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="inv-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a4450" />
          <stop offset="45%" stopColor="#6f333c" />
          <stop offset="100%" stopColor="#4f272e" />
        </linearGradient>
        <linearGradient id="inv-band-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ad5560" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ad5560" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="inv-rose-outer" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0cdd2" />
          <stop offset="55%" stopColor="#d9a4ac" />
          <stop offset="100%" stopColor="#bc7d87" />
        </radialGradient>
        <radialGradient id="inv-rose-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3641" />
          <stop offset="100%" stopColor="#ad5560" />
        </radialGradient>
        {/* soft grounding shadow beneath each medallion — one light source, cast consistently */}
        <radialGradient id="inv-rose-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#210705" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#210705" stopOpacity="0" />
        </radialGradient>
        {/* diagonal foil sheen, swept once across the band — static highlight, no motion */}
        <linearGradient id="inv-band-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8e7bd" stopOpacity="0" />
          <stop offset="42%" stopColor="#f8e7bd" stopOpacity="0" />
          <stop offset="53%" stopColor="#f8e7bd" stopOpacity="0.5" />
          <stop offset="64%" stopColor="#f8e7bd" stopOpacity="0" />
          <stop offset="100%" stopColor="#f8e7bd" stopOpacity="0" />
        </linearGradient>

        {/* ---- corner rose medallion, drawn for the top-left, reused via mirroring ---- */}
        <g id="inv-rose" transform="translate(40,40) scale(0.8) translate(-40,-40)">
          <ellipse cx="43" cy="44" rx="21" ry="20" fill="url(#inv-rose-shadow)" />
          <ellipse cx="22" cy="46" rx="15" ry="7" fill="#7c8f6c" opacity="0.8" transform="rotate(-37 22 46)" />
          <ellipse cx="46.4" cy="21.6" rx="14.6" ry="7.3" fill="#93a481" opacity="0.65" transform="rotate(-59 46 22)" />
          <circle cx="40" cy="40" r="19" fill="url(#inv-rose-outer)" stroke="#7c3641" strokeOpacity="0.22" strokeWidth="0.5" />
          <circle cx="39.7" cy="40.3" r="13.5" fill="#e6c3c8" opacity="0.9" />
          <path
            d="M40 27.5 C48 27.5 53 33 53 40 C53 47 48 52.5 40 52.5"
            fill="none"
            stroke="#7c3641"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M40 32 C45 32 48.5 35.7 48.5 40 C48.5 44.3 45 48 40 48"
            fill="none"
            stroke="#7c3641"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.45"
          />
          <circle cx="40" cy="40" r="4.5" fill="url(#inv-rose-inner)" />
          <circle cx="37.5" cy="37.5" r="1.1" fill="#f3d8c9" opacity="0.5" />
          {/* fine petal veining and a serrated leaf edge for a hand-engraved, botanical read */}
          <path
            d="M40 30 C46 31 49.5 35 49.5 40 C49.5 45 46 49 40 50"
            fill="none"
            stroke="#e7c99a"
            strokeWidth="0.5"
            opacity="0.4"
          />
          <path
            d="M22 46 L18.5 44.4 L20.4 43.3 L17.2 42.6"
            fill="none"
            stroke="#5c6b4e"
            strokeWidth="0.5"
            strokeLinecap="round"
            opacity="0.6"
            transform="rotate(-37 22 46)"
          />
        </g>

        {/* ---- delicate garland vine, strung between the corner medallions along each edge ---- */}
        <g id="inv-garland">
          <path
            d="M-100 0 C-72 -9,-42 9,-14 0 C0 -5,0 5,14 0 C42 -9,72 9,100 0"
            fill="none"
            stroke="#c8a165"
            strokeWidth="0.8"
            opacity="0.5"
          />
          {/* leaf clusters */}
          <g fill="#7c8f6c" opacity="0.75">
            <ellipse cx="-68" cy="-3" rx="6.5" ry="3" transform="rotate(-24 -68 -3)" />
            <ellipse cx="-68" cy="3.5" rx="6" ry="2.7" transform="rotate(20 -68 3.5)" />
            <ellipse cx="68" cy="-3" rx="6.5" ry="3" transform="rotate(24 68 -3)" />
            <ellipse cx="68" cy="3.5" rx="6" ry="2.7" transform="rotate(-20 68 3.5)" />
          </g>
          {/* tiny rosebuds at the garland's high points */}
          <g>
            <circle cx="-35" cy="1.5" r="3.4" fill="url(#inv-rose-outer)" stroke="#7c3641" strokeOpacity="0.3" strokeWidth="0.4" />
            <circle cx="-35" cy="1.5" r="1.4" fill="url(#inv-rose-inner)" />
            <circle cx="35" cy="1.5" r="3.4" fill="url(#inv-rose-outer)" stroke="#7c3641" strokeOpacity="0.3" strokeWidth="0.4" />
            <circle cx="35" cy="1.5" r="1.4" fill="url(#inv-rose-inner)" />
          </g>
          {/* center accent bud, small and understated */}
          <circle cx="0" cy="0" r="2.1" fill="url(#inv-rose-inner)" opacity="0.85" />
        </g>

        {/* ---- bold heart-in-arch crest, drawn centered, mirrored for the footer ---- */}
        <g id="inv-crest" transform="translate(170,12) scale(0.88) translate(-170,-12)">
          <path
            d="M96 96 C96 46 128 16 170 12 C212 16 244 46 244 96 L224 96 C224 55 200 34 170 31 C140 34 116 55 116 96 Z"
            fill="url(#inv-band)"
            stroke="#c8a165"
            strokeWidth="1.1"
          />
          <path
            d="M96 96 C96 46 128 16 170 12 C212 16 244 46 244 96"
            fill="none"
            stroke="#e7c99a"
            strokeWidth="0.7"
            opacity="0.5"
          />
          <path
            d="M170 30.5c-6-9.4-27-8.2-27 6.2 0 12.4 16.6 21.9 27 31.6 10.4-9.7 27-19.2 27-31.6 0-14.4-21-15.6-27-6.2Z"
            fill="url(#inv-rose-inner)"
            stroke="#e7c99a"
            strokeWidth="1.3"
          />
          <path
            d="M170 33.5c-3.2-4.6-13-4-13 3 0 6 8 10.6 13 15.4 5-4.8 13-9.4 13-15.4 0-7-9.8-7.6-13-3Z"
            fill="#8a4450"
            opacity="0.65"
          />
          <g transform="translate(114,60)">
            <use href="#inv-rose" transform="scale(0.58) rotate(-3 40 40)" />
          </g>
          <g transform="translate(226,60) scale(-1,1)">
            <use href="#inv-rose" transform="scale(0.58) rotate(2 40 40)" />
          </g>
        </g>
      </defs>

      {/* faceted band frame (drawn as outer rect minus inner window, evenodd) — trimmed ~20% thinner for more breathing room */}
      <path
        fillRule="evenodd"
        d="M0 0 H340 V460 H0 Z M24 24 H316 V436 H24 Z"
        fill="url(#inv-band)"
      />
      <path
        fillRule="evenodd"
        d="M0 0 H340 V460 H0 Z M24 24 H316 V436 H24 Z"
        fill="url(#inv-band-soft)"
      />
      {/* gold foil sheen, catching the light diagonally across the band */}
      <path
        fillRule="evenodd"
        d="M0 0 H340 V460 H0 Z M24 24 H316 V436 H24 Z"
        fill="url(#inv-band-foil)"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* gold keylines tracing the band's outer + inner edges */}
      <rect x="1" y="1" width="338" height="458" rx="10" stroke="#e7c99a" strokeWidth="0.9" opacity="0.7" />
      <rect x="24" y="24" width="292" height="412" rx="5" stroke="#e7c99a" strokeWidth="0.8" opacity="0.65" />
      <rect x="0.5" y="0.5" width="339" height="459" rx="11" stroke="#3a0b12" strokeWidth="0.8" opacity="0.4" />

      {/* small diamond facets marking the midpoints of each side */}
      <g fill="#f4dcae" opacity="0.75">
        <rect x="8.6" y="226.6" width="5.8" height="6.2" transform="rotate(44 12 230)" />
        <rect x="324.4" y="226.7" width="6.2" height="5.7" transform="rotate(46 328 230)" />
        <rect x="167.1" y="8.4" width="5.7" height="6.3" transform="rotate(45.5 170 12)" />
        <rect x="166.9" y="444.6" width="6.3" height="5.8" transform="rotate(44.5 170 448)" />
      </g>

      {/* garland vines strung along each edge, between the corner medallions */}
      <use href="#inv-garland" transform="translate(170,12)" />
      <use href="#inv-garland" transform="translate(170,448) scale(1,-1)" />
      <use href="#inv-garland" transform="translate(12,230) rotate(90)" />
      <use href="#inv-garland" transform="translate(328,230) rotate(90) scale(1,-1)" />

      {/* corner rose medallions, mirrored into all four corners — each nudged with a
          hair of rotation and scale so no two are perfectly identical clones */}
      <use href="#inv-rose" transform="rotate(-1.5 40 40) scale(1.01)" />
      <use href="#inv-rose" transform="translate(340,0) scale(-1,1) rotate(2 40 40) scale(0.985)" />
      <use href="#inv-rose" transform="translate(0,460) scale(1,-1) rotate(-2.5 40 40) scale(0.99)" />
      <use href="#inv-rose" transform="translate(340,460) scale(-1,-1) rotate(1.5 40 40) scale(1.015)" />

      {/* heart-in-arch crest, top + mirrored at the foot of the card */}
      <use href="#inv-crest" />
      <use href="#inv-crest" transform="translate(0,460) scale(1,-1)" />
    </svg>
  );
}
