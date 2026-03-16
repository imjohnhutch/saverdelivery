import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="border-t border-border/40" />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} saver.delivery
          </p>
          <p className="max-w-sm text-xs text-muted-foreground/70">
            We may earn a commission when you use our links. This helps keep the site free.
          </p>
        </div>
      </div>
    </footer>
  );
}
