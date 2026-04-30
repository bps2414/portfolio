import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Github } from "@/components/icons";
import { getButtonClasses } from "@/components/ui/button";
import { getProjectBySlug, projects } from "@/data/projects";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/fade-in";

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
  const socialImage = project.ogImage ? `${siteConfig.url}${project.ogImage}` : undefined;
  const isDedicatedOgImage = project.ogImage?.endsWith("/og-image.png");
  const images = socialImage
    ? [
        {
          url: socialImage,
          width: isDedicatedOgImage ? 1200 : (project.image?.width ?? 1672),
          height: isDedicatedOgImage ? 630 : (project.image?.height ?? 941),
          alt: project.image?.alt ?? project.title,
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

  return (
    <div className="flex min-h-screen flex-col selection:bg-accent/30 selection:text-primary">
      <Header />

      <main className="flex-1 pt-24 pb-16 md:pt-32 md:pb-24">
        <article className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <FadeIn>
              <Link
                href="/#projetos"
                className="mb-12 inline-flex items-center text-sm font-medium text-secondary transition-colors hover:text-primary"
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
                <h1 className="mb-6 max-w-4xl text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-primary">
                  {project.title}
                </h1>
                <p className="mb-10 max-w-3xl text-xl leading-relaxed text-secondary font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-4">
                  {project.links.demo && (
                    <a href={project.links.demo} target="_blank" rel="noreferrer" className={getButtonClasses("primary", "lg")}>
                      Acessar demo <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  {project.links.site && (
                    <a href={project.links.site} target="_blank" rel="noreferrer" className={getButtonClasses("primary", "lg")}>
                      Visitar site <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noreferrer" className={getButtonClasses("outline", "lg")}>
                      <Github className="mr-2 h-5 w-5" /> Ver código fonte
                    </a>
                  )}
                </div>
              </FadeIn>
            </header>
          </div>

          <FadeIn delay={200}>
            {project.image && (
              <div className="max-w-6xl mx-auto relative mb-20 aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl group">
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]" />
              </div>
            )}
          </FadeIn>

          <div className="max-w-4xl mx-auto space-y-24">
            {project.caseStudy ? (
              <ProjectCaseStudy project={project} />
            ) : (
              <DefaultProjectDetails project={project} />
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
        <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] items-baseline">
          <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
            <span className="w-8 h-px bg-accent"></span>
            Resumo
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-heading font-bold leading-tight text-primary">
              {project.caseStudy.summary.title}
            </h3>
            {project.caseStudy.summary.body.map((paragraph) => (
              <p key={paragraph} className="text-lg md:text-xl leading-relaxed text-secondary font-light">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
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

      {project.caseStudy.sections.map((section, index) => (
        <FadeIn key={section.title} delay={index * 50}>
          <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] pt-12 border-t border-border/40">
            <h2 className="text-2xl font-heading font-bold text-primary">{section.title}</h2>
            <div className="space-y-6">
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-relaxed text-secondary">
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

      {project.caseStudy.screenshots && (
        <FadeIn>
          <section className="pt-12 border-t border-border/40">
            <h2 className="mb-10 text-3xl font-heading font-bold">Telas do produto</h2>
            <div className="grid gap-12 md:grid-cols-2">
              {project.caseStudy.screenshots.map((screenshot) => (
                <figure
                  key={screenshot.src}
                  className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg group"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <Image
                      src={screenshot.src}
                      alt={screenshot.alt}
                      width={screenshot.width}
                      height={screenshot.height}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="border-t border-border px-6 py-4 text-sm leading-relaxed text-secondary">
                    {screenshot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </FadeIn>
      )}

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
      <FadeIn>
        <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)]">
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

      {(project.limitations || project.microcopy) && (
        <FadeIn>
          <div className="pt-12 border-t border-border/40">
            <ScopeNote
              title={project.limitations ? "Limitações conhecidas" : "Decisões de produto"}
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
