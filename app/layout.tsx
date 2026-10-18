import type { Metadata, Viewport } from "next";
import { person, site } from "@/lib/site";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: site.title,
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

  authors: [{ name: person.name, url: person.url }],
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
    title: site.title,
    description:
      "Explore Andean ski routes, terrain features, and critical geographic data in one focused, decision-driven map.",
    siteName: "AndesMap",
    locale: "en_US",
    type: "website",
    images: [{ url: "/land/hero-map.png", alt: "AndesMap overview of Andean terrain and mountain routes" }],
  },

  twitter: {
    card: "summary_large_image",
    title: site.title,
    description:
      "A focused geospatial tool for Andean ski routes and terrain exploration.",
    creator: "@edbelluti",
    images: ["/land/hero-map.png"],
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
