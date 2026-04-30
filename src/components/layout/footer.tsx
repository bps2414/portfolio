import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-accent/20 mt-16 py-8 relative z-10 bg-background">
      <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary">
        <p>© {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
