import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  metadataBase: new URL("https://andes-ski.vercel.app"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
