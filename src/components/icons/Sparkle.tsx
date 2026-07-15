import { SVGProps } from "react";

export default function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* primary ray — a hand-cut jewel point */}
      <path d="M12 2c.6 4.2 1.8 6.6 4.8 8.4-3 1.8-4.2 4.2-4.8 8.4-.6-4.2-1.8-6.6-4.8-8.4 3-1.8 4.2-4.2 4.8-8.4Z" />
      {/* secondary diagonal ray, rotated to read as an 8-point star */}
      <path
        d="M12 6.4c.4 2.3.95 3.5 2.55 4.7-1.6 1.2-2.15 2.4-2.55 4.7-.4-2.3-.95-3.5-2.55-4.7 1.6-1.2 2.15-2.4 2.55-4.7Z"
        opacity="0.5"
      />
      {/* tiny cross rays, faceted like a small stone */}
      <path d="M12 9.6c.16.85.4 1.3.95 1.7-.55.4-.79.85-.95 1.7-.16-.85-.4-1.3-.95-1.7.55-.4.79-.85.95-1.7Z" opacity="0.75" />
      <circle cx="12" cy="11.3" r="0.42" opacity="0.9" />
    </svg>
  );
}
