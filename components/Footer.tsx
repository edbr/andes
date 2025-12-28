import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-andes-border bg-andes-surface">
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Created by{" "}
          <Link
            href="https://edbelluti.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-andes-primary hover:underline"
          >
            Eduardo Belluti
          </Link>
        </span>

        <span className="text-xs">
          © {new Date().getFullYear()} AndesMap
        </span>
      </div>
    </footer>
  );
}
