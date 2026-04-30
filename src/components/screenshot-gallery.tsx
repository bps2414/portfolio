"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface Screenshot {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  // Touch tracking for swipe in lightbox
  const touchStartX = useRef<number | null>(null);

  const current = screenshots[currentIndex];

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex((index + screenshots.length) % screenshots.length);
    },
    [screenshots.length]
  );

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "Escape") setIsLightboxOpen(false);
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, prev, next]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // Track whether this is the initial mount — skip scroll on first render
  const hasMounted = useRef(false);

  // Scroll active thumbnail into view *within the strip only* (never the page)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const container = thumbnailsRef.current;
    if (!container) return;
    const activeThumb = container.querySelector<HTMLElement>(
      `[data-thumb-index="${currentIndex}"]`
    );
    if (!activeThumb) return;
    // Manually scroll the container so the page position is never affected
    const containerLeft = container.getBoundingClientRect().left;
    const thumbLeft = activeThumb.getBoundingClientRect().left;
    const thumbCenter = thumbLeft - containerLeft + activeThumb.offsetWidth / 2;
    const targetScroll =
      container.scrollLeft + thumbCenter - container.offsetWidth / 2;
    container.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [currentIndex]);

  if (screenshots.length === 0) return null;

  // Swipe handlers for the lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return; // ignore small movements
    if (delta < 0) next();
    else prev();
  };

  return (
    <>
      <section className="perf-section pt-12 border-t border-border/40">
        <h2 className="mb-10 text-3xl font-heading font-bold">Telas do produto</h2>

        {/* Main image */}
        <div className="relative group">
          <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:shadow-lg">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="relative block w-full overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Ampliar imagem"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 100vw, 896px"
                  quality={82}
                  className="w-full h-full object-cover object-top md:transition-transform md:duration-700 motion-reduce:transition-none md:group-hover:scale-[1.02]"
                />
              </div>
              {/* Zoom hint overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300 motion-reduce:transition-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-reduce:transition-none bg-background/85 md:backdrop-blur-sm rounded-full p-3 border border-border shadow-sm md:shadow-lg">
                  <ZoomIn className="w-5 h-5 text-primary" />
                </div>
              </div>
            </button>

            <figcaption className="border-t border-border px-4 sm:px-6 py-4 text-sm leading-relaxed text-secondary flex items-center justify-between gap-4">
              <span>{current.caption}</span>
              <span className="text-xs text-secondary/60 whitespace-nowrap font-medium">
                {currentIndex + 1} / {screenshots.length}
              </span>
            </figcaption>
          </figure>

          {/* Navigation arrows */}
          {screenshots.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/90 md:backdrop-blur-sm border border-border shadow-sm md:shadow-lg flex items-center justify-center text-primary hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/90 md:backdrop-blur-sm border border-border shadow-sm md:shadow-lg flex items-center justify-center text-primary hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails — with edge fade to indicate scrollability */}
        {screenshots.length > 1 && (
          <div className="relative mt-4">
            {/* Fade indicators for horizontal scrollability */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10" />
            <div
              ref={thumbnailsRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin px-2"
              role="tablist"
              aria-label="Miniaturas das telas do produto"
            >
              {screenshots.map((screenshot, index) => (
                <button
                  key={screenshot.src}
                  type="button"
                  role="tab"
                  data-thumb-index={index}
                  aria-selected={index === currentIndex}
                  aria-label={`Ver ${screenshot.caption}`}
                  onClick={() => goTo(index)}
                  className={cn(
                    "relative flex-shrink-0 w-24 sm:w-28 md:w-36 aspect-[16/9] rounded-lg overflow-hidden border-2 transition-[border-color,opacity,box-shadow] duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    index === currentIndex
                      ? "border-accent shadow-md shadow-accent/20"
                      : "border-border/40 opacity-60 hover:opacity-100 hover:border-border"
                  )}
                >
                  <Image
                    src={screenshot.src}
                    alt={screenshot.alt}
                    width={160}
                    height={90}
                    sizes="160px"
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 md:backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da tela"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 md:backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Fechar visualização"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation — hidden on mobile (use swipe instead) */}
          {screenshots.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={next}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="90vw"
                quality={85}
                className="max-h-[80vh] w-auto h-auto object-contain"
              />
            </div>
            <div className="mt-4 text-center text-white/80 text-sm max-w-2xl px-4">
              <p>{current.caption}</p>
              <p className="mt-1 text-white/50 text-xs">
                {currentIndex + 1} de {screenshots.length}
                <span className="hidden sm:inline"> · Pressione Esc para fechar</span>
                <span className="sm:hidden"> · Deslize para navegar</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
