import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Instrument_Serif, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// The desktop layout is declared at a fixed 600px logical width (see
// `.design-stage` in globals.css) and, on real viewports narrower than that,
// scaled down with CSS `transform: scale()` to fit — never by rewriting the
// viewport meta tag itself, which stays the standard `width=device-width,
// initial-scale=1` for compatibility (a hardcoded `width=600` meta renders
// unscaled/clipped instead of shrunk on browsers that don't auto-compute an
// initial scale for it, e.g. older Android WebViews). This script computes
// that scale factor as a CSS custom property, `--stage-scale`, which
// `.design-stage` (and every stage-internal `vw`/`vh`/`dvh` value, via
// `calc(Nvw / var(--stage-scale))`) reads to size itself. Runs
// beforeInteractive so the correct scale is set before first paint, and again
// on resize/orientation change.
const STAGE_SCRIPT = `
(function () {
  var DESIGN_WIDTH = ${600};
  function apply() {
    var w = window.innerWidth;
    var scale = w > 0 && w < DESIGN_WIDTH ? w / DESIGN_WIDTH : 1;
    var root = document.documentElement.style;
    root.setProperty("--stage-scale", String(scale));
    root.setProperty("--stage-width", scale < 1 ? DESIGN_WIDTH + "px" : "100%");
  }
  apply();
  window.addEventListener("resize", apply);
})();
`;

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

// Classic old-style serif for the invitation's heading + detail lines —
// needs Cyrillic for the Mongolian copy.
const classic = Cormorant_Garamond({
  variable: "--font-classic",
  subsets: ["cyrillic", "latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

// Luxury calligraphy for the invitation's main question.
const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["cyrillic", "latin"],
  weight: ["400"],
});

const SITE_URL = "https://bolzoy.com";
const SITE_TITLE = "BOLZOY";
const SITE_DESCRIPTION = "Чамд зориулсан жижиг захидал.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    images: ["/apple-icon.png"],
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/apple-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Standard device-width viewport — the fixed 600px desktop-style design
// width is implemented entirely in CSS (`.design-stage` + STAGE_SCRIPT
// above), not by declaring a fixed width here. Also locks pinch/double-tap
// zoom (this is a single-view, app-like experience with no zoomable content)
// and extends the layout under the notch/home indicator via
// viewport-fit=cover so the safe-area-inset padding in globals.css has
// something to respond to on iOS.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${display.variable} ${body.variable} ${classic.variable} ${script.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden flex flex-col bg-[#0b0103] text-[#f4e8e4] font-body">
        <Script id="stage-scale" strategy="beforeInteractive">
          {STAGE_SCRIPT}
        </Script>
        <div className="design-stage">{children}</div>
      </body>
    </html>
  );
}
