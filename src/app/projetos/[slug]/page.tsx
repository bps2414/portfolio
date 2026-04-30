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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-10 md:py-20">
        <article className="container mx-auto max-w-5xl px-4">
          <Link
            href="/#projetos"
            className="mb-8 inline-flex items-center text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para projetos
          </Link>

          <header className="mb-14">
            {project.image && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) calc(100vw - 32px), 1024px"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>
            )}

            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              {project.type}
            </p>
            <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              {project.title}
            </h1>
            <p className="mb-8 max-w-3xl text-lg leading-relaxed text-secondary md:text-xl">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-4">
              {project.links.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                  className={getButtonClasses("primary", "default")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Acessar demo
                </a>
              )}
              {project.links.site && (
                <a
                  href={project.links.site}
                  target="_blank"
                  rel="noreferrer"
                  className={getButtonClasses("primary", "default")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Visitar site
                </a>
              )}
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className={getButtonClasses("outline", "default")}
                >
                  <Github className="mr-2 h-4 w-4" /> Ver código no GitHub
                </a>
              )}
            </div>
          </header>

          <div className="space-y-14">
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
      <section className="grid gap-8 border-y border-border py-10 md:grid-cols-[220px_minmax(0,1fr)]">
        <h2 className="text-2xl font-bold">Resumo</h2>
        <div className="space-y-5">
          <h3 className="text-2xl font-bold leading-tight">
            {project.caseStudy.summary.title}
          </h3>
          {project.caseStudy.summary.body.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 border-b border-border pb-2 text-2xl font-bold">
          Stack
        </h2>
        <div className="flex flex-wrap gap-3">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded bg-raised px-3 py-1.5 text-sm font-medium text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {project.caseStudy.sections.map((section) => (
        <section
          key={section.title}
          className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]"
        >
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <div className="space-y-4 text-secondary">
            {section.body?.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed md:text-lg">
                {paragraph}
              </p>
            ))}
            {section.items && (
              <ul className="grid gap-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border bg-surface px-4 py-3 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {project.caseStudy.screenshots && (
        <section>
          <h2 className="mb-6 border-b border-border pb-2 text-2xl font-bold">
            Telas do produto
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {project.caseStudy.screenshots.map((screenshot) => (
              <figure
                key={screenshot.src}
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={screenshot.width}
                  height={screenshot.height}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="max-h-[520px] w-full object-cover object-top"
                />
                <figcaption className="border-t border-border px-4 py-3 text-sm leading-relaxed text-secondary">
                  {screenshot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {project.limitations && (
        <ScopeNote
          title="Limitações conhecidas"
          icon="warning"
          text={project.limitations}
        />
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
      <section>
        <h2 className="mb-6 border-b border-border pb-2 text-2xl font-bold">
          Stack tecnológica
        </h2>
        <div className="flex flex-wrap gap-3">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded bg-raised px-3 py-1.5 text-sm font-medium text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {(project.limitations || project.microcopy) && (
        <ScopeNote
          title={project.limitations ? "Limitações conhecidas" : "Decisões de produto"}
          icon={project.limitations ? "warning" : "info"}
          text={project.limitations || project.microcopy || ""}
        />
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
      <h2 className="mb-6 border-b border-border pb-2 text-2xl font-bold">
        Notas sobre o escopo
      </h2>
      <div className="flex items-start gap-4 rounded-lg border border-border bg-surface p-6">
        <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
        <div className="space-y-2">
          <h3 className="font-semibold">{title}</h3>
          <p className="leading-relaxed text-secondary">{text}</p>
        </div>
      </div>
    </section>
  );
}
