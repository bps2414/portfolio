import { siteConfig } from "@/config/site";
import { Github } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 relative z-10 bg-background overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="container mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="font-heading font-bold text-lg">bps2414.</span>
          <p className="text-sm text-secondary">
            Construindo projetos web com clareza e entrega real.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-secondary">
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} {siteConfig.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}
