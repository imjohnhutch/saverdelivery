import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-foreground">
            &copy; {new Date().getFullYear()} saver.delivery
          </p>
          <Link
            href="/about"
            className="text-sm text-muted-foreground transition-colors hover:text-brand"
          >
            About
          </Link>
          <p className="max-w-md text-xs text-muted-foreground">
            saver.delivery may earn a commission when you use our links. This
            helps keep the site free.
          </p>
        </div>
      </div>
    </footer>
  );
}
