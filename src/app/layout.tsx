import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Instrument_Serif, Outfit } from "next/font/google";
import "./globals.css";

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

// Locks pinch/double-tap zoom (this is a single-view, app-like experience
// with no zoomable content) and extends the layout under the notch/home
// indicator via viewport-fit=cover so the safe-area-inset padding in
// globals.css has something to respond to on iOS.
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
        {children}
      </body>
    </html>
  );
}
