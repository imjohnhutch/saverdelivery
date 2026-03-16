"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SearchBar } from "@/components/search-bar";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-6 px-6">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          saver<span className="text-primary">.delivery</span>
        </Link>

        <div className="hidden flex-1 max-w-sm sm:block">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>

      <div className="border-b border-border/40" />

      <div className="px-6 py-2 sm:hidden">
        <SearchBar />
      </div>
    </nav>
  );
}
