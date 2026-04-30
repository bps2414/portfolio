import Link from "next/link";
import Image from "next/image";
import { Project } from "@/data/projects";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Github } from "@/components/icons";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isMain = project.isMain;
  return (
    <div className={`group flex flex-col h-full overflow-hidden rounded-lg border bg-surface transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl ${isMain ? "border-l-[2px] border-l-accent border-y-border border-r-border hover:border-accent/50" : "border-border hover:border-accent/50"}`}>
      {project.image && (
        <div
          className={`relative mx-3 mt-3 aspect-[16/9] overflow-hidden rounded-md border border-border/70 bg-raised ${
            isMain
              ? "shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
              : "shadow-[0_12px_34px_rgba(0,0,0,0.16)]"
          }`}
        >
          <Image
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            sizes="(max-width: 768px) calc(100vw - 56px), 480px"
            priority={isMain}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 flex flex-col gap-5">
        <div className="space-y-3">
          <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm ${isMain ? "bg-accent/10 text-accent" : "bg-raised text-secondary"}`}>
            {project.type}
          </span>
          <h3 className="text-2xl font-heading font-bold group-hover:text-accent transition-colors">{project.title}</h3>
        </div>
        
        <p className="text-base text-secondary leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          {project.stack.slice(0, 4).map((tech) => (
            <span key={tech} className="inline-flex items-center rounded-full bg-raised px-3 py-1 text-xs font-semibold tracking-wide uppercase text-secondary">
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="inline-flex items-center rounded-full bg-raised px-3 py-1 text-xs font-semibold tracking-wide uppercase text-secondary">
              +{project.stack.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8 pt-0 mt-auto flex items-center justify-between gap-4 border-t border-border/40 mt-6 pt-6">
        <Link href={`/projetos/${project.slug}`} className="inline-flex items-center text-sm font-semibold hover:text-accent transition-colors">
          Ver detalhes <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <div className="flex items-center gap-3">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
          )}
          {(project.links.demo || project.links.site) && (
            <a href={project.links.demo || project.links.site} target="_blank" rel="noreferrer" className="text-secondary hover:text-primary transition-colors" aria-label="Visitar site">
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
