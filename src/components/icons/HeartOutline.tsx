import { SVGProps } from "react";

export default function HeartOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* main engraved contour — a locket-heart silhouette */}
      <path
        d="M12 20.2c-.24 0-.47-.08-.66-.23C6.9 16.6 4 13.86 4 10.6 4 8.06 5.98 6 8.44 6c1.4 0 2.74.66 3.56 1.72C12.82 6.66 14.16 6 15.56 6 18.02 6 20 8.06 20 10.6c0 3.26-2.9 6-7.34 9.37-.19.15-.42.23-.66.23Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* inner engraved line, echoing a hand-tooled double border */}
      <path
        d="M12 18.15c-.16 0-.32-.05-.45-.16-3.55-2.98-5.7-5.2-5.7-7.55 0-1.87 1.44-3.34 3.24-3.34 1.02 0 2 .47 2.6 1.24l.31.4.31-.4c.6-.77 1.58-1.24 2.6-1.24 1.8 0 3.24 1.47 3.24 3.34 0 2.35-2.15 4.57-5.7 7.55-.13.11-.29.16-.45.16Z"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinejoin="round"
        opacity="0.55"
      />
      {/* tiny flourish curls at each shoulder, like a hand-engraved locket */}
      <path
        d="M6.7 7.9c-.55-.5-.5-1.25.05-1.55"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.6"
        fill="none"
      />
      <path
        d="M17.3 7.9c.55-.5.5-1.25-.05-1.55"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.6"
        fill="none"
      />
      {/* small gem accent at the lower point */}
      <circle cx="12" cy="17.35" r="0.55" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
