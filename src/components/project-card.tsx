import Link from "next/link";
import { Project } from "@/data/projects";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Github } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isMain = project.isMain;
  const orderLabel = String(project.order).padStart(2, "0");

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-xl bg-surface transition-[border-color,transform] duration-300 ease-out md:transition-[border-color,transform,box-shadow] md:duration-500",
        "md:hover:-translate-y-2 md:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        isMain
          ? "border border-border hover:border-accent/40"
          : "border border-border/60 hover:border-accent/30"
      )}
    >
      {/* Accent left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent/0 group-hover:bg-accent transition-colors duration-500" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-accent/5 to-transparent z-0" />

      {/* Order number watermark */}
      <div
        className="absolute top-4 right-5 text-[5rem] md:text-[6rem] font-heading font-black leading-none text-primary/[0.04] select-none pointer-events-none z-0 transition-colors duration-500 group-hover:text-accent/[0.08]"
        aria-hidden="true"
      >
        {orderLabel}
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col gap-5 z-10 relative">
        {/* Header: badge + type */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-sm border",
              isMain
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-raised text-secondary border-border"
            )}
          >
            {project.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary group-hover:text-accent transition-colors duration-300">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-base text-secondary leading-relaxed flex-1">
          {project.description}
        </p>

        {/* Stack tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {project.stack.slice(0, isMain ? 5 : 4).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded bg-raised px-2.5 py-1 text-xs font-medium text-secondary border border-border/50"
            >
              {tech}
            </span>
          ))}
          {project.stack.length > (isMain ? 5 : 4) && (
            <span className="inline-flex items-center rounded bg-transparent px-2 text-xs font-medium text-secondary/70">
              +{project.stack.length - (isMain ? 5 : 4)}
            </span>
          )}
        </div>
      </div>

      {/* Footer: CTA + links */}
      <div className="p-6 md:p-8 pt-0 mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
        <Link
          href={`/projetos/${project.slug}`}
          className="inline-flex items-center text-sm font-semibold text-primary group-hover:text-accent transition-colors"
        >
          {project.caseStudy ? "Ver estudo de caso" : "Ver detalhes"}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0 mt-2 sm:mt-0">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="p-2 -m-2 text-secondary hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {(project.links.demo || project.links.site) && (
            <a
              href={project.links.demo || project.links.site}
              target="_blank"
              rel="noreferrer"
              className="p-2 -m-2 text-secondary hover:text-primary transition-colors"
              aria-label="Visitar site"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
