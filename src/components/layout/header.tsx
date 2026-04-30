"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { Github } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  
  useEffect(() => {
    let frame = 0;

    const updateScrolled = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 20;
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-[background-color,border-color,box-shadow,padding] duration-300 md:duration-500",
      scrolled
        ? "bg-background/95 border-b border-border py-3 shadow-none md:bg-background/70 md:backdrop-blur-xl md:shadow-sm"
        : "bg-transparent border-transparent py-4 md:py-5"
    )}>
      <div className="container mx-auto max-w-6xl px-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 font-heading font-semibold tracking-tight text-xl">
          <span className="text-primary transition-colors group-hover:text-accent">bps2414</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent md:animate-pulse motion-reduce:animate-none" />
        </Link>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-md text-secondary hover:text-primary hover:bg-surface border border-transparent hover:border-border transition-[background-color,border-color,color] duration-300"
            aria-label="Perfil no GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <div className="w-px h-5 bg-border mx-1" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
