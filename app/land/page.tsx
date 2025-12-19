import Image from "next/image";
import Link from "next/link";
import AndesMap from "@/components/map/AndesMap";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            AndesMap
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            A focused map for an extraordinary mountain range.
          </p>

          <p className="mt-4 max-w-2xl text-slate-600">
            Explore ski routes, protected areas, access points, and terrain
            features across the Andes — with clarity, not clutter.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Explore the Map
            </Link>

            <a
              href="#features"
              className="inline-flex items-center rounded-md border px-5 py-3 text-sm font-medium hover:bg-slate-50"
            >
              View Features
            </a>
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative h-[420px] w-full bg-slate-100">
          {/* Replace with real screenshot */}
          <Image
            src="/land/hero-map.png"
            alt="AndesMap overview"
            fill
            className="object-cover"
            priority
          />
          </div>
      </section>

      {/* =====================================================
          CONCEPT
      ===================================================== */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold">
          A range defined by parallel structure
        </h2>

        <p className="mt-6 max-w-3xl text-slate-600">
          The Andes stretch nearly 7,000 kilometers north to south — a system of
          parallel ridgelines, volcanic arcs, repeating valleys, and consistent
          terrain logic.
        </p>

        <p className="mt-4 max-w-3xl text-slate-600">
          AndesMap exists to respect that structure. Instead of showing
          everything, it emphasizes hierarchy, reduction, and intent — allowing
          the landscape itself to remain legible.
        </p>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section
        id="features"
        className="border-t bg-slate-50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 space-y-24">
          {/* Feature */}
          <Feature
            title="Layered visibility"
            description="Toggle routes, peaks, volcanoes, protected areas, resorts, and access points independently. Show only what matters to the question you’re asking."
            image="/marketing/feature-layers.jpg"
          />

          <Feature
            title="Protected areas, clearly communicated"
            description="National parks, regional reserves, and strict protected areas are visualized with subtle fills, clean outlines, distinct icons, and non-repeating labels."
            image="/marketing/feature-protected.jpg"
            reverse
          />

          <Feature
            title="Ski objectives without clutter"
            description="Peaks and volcanoes are clustered at distance and revealed progressively. Names appear once, clearly, and only when relevant."
            image="/marketing/feature-objectives.jpg"
          />

          <Feature
            title="Access-aware mapping"
            description="Ski resorts, parking, and trailheads are first-class map elements. One-click directions bridge planning with reality."
            image="/marketing/feature-access.jpg"
            reverse
          />

          <Feature
            title="2D and 3D terrain modes"
            description="Plan in 2D. Understand terrain in 3D. Smooth camera transitions support both perspectives without breaking context."
            image="/marketing/feature-3d.jpg"
          />
        </div>
      </section>

      {/* =====================================================
          PRINCIPLES
      ===================================================== */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-semibold">
          Designed for clarity
        </h2>

        <ul className="mt-6 space-y-3 text-slate-600">
          <li>• Every layer earns its place</li>
          <li>• Icons are meaningful, not decorative</li>
          <li>• Labels appear once, or not at all</li>
          <li>• No ads, no sponsored noise</li>
          <li>• Built to help you reason about terrain</li>
        </ul>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="border-t bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-semibold">
            Explore the Andes with intention
          </h2>

          <p className="mt-4 max-w-xl text-slate-300">
            The range is vast. The map doesn’t need to be.
          </p>

          <div className="mt-8">
            <Link
              href="/map"
              className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Open AndesMap
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   Feature block
============================================================ */
function Feature({
  title,
  description,
  image,
  reverse = false,
}: {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid gap-10 items-center ${
        reverse ? "md:grid-cols-[1fr_1.2fr]" : "md:grid-cols-[1.2fr_1fr]"
      }`}
    >
      <div className={reverse ? "md:order-2" : ""}>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-4 text-slate-600 max-w-md">{description}</p>
      </div>

      <div className="relative h-320px w-full rounded-lg overflow-hidden bg-slate-200">
        {/* Replace with real screenshots */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
