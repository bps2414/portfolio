import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";
import { getButtonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ArrowRight, Code2, Wrench, LayoutTemplate, CheckCircle2, Clock3, Settings2 } from "lucide-react";
import { Github, Whatsapp } from "@/components/icons";
import { FadeIn } from "@/components/fade-in";
import { cn } from "@/lib/utils";

const whatsappBudgetLink = siteConfig.links.whatsapp;

const faqItems = [
  {
    question: "Você cria sites para pequenos negócios?",
    answer:
      "Sim. Crio sites objetivos para pequenos negócios que precisam apresentar serviços, mostrar informações importantes e receber contatos pelo WhatsApp.",
  },
  {
    question: "Você faz landing pages?",
    answer:
      "Faço landing pages responsivas para negócios locais, serviços, projetos pessoais e validação de ideias. O foco é clareza, carregamento rápido e CTA bem definido.",
  },
  {
    question: "Você trabalha com projetos com painel administrativo?",
    answer:
      "Sim, quando o escopo pede edição de conteúdo, produtos, cardápio ou informações frequentes. Também deixo claro quando uma landing page simples resolve melhor.",
  },
  {
    question: "Quais tecnologias você usa?",
    answer:
      "Uso principalmente React, Next.js, TypeScript, Tailwind CSS, HTML, CSS, JavaScript, Git, GitHub e Vercel. Em alguns projetos também uso Supabase, PostgreSQL e Node.js.",
  },
  {
    question: "Como posso entrar em contato?",
    answer:
      "O caminho mais direto é pelo WhatsApp para orçamento e pelo GitHub para avaliar meus repositórios e projetos publicados.",
  },
  {
    question: "Você faz sites com foco em WhatsApp e SEO local?",
    answer:
      "Sim. Para pequenos negócios, costumo priorizar informações claras, botões de WhatsApp, estrutura básica de SEO local, sitemap, robots, Open Graph e boa leitura no mobile.",
  },
];

const servicePlans = [
  {
    kind: "package_landing" as const,
    title: "Landing Page Local",
    price: "R$ 200 a R$ 300",
    description: "Para negócios que precisam de uma página simples, bonita e publicada online.",
    idealFor: "Ideal para quem quer aparecer melhor online e não precisa alterar conteúdo com frequência.",
    deadline: "Prazo estimado: 3 a 7 dias",
    features: [
      "Página única profissional",
      "WhatsApp, Instagram e mapa",
      "Serviços, fotos e texto de apresentação",
      "Publicação online",
      "1 rodada de ajustes antes da publicação final",
    ],
  },
  {
    kind: "package_editable" as const,
    title: "Site com Painel / Cardápio Editável",
    price: "A partir de R$ 500",
    description: "Para negócios que precisam editar produtos, cardápio, informações ou conteúdos sem depender de alterar código.",
    idealFor: "Ideal para quem muda cardápio, produtos, preços ou informações com frequência.",
    deadline: "Prazo estimado: a partir de 7 dias",
    featured: true,
    features: [
      "Painel administrativo",
      "Login e área de edição",
      "Estrutura de produtos, cardápio ou conteúdos",
      "Publicação online",
      "Funcionalidades combinadas por escopo",
    ],
  },
];

export default function Home() {
  const featuredProjects = projects.filter((p) => p.isMain);
  const commercialSiteProjects = projects.filter((p) =>
    ["food-templates-bps", "barbearia-da-vila"].includes(p.slug)
  );
  const technicalProjects = projects.filter((p) =>
    ["ptbr-merger", "bps-fishing-macro"].includes(p.slug)
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: "Bryan Souza",
        url: siteConfig.url,
        sameAs: [siteConfig.links.github],
        jobTitle: "Desenvolvedor Web",
        knowsAbout: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "Landing Pages",
          "SEO Local",
          "Sites para pequenos negócios",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.title,
        url: siteConfig.url,
        inLanguage: siteConfig.language,
        description: siteConfig.description,
        publisher: {
          "@id": `${siteConfig.url}/#person`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteConfig.url}/#projects`,
        name: "Projetos de Bryan Souza",
        itemListElement: [...projects]
          .sort((a, b) => a.order - b.order)
          .map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteConfig.url}/projetos/${project.slug}`,
            name: project.title,
            description: project.description,
          })),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.url}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-accent/30 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="relative pt-20 pb-12 lg:pt-24 lg:pb-20 flex items-center overflow-hidden min-h-[85vh] lg:min-h-[90vh]">
          {/* Brilho de fundo suave */}
          <div className="hero-ambient-glow mobile-paint-lite absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] sm:w-[800px] sm:h-[500px] blur-[72px] sm:blur-[150px] rounded-[100%] pointer-events-none" />

          <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Lado Esquerdo: Conteúdo */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                <FadeIn>
                  <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono font-medium text-secondary mb-6 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Disponível para novos projetos
                  </div>
                </FadeIn>

                <FadeIn delay={100}>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter mb-6 leading-[1.15] text-primary">
                    Construo projetos web com foco em <span className="bg-gradient-to-r from-accent to-yellow-600 text-transparent bg-clip-text">clareza</span>, usabilidade e <span className="text-primary/70 italic font-medium">entrega real</span>.
                  </h1>
                </FadeIn>

                <FadeIn delay={200}>
                  <p className="text-base sm:text-lg md:text-xl text-secondary max-w-xl mb-8 leading-relaxed font-light">
                    Bryan Souza, desenvolvedor web. Crio landing pages rápidas e sistemas sob medida focados em performance, SEO local e conversão para o WhatsApp.
                  </p>
                </FadeIn>

                <FadeIn delay={300}>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <a href="#projetos" className={getButtonClasses("primary", "lg", "w-full sm:w-auto font-semibold")}>
                      Ver projetos
                    </a>
                    <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className={getButtonClasses("outline", "lg", "w-full sm:w-auto font-semibold group")}>
                      <Github className="mr-2 h-5 w-5 text-secondary group-hover:text-primary transition-colors" /> Ver GitHub
                    </a>
                  </div>
                </FadeIn>
              </div>

              {/* Lado Direito: Editor de Código Realista */}
              <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                <FadeIn delay={400} className="w-full max-w-md">
                  <div className="w-full rounded-xl border border-border bg-surface/80 backdrop-blur-md overflow-hidden shadow-2xl font-mono text-xs text-secondary">
                    {/* Header do editor */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-raised/50">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-80" />
                        <span className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-80" />
                        <span className="w-3 h-3 rounded-full bg-[#27C93F] opacity-80" />
                      </div>
                      <span className="text-[10px] text-secondary/60">validate-env.mjs</span>
                      <div className="w-12" />
                    </div>
                    {/* Linhas de código */}
                    <div className="p-5 space-y-1.5 overflow-x-auto select-none">
                      <div>
                        <span className="text-[#F43F5E]">import</span> <span className="text-[#38BDF8]">{`{ z }`}</span> <span className="text-[#F43F5E]">from</span> <span className="text-[#A7F3D0]">"zod"</span><span className="text-primary">;</span>
                      </div>
                      <div className="text-secondary/40">// Validação de ambiente</div>
                      <div>
                        <span className="text-[#F43F5E]">const</span> <span className="text-[#38BDF8]">envSchema</span> <span className="text-[#F43F5E]">=</span> <span className="text-[#38BDF8]">z</span><span className="text-primary">.</span><span className="text-[#F59E0B]">object</span><span className="text-primary">({`{`}</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-[#38BDF8]">NEXT_PUBLIC_SITE_URL</span><span className="text-primary">:</span> <span className="text-[#38BDF8]">z</span><span className="text-primary">.</span><span className="text-[#F59E0B]">string</span><span className="text-primary">().</span><span className="text-[#F59E0B]">url</span><span className="text-primary">(),</span>
                      </div>
                      <div>
                        <span className="text-primary">{`});`}</span>
                      </div>
                      <div className="h-2" />
                      <div>
                        <span className="text-[#F43F5E]">const</span> <span className="text-[#38BDF8]">parsed</span> <span className="text-[#F43F5E]">=</span> <span className="text-[#38BDF8]">envSchema</span><span className="text-primary">.</span><span className="text-[#F59E0B]">safeParse</span><span className="text-primary">(</span><span className="text-[#38BDF8]">process</span><span className="text-primary">.</span><span className="text-[#38BDF8]">env</span><span className="text-primary">);</span>
                      </div>
                      <div className="h-2" />
                      <div>
                        <span className="text-[#F43F5E]">if</span> <span className="text-primary">(</span><span className="text-[#F43F5E]">!</span><span className="text-[#38BDF8]">parsed</span><span className="text-primary">.</span><span className="text-[#38BDF8]">success</span><span className="text-primary">) {`{`}</span>
                      </div>
                      <div className="pl-4 text-[#F43F5E]">
                        process<span className="text-primary">.</span>exit<span className="text-primary">(</span><span className="text-[#F59E0B]">1</span><span className="text-primary">);</span>
                      </div>
                      <div>
                        <span className="text-primary">{`}`}</span>
                      </div>
                      <div className="h-2" />
                      <div className="text-[#27C93F] bg-[#27C93F]/10 px-2 py-1 rounded border border-[#27C93F]/20 inline-block font-sans font-medium text-[10px]">
                        ✓ Env check OK
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Faixa de Tecnologias (Stack Principal) */}
        <section className="border-y border-border bg-surface/20 py-6">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary/60">
                Stack principal
              </span>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS', 'JavaScript', 'Supabase'].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded bg-surface border border-border text-xs font-medium text-primary shadow-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Projetos Principais */}
        <section id="projetos" className="pt-10 pb-24 md:pt-14 md:pb-32 relative scroll-mt-24">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                    <span className="w-12 h-px bg-accent"></span>
                    Trabalho em Destaque
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">Projetos principais</h2>
                  <p className="text-lg text-secondary leading-relaxed">
                    Casos de estudo com maior profundidade técnica, aplicação real ou valor direto para pequenos negócios.
                  </p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {featuredProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 150} className="h-full">
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Sites e templates comerciais */}
        <section className="perf-section py-32 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-16 md:mb-20 space-y-4 max-w-2xl">
                <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                  <span className="w-12 h-px bg-accent"></span>
                  Presença digital
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Sites e templates comerciais</h2>
                <p className="text-lg text-secondary leading-relaxed">
                  Projetos voltados a criação de sites, páginas comerciais, demos publicadas, contato direto por WhatsApp e adaptação para negócios locais. Demos são identificadas como templates, não como clientes reais.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {commercialSiteProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 150} className="h-full">
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Projetos técnicos complementares */}
        <section className="perf-section py-20 border-b border-border/70">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-10 space-y-3 max-w-2xl">
                <div className="flex items-center gap-4 text-secondary text-xs font-bold tracking-widest uppercase">
                  <span className="w-10 h-px bg-border"></span>
                  Repertório técnico
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Projetos técnicos complementares</h2>
                <p className="text-base text-secondary leading-relaxed">
                  Ferramentas locais e automações que mostram aprendizado técnico, sem serem o foco principal de venda.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {technicalProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 100} className="h-full">
                  <div className="h-full rounded-xl border border-border/60 bg-surface/40 p-5 transition-colors hover:border-accent/30">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <span className="mb-3 inline-flex items-center rounded-sm border border-border bg-raised px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                          {project.type}
                        </span>
                        <h3 className="font-heading text-xl font-bold text-primary">
                          {project.title}
                        </h3>
                      </div>
                      {project.links.github && (
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 -m-2 text-secondary transition-colors hover:text-primary"
                          aria-label={`GitHub de ${project.title}`}
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                    <p className="mb-5 text-sm leading-relaxed text-secondary">
                      {project.description}
                    </p>
                    <div className="mb-5 flex flex-wrap gap-2">
                      {project.stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded border border-border/50 bg-raised px-2 py-1 text-xs font-medium text-secondary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/projetos/${project.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-secondary transition-colors hover:text-accent"
                    >
                      Ver detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Sobre */}
        <section className="perf-section py-32">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <FadeIn>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                    <span className="w-12 h-px bg-accent"></span>
                    Sobre
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">Postura profissional</h2>
                </div>
              </FadeIn>

              <FadeIn delay={150}>
                <div className="space-y-6 text-lg text-secondary leading-relaxed">
                  <p>
                    Tenho interesse em desenvolvimento web, suporte técnico, oportunidades de Jovem Aprendiz, estágio ou entrada em tecnologia, além de freelas pequenos e bem definidos. Meu foco atual é construir projetos claros, navegáveis e fáceis de explicar para quem avalia o trabalho pelo resultado e pelo código.
                  </p>
                  <p>
                    Trabalho com escopos realistas: uma landing page precisa comunicar bem, carregar corretamente e facilitar contato; um sistema web precisa ter fluxo compreensível, autenticação quando necessário e limites técnicos bem definidos.
                  </p>
                  <p>
                    Uso IA como apoio em pesquisa, revisão, prototipagem e aceleração de tarefas repetitivas, mantendo responsabilidade sobre decisões, validação, código final e limites de cada projeto.
                  </p>

                  <div className="pt-8 mt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      "Organização de código",
                      "SEO técnico básico",
                      "UI clara e direta",
                      "Documentação honesta"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-primary font-medium">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 6. Stack e habilidades */}
        <section className="perf-section py-32 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-20 space-y-4 max-w-2xl">
                <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                  <span className="w-12 h-px bg-accent"></span>
                  Conhecimento Técnico
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">Stack e Habilidades</h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: LayoutTemplate,
                  title: "Frontend",
                  desc: "Criação de sites responsivos, landing pages e interfaces web com boa leitura no mobile.",
                  skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS', 'JavaScript', 'Acessibilidade']
                },
                {
                  icon: Code2,
                  title: "Backend e Dados",
                  desc: "APIs, autenticação, modelagem de dados e fluxos simples com painel administrativo quando necessário.",
                  skills: ['Supabase', 'PostgreSQL', 'RLS', 'Server Actions', 'REST APIs', 'Node.js']
                },
                {
                  icon: Wrench,
                  title: "Ferramentas",
                  desc: "Controle de versão, deploy, SEO local básico e automação local.",
                  skills: ['Git', 'GitHub', 'Vercel', 'Python', 'PowerShell', 'FFmpeg']
                }
              ].map((block, i) => (
                <FadeIn key={block.title} delay={i * 150} className="h-full">
                  <div className="h-full p-8 rounded-2xl bg-background border border-border hover:border-accent/30 transition-colors flex flex-col">
                    <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center text-primary mb-6 shadow-sm">
                      <block.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl mb-3">{block.title}</h3>
                    <p className="text-secondary mb-8">{block.desc}</p>

                    <div className="mt-auto flex flex-wrap gap-2">
                      {block.skills.map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-raised text-primary text-sm font-medium rounded-md border border-border/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Processo */}
        <section className="perf-section py-32 overflow-hidden relative">
          <div className="container mx-auto max-w-6xl px-6 relative z-10">
            <FadeIn>
              <div className="mb-24 space-y-4 max-w-2xl mx-auto text-center">
                <div className="flex items-center justify-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  Método
                  <span className="w-8 h-px bg-accent"></span>
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">Processo de trabalho</h2>
              </div>
            </FadeIn>

            <div className="relative max-w-4xl mx-auto">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-0"></div>

              <div className="space-y-12 md:space-y-0 relative z-10">
                {[
                  { step: "01", title: "Entendimento", desc: "Levantamento do objetivo, do público-alvo e das restrições técnicas." },
                  { step: "02", title: "Definição", desc: "Escolha da stack adequada e planejamento da arquitetura da solução." },
                  { step: "03", title: "Construção", desc: "Implementação iterativa focada em legibilidade e experiência do usuário." },
                  { step: "04", title: "Entrega", desc: "Publicação, documentação de decisões e organização do repositório." }
                ].map((item, i) => (
                  <FadeIn key={item.step} delay={i * 100}>
                    <div className={cn(
                      "flex flex-col md:flex-row items-center gap-6 md:gap-12",
                      i % 2 === 0 ? "md:flex-row-reverse" : ""
                    )}>
                      <div className="w-full md:w-1/2 flex justify-center md:justify-end md:group-even:justify-start">
                        <div className={cn(
                          "w-full max-w-sm p-8 rounded-2xl border border-border bg-surface shadow-sm relative",
                          "before:absolute before:top-1/2 before:-translate-y-1/2 before:w-6 before:h-px before:bg-border hidden md:block",
                          i % 2 === 0 ? "before:-left-6 text-left" : "before:-right-6 text-right"
                        )}>
                          <div className="text-accent font-bold text-sm mb-2">Fase {item.step}</div>
                          <h3 className="font-heading font-bold text-2xl mb-3 text-primary">{item.title}</h3>
                          <p className="text-secondary leading-relaxed">{item.desc}</p>
                        </div>

                        {/* Mobile card version without the connector lines */}
                        <div className="w-full p-6 rounded-xl border border-border bg-surface text-center md:hidden">
                          <div className="text-accent font-bold text-sm mb-2">Fase {item.step}</div>
                          <h3 className="font-heading font-bold text-xl mb-2">{item.title}</h3>
                          <p className="text-secondary text-sm">{item.desc}</p>
                        </div>
                      </div>

                      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-background border-4 border-surface items-center justify-center font-bold text-primary z-20 shadow-md">
                        {item.step}
                      </div>

                      <div className="hidden md:block w-1/2"></div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. Planos comerciais */}
        <section className="perf-section py-28 md:py-32 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-14 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                    <span className="w-12 h-px bg-accent"></span>
                    Planos
                  </div>
                  <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">Planos simples para negócios locais</h2>
                  <p className="text-lg text-secondary leading-relaxed">
                    Sites objetivos para quem quer começar com presença profissional online, sem projeto inflado e sem complicação.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm leading-relaxed text-secondary md:max-w-sm">
                  Os valores servem como ponto de partida. O orçamento final depende do conteúdo, prazo, funcionalidades e nível de personalização.
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {servicePlans.map((plan, i) => (
                <FadeIn key={plan.title} delay={i * 150} className="h-full">
                  <div
                    className={cn(
                      "h-full rounded-2xl border bg-background p-6 sm:p-8 transition-colors",
                      plan.featured
                        ? "border-accent/50 shadow-[0_0_32px_rgba(234,179,8,0.08)]"
                        : "border-border"
                    )}
                  >
                    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-border bg-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
                          {plan.featured ? "Mais autonomia" : "Entrada rápida"}
                        </div>
                        <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-primary">
                          {plan.title}
                        </h3>
                      </div>
                      <div className="shrink-0 rounded-xl border border-border bg-surface px-4 py-3 text-left sm:text-right">
                        <div className="text-xs font-bold uppercase tracking-widest text-secondary">Investimento</div>
                        <div className="mt-1 text-xl font-heading font-bold text-primary">{plan.price}</div>
                      </div>
                    </div>

                    <p className="mb-5 text-base leading-relaxed text-secondary">
                      {plan.description}
                    </p>
                    <p className="mb-7 text-sm leading-relaxed text-primary">
                      {plan.idealFor}
                    </p>

                    <div className="mb-7 flex items-center gap-3 rounded-lg border border-border/70 bg-surface/60 px-4 py-3 text-sm font-medium text-primary">
                      <Clock3 className="h-5 w-5 shrink-0 text-accent" />
                      <span>{plan.deadline}</span>
                    </div>

                    <div className="mb-8 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex gap-3 text-sm leading-relaxed text-secondary">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3">
                      <a
                        href={`${whatsappBudgetLink}?text=${encodeURIComponent(
                          `Olá, tenho interesse no plano ${plan.title}. Gostaria de tirar algumas dúvidas.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={getButtonClasses(plan.featured ? "primary" : "outline", "lg", "w-full font-semibold")}
                      >
                        <Whatsapp className="mr-3 h-5 w-5" />
                        Conversar no WhatsApp
                      </a>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={250}>
              <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-background/70 p-5 text-sm leading-relaxed text-secondary md:grid-cols-[auto_1fr] md:items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-primary">
                  <Settings2 className="h-5 w-5" />
                </div>
                <p>
                  Depois da aprovação e publicação, novas alterações podem ser combinadas à parte. Projetos com painel editável reduzem a necessidade de ajustes manuais, porque o próprio cliente consegue atualizar informações principais.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="perf-section py-24 md:py-28 border-b border-border/70 scroll-mt-24">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-12 max-w-2xl space-y-4">
                <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                  <span className="w-12 h-px bg-accent"></span>
                  FAQ
                </div>
                <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
                  Perguntas rápidas
                </h2>
                <p className="text-lg text-secondary leading-relaxed">
                  Respostas diretas para quem está avaliando um freela, uma oportunidade de entrada em tecnologia ou a criação de uma landing page.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {faqItems.map((item, i) => (
                <FadeIn key={item.question} delay={i * 60} className="h-full">
                  <article className="h-full rounded-xl border border-border bg-surface/60 p-5 sm:p-6">
                    <h3 className="mb-3 font-heading text-lg font-bold leading-snug text-primary">
                      {item.question}
                    </h3>
                    <p className="text-sm leading-relaxed text-secondary">
                      {item.answer}
                    </p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Contato via WhatsApp */}
        <section className="perf-section py-32 relative border-t border-border">
          {/* Subtle glow for the final section */}
          <div className="mobile-paint-lite absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[220px] sm:h-[300px] bg-accent/5 blur-[56px] sm:blur-[100px] rounded-[100%] pointer-events-none" />

          <div className="container mx-auto max-w-4xl px-6 relative z-10">
            <FadeIn>
              <div className="p-6 sm:p-12 md:p-24 rounded-3xl bg-surface border border-border shadow-sm sm:shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

                <div className="mx-auto w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center mb-10 text-primary shadow-sm">
                  <Whatsapp className="w-9 h-9" />
                </div>

                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6">Vamos conversar?</h2>
                <p className="text-lg md:text-xl text-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                  Se quiser conversar sobre um projeto, tirar dúvidas ou pedir um orçamento, me chame direto no WhatsApp.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href={`${whatsappBudgetLink}?text=${encodeURIComponent("Olá, vi seu portfólio e gostaria de conversar sobre um projeto.")}`} target="_blank" rel="noopener noreferrer" className={getButtonClasses("primary", "lg", "w-full sm:w-auto font-semibold shadow-lg")}>
                    <Whatsapp className="mr-3 h-5 w-5" /> Conversar no WhatsApp
                  </a>
                  <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className={getButtonClasses("outline", "lg", "w-full sm:w-auto font-semibold")}>
                    <Github className="mr-3 h-5 w-5" /> Ver GitHub
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
