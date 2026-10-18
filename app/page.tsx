import type { Metadata } from "next";
import AndesMap from "@/components/map/AndesMap";
import { person, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: `${site.url}/`,
      description: site.description,
      author: { "@id": person["@id"] },
    },
    {
      "@type": "WebApplication",
      "@id": `${site.url}/#application`,
      name: site.name,
      url: `${site.url}/`,
      description: site.description,
      image: `${site.url}/land/hero-map.png`,
      applicationCategory: "TravelApplication",
      operatingSystem: "Any",
      creator: { "@id": person["@id"] },
      subjectOf: {
        "@type": "Article",
        url: site.writeupUrl,
        headline: "Mapping Andes Backcountry Ski",
        author: { "@id": person["@id"] },
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <AndesMap />
      <aside aria-label="About AndesMap" className="absolute bottom-10 left-4 z-40 max-w-[min(20rem,calc(100vw-2rem))] rounded-md border border-andes-border bg-andes-surface p-3 text-xs text-foreground shadow-sm">
        <details>
          <summary className="cursor-pointer font-medium">About AndesMap</summary>
          <h1 className="mt-3 font-semibold">AndesMap: backcountry ski and mountain routes</h1>
          <p className="mt-2">{site.description}</p>
          <nav aria-label="Project information" className="mt-3 flex flex-wrap gap-3">
            <a href="/land" className="underline underline-offset-4">Project overview</a>
            <a href={site.writeupUrl} className="underline underline-offset-4">Read the case study</a>
            <a href="https://eduardobelluti.com/projects/personal" className="underline underline-offset-4">More projects</a>
          </nav>
        </details>
        <p className="mt-2">Built by <a href={person.url} className="underline underline-offset-4">{person.name}</a></p>
      </aside>
    </main>
  );
}
