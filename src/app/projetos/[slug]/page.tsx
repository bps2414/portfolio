import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Info,
  Lightbulb,
  Zap,
  Layers,
  BookOpen,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Github } from "@/components/icons";
import { getButtonClasses } from "@/components/ui/button";
import { getProjectBySlug, projects } from "@/data/projects";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/fade-in";
import { ScreenshotGallery } from "@/components/screenshot-gallery";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.slug);

  if (!project) {
    return {
      title: "Projeto não encontrado",
    };
  }

  const url = `${siteConfig.url}/projetos/${project.slug}`;
  const title = `${project.title} | ${siteConfig.name}`;
  const socialImage = project.ogImage
    ? `${siteConfig.url}${project.ogImage}`
    : undefined;
  const images = socialImage
    ? [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ]
    : undefined;

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: project.description,
      url,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const project = getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  // Mantém a navegação alinhada à ordem visual do portfólio.
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);
  const currentIndex = orderedProjects.findIndex((p) => p.slug === project.slug);
  const prevProject =
    currentIndex > 0 ? orderedProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < orderedProjects.length - 1
      ? orderedProjects[currentIndex + 1]
      : null;

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent/30 selection:text-primary">
      <Header />

      <main className="flex-1 pt-24 pb-16 md:pt-32 md:pb-24">
        <article className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <Link
                href="/#projetos"
                className="mb-10 inline-flex items-center text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para projetos
              </Link>
            </FadeIn>

            <header className="mb-16 md:mb-24">
              <FadeIn delay={100}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm bg-accent/10 text-accent border border-accent/20">
                    {project.type}
                  </span>
                </div>
                <h1 className="mb-6 max-w-4xl text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-primary">
                  {project.title}
                </h1>
                <p className="mb-10 max-w-3xl text-xl leading-relaxed text-secondary font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {project.links.demo && !project.demoLinks?.length && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getButtonClasses("primary", "lg")}
                    >
                      Acessar demo{" "}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  {project.links.site && (
                    <a
                      href={project.links.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getButtonClasses("primary", "lg")}
                    >
                      Visitar site{" "}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getButtonClasses("outline", "lg")}
                    >
                      <Github className="mr-2 h-5 w-5" /> Ver código fonte
                    </a>
                  )}
                </div>

                {project.demoLinks && project.demoLinks.length > 0 && (
                  <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-surface/50 p-5">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary">
                      Demos publicadas
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {project.demoLinks.map((demo) => (
                        <a
                          key={demo.href}
                          href={demo.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={getButtonClasses("outline", "sm")}
                        >
                          {demo.label}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </FadeIn>
            </header>
          </div>

          <div className="max-w-4xl mx-auto space-y-24">
            {project.caseStudy ? (
              <ProjectCaseStudy project={project} />
            ) : (
              <DefaultProjectDetails project={project} />
            )}

            {/* Project navigation */}
            {(prevProject || nextProject) && (
              <FadeIn>
                <nav
                  className="pt-12 border-t border-border/40"
                  aria-label="Navegação entre projetos"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {prevProject ? (
                      <Link
                        href={`/projetos/${prevProject.slug}`}
                        className="group p-6 rounded-xl border border-border bg-surface hover:border-accent/30 transition-colors duration-300"
                      >
                        <div className="text-xs font-bold tracking-widest uppercase text-secondary mb-2">
                          ← Anterior
                        </div>
                        <div className="font-heading font-bold text-lg text-primary group-hover:text-accent transition-colors">
                          {prevProject.title}
                        </div>
                      </Link>
                    ) : (
                      <div />
                    )}
                    {nextProject && (
                      <Link
                        href={`/projetos/${nextProject.slug}`}
                        className="group p-6 rounded-xl border border-border bg-surface hover:border-accent/30 transition-colors duration-300 text-right"
                      >
                        <div className="text-xs font-bold tracking-widest uppercase text-secondary mb-2">
                          Próximo →
                        </div>
                        <div className="font-heading font-bold text-lg text-primary group-hover:text-accent transition-colors">
                          {nextProject.title}
                        </div>
                      </Link>
                    )}
                  </div>
                </nav>
              </FadeIn>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

function ProjectCaseStudy({
  project,
}: {
  project: NonNullable<ReturnType<typeof getProjectBySlug>>;
}) {
  if (!project.caseStudy) return null;

  return (
    <>
      <FadeIn>
        <section className="perf-section grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] items-baseline">
          <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
            <span className="w-8 h-px bg-accent"></span>
            Resumo
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-heading font-bold leading-tight text-primary">
              {project.caseStudy.summary.title}
            </h3>
            {project.caseStudy.summary.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg md:text-xl leading-relaxed text-secondary font-light"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="perf-section grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="flex items-center gap-4 text-secondary text-sm font-bold tracking-widest uppercase">
            <span className="w-8 h-px bg-border"></span>
            Stack
          </div>
          <div className="flex flex-wrap gap-3">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-surface border border-border/60 px-4 py-2 text-sm font-medium text-primary shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </FadeIn>

      {project.screenshots && project.screenshots.length > 0 && (
        <FadeIn>
          <ScreenshotGallery screenshots={project.screenshots} />
        </FadeIn>
      )}

      {project.caseStudy.screenshots &&
        project.caseStudy.screenshots.length > 0 && (
          <FadeIn>
            <ScreenshotGallery screenshots={project.caseStudy.screenshots} />
          </FadeIn>
        )}

      {project.caseStudy.sections.map((section, index) => (
        <FadeIn key={section.title} delay={index * 50}>
          <section className="perf-section grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] pt-12 border-t border-border/40">
            <h2 className="text-2xl font-heading font-bold text-primary">
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lg leading-relaxed text-secondary"
                >
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="grid gap-4 mt-6">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="relative pl-6 text-secondary text-lg leading-relaxed before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-accent/50 before:rounded-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </FadeIn>
      ))}

      {project.limitations && (
        <FadeIn>
          <ScopeNote
            title="Limitações conhecidas"
            icon="warning"
            text={project.limitations}
          />
        </FadeIn>
      )}
    </>
  );
}

function DefaultProjectDetails({
  project,
}: {
  project: NonNullable<ReturnType<typeof getProjectBySlug>>;
}) {
  return (
    <>
      {/* Stack */}
      <FadeIn>
        <section className="perf-section grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="flex items-center gap-4 text-secondary text-sm font-bold tracking-widest uppercase">
            <span className="w-8 h-px bg-border"></span>
            Stack
          </div>
          <div className="flex flex-wrap gap-3">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-md bg-surface border border-border/60 px-4 py-2 text-sm font-medium text-primary shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </FadeIn>

      {project.screenshots && project.screenshots.length > 0 && (
        <FadeIn>
          <ScreenshotGallery screenshots={project.screenshots} />
        </FadeIn>
      )}

      {/* Features */}
      {project.features && project.features.length > 0 && (
        <FadeIn>
          <section className="perf-section pt-12 border-t border-border/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-primary">
                Funcionalidades
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.features.map((feature, i) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-border/40 hover:border-accent/20 transition-colors duration-300"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded bg-raised border border-border flex items-center justify-center text-xs font-bold text-secondary mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-secondary leading-relaxed text-sm">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Technical Decisions */}
      {project.technicalDecisions &&
        project.technicalDecisions.length > 0 && (
          <FadeIn>
            <section className="perf-section pt-12 border-t border-border/40">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-primary">
                  Decisões técnicas
                </h2>
              </div>
              <div className="space-y-4">
                {project.technicalDecisions.map((decision) => (
                  <div
                    key={decision}
                    className="relative pl-6 text-secondary text-lg leading-relaxed before:absolute before:left-0 before:top-2.5 before:w-2 before:h-2 before:bg-accent/50 before:rounded-sm"
                  >
                    {decision}
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

      {/* Learnings */}
      {project.learnings && project.learnings.length > 0 && (
        <FadeIn>
          <section className="perf-section pt-12 border-t border-border/40">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-primary">
                O que aprendi
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.learnings.map((learning) => (
                <div
                  key={learning}
                  className="flex items-start gap-3 p-4 rounded-lg bg-surface border border-border/40"
                >
                  <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                  <p className="text-secondary leading-relaxed text-sm">
                    {learning}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

      {/* Limitations / Microcopy */}
      {(project.limitations || project.microcopy) && (
        <FadeIn>
          <div className="pt-12 border-t border-border/40">
            <ScopeNote
              title={
                project.limitations
                  ? "Limitações conhecidas"
                  : "Decisões de produto"
              }
              icon={project.limitations ? "warning" : "info"}
              text={project.limitations || project.microcopy || ""}
            />
          </div>
        </FadeIn>
      )}
    </>
  );
}

function ScopeNote({
  icon,
  text,
  title,
}: {
  icon: "info" | "warning";
  text: string;
  title: string;
}) {
  const Icon = icon === "warning" ? AlertTriangle : Info;

  return (
    <section>
      <div className="flex flex-col sm:flex-row items-start gap-6 rounded-2xl border border-border bg-surface/50 p-8">
        <div className="w-12 h-12 rounded-full bg-raised border border-border flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="space-y-3 pt-1">
          <h3 className="font-heading font-bold text-xl">{title}</h3>
          <p className="leading-relaxed text-secondary text-lg">{text}</p>
        </div>
      </div>
    </section>
  );
}
