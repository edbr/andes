import Link from "next/link";
import { person, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-andes-border bg-andes-surface">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Created by{" "}
          <Link
            href={person.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-andes-primary hover:underline"
          >
            Eduardo Belluti
          </Link>
        </span>

        <nav aria-label="Project information" className="flex flex-wrap gap-4">
          <a href={site.writeupUrl} className="hover:underline">About this project</a>
          <a href="https://eduardobelluti.com/projects/personal" className="hover:underline">More projects</a>
        </nav>
        <span className="text-xs">
          © {new Date().getFullYear()} AndesMap
        </span>
      </div>
    </footer>
  );
}
