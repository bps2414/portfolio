"use client";

import Image from "next/image";
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
        ? "border-b border-white/10 bg-[#09090b]/88 py-3 shadow-[0_12px_36px_-26px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        : "border-b border-white/[0.06] bg-gradient-to-b from-[#0d0d10]/82 to-[#08080a]/58 py-4 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md md:py-5"
    )}>
      <div className="container mx-auto max-w-6xl px-6 flex items-center justify-between">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 font-heading text-base font-semibold tracking-tight text-white sm:text-lg md:text-xl"
          aria-label={`${siteConfig.name} - início`}
        >
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#111114] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_22px_-18px_rgba(255,255,255,0.45)] md:size-9">
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              sizes="(min-width: 768px) 36px, 32px"
              className="h-full w-full object-cover"
              priority
            />
          </span>
          <span className="truncate text-[0.95rem] leading-none text-zinc-100 transition-colors group-hover:text-white sm:text-base md:text-lg">
            {siteConfig.name}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
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
