"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-6 px-6">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          saver<span className="text-primary">.delivery</span>
        </Link>

        <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          About
        </Link>
      </div>

      <div className="border-b border-border/40" />
    </nav>
  );
}
