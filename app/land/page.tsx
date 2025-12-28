import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-andes-surface text-foreground">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="border-b border-andes-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          {/* Brand row */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/icons/Apple Touch — 384.png"
              alt="AndesMap icon"
              width={44}
              height={44}
              className="rounded-xl"
              priority
            />
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              AndesMap
            </h1>
          </div>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A focused map for ski mountaineering, volcanic exploration, and
            access planning across the Andes.
          </p>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Routes, objectives, protected areas, and access points — organized
            to support real decisions, not visual noise.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-andes-primary px-5 py-3 text-sm font-medium text-andes-primary-foreground hover:bg-andes-primary/90"
            >
              Explore the map
            </Link>

            <Link
              href="/feedback"
              className="inline-flex items-center rounded-md border border-andes-primary px-5 py-3 text-sm font-medium text-andes-primary hover:bg-andes-primary/5"
            >
              Help shape it
            </Link>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative h-[420px] w-full border-t border-andes-border bg-background">
          <Image
            src="/land/hero-map.png"
            alt="AndesMap overview"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>


      {/* =====================================================
          USE CASES
      ===================================================== */}
      <section className="border-t border-andes-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold">
            What people use AndesMap for
          </h2>

          <div className="mt-12 grid gap-12 md:grid-cols-3">
            <UseCase
              title="Objective planning"
              description="Compare ski routes, volcanoes, and terrain context before choosing a line or summit."
            />
            <UseCase
              title="Access & logistics"
              description="Understand where people actually park, approach from, and transition on foot or skis."
            />
            <UseCase
              title="Exploration"
              description="Discover peaks, volcanoes, and protected areas you might not find on general-purpose maps."
            />
          </div>
        </div>
      </section>

      
      {/* =====================================================
          VALIDATION CTA
      ===================================================== */}
      <section
        id="validation"
        className="border-t border-andes-border bg-andes-primary text-andes-primary-foreground"
      >
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-semibold">
            AndesMap is evolving
          </h2>

          <p className="mt-4 max-w-xl text-andes-primary-foreground/80">
            Before adding more features, the goal is to understand what matters
            most. Your feedback directly influences what gets built next.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-medium text-andes-primary hover:bg-white/90"
            >
              Explore the map
            </Link>

            <Link
              href="/feedback"
              className="inline-flex items-center rounded-md border border-white/40 px-5 py-3 text-sm font-medium hover:bg-white/10"
            >
              Share feedback
            </Link>
          </div>
        </div>
      </section>
        <Footer />
    </main>
  );
}

/* ============================================================
   USE CASE
============================================================ */
function UseCase({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-3 text-muted-foreground max-w-sm">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   FEATURE
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
      className={`grid gap-12 items-center ${
        reverse ? "md:grid-cols-[1fr_1.2fr]" : "md:grid-cols-[1.2fr_1fr]"
      }`}
    >
      <div className={reverse ? "md:order-2" : ""}>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-4 text-muted-foreground max-w-md">{description}</p>
      </div>

      <div className="relative h-320px w-full rounded-lg overflow-hidden bg-muted">
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
