import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

/* fonts unchanged */

export const metadata: Metadata = {
  metadataBase: new URL("https://andes-ski.vercel.app"),

  title: {
    default: "AndesMap",
    template: "%s · AndesMap",
  },

  description:
    "An interactive map for exploring Andean mountain routes, ski areas, and terrain data. Built to support decision-making for backcountry travel and route planning.",

  applicationName: "AndesMap",

  keywords: [
    "Andes",
    "backcountry skiing",
    "ski mountaineering",
    "mountain routes",
    "terrain analysis",
    "maplibre",
    "geospatial data",
  ],

  authors: [{ name: "Eduardo Belluti" }],
  creator: "Eduardo Belluti",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-120.png", sizes: "120x120" },
      { url: "/icons/apple-touch-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-180.png", sizes: "180x180" },
    ],
  },

  manifest: "/manifest.json",

  openGraph: {
    title: "AndesMap",
    description:
      "Explore Andean ski routes, terrain features, and critical geographic data in one focused, decision-driven map.",
    url: "https://andes-ski.vercel.app",
    siteName: "AndesMap",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AndesMap",
    description:
      "A focused geospatial tool for Andean ski routes and terrain exploration.",
    creator: "@edbelluti",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
