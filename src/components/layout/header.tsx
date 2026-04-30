"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/config/site";
import { Github } from "@/components/icons";
import { useEffect, useState } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur border-b border-border" : "bg-transparent border-transparent"}`}>
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-semibold tracking-tight text-xl">
          bps2414<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-secondary hover:text-primary transition-colors"
            aria-label="Perfil no GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
