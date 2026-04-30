import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";
import { getButtonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Code2, Wrench, LayoutTemplate, MessageSquare } from "lucide-react";
import { Github } from "@/components/icons";
import { FadeIn } from "@/components/fade-in";

export default function Home() {
  const mainProjects = projects.filter((p) => p.isMain);
  const secondaryProjects = projects.filter((p) => !p.isMain);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* 1. Hero */}
        <section className="relative min-h-[90vh] flex flex-col justify-center py-20 md:py-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto max-w-5xl px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
              Desenvolvedor web em início de carreira, com projetos <span className="bg-gradient-to-r from-[#F5C542] to-[#F0A500] text-transparent bg-clip-text">claros e verificáveis</span>.
            </h1>
            <p className="text-lg md:text-xl text-secondary max-w-2xl mb-8 leading-relaxed">
              Sou Bryan / bps2414. Construo interfaces, sistemas web simples e ferramentas locais com foco em clareza, utilidade e manutenção. Este portfólio reúne projetos selecionados em Next.js, React, TypeScript, Supabase e Python, com escopo honesto e links públicos.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-12">
              {['Next.js', 'TypeScript', 'Supabase', 'Python'].map((tech, i) => (
                <div 
                  key={tech}
                  className="hero-badge inline-flex items-center px-3 py-1.5 rounded-sm border border-border/50 bg-raised text-xs font-medium text-primary opacity-0"
                  style={{ animation: `fade-in-up 0.5s ease-out ${i * 100}ms forwards` }}
                >
                  {tech}
                </div>
              ))}
            </div>

            <div className="h-px w-full max-w-md bg-gradient-to-r from-border via-border/50 to-transparent mb-10" />

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#projetos" className={getButtonClasses("primary", "default", "w-full sm:w-auto text-base h-12 px-8 font-medium")}>Ver projetos</a>
              <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={getButtonClasses("outline", "default", "w-full sm:w-auto text-base h-12 px-8 font-medium")}>
                <Github className="mr-2 h-5 w-5" /> GitHub
              </a>
            </div>
          </div>
        </section>

        {/* 2. Projetos Principais */}
        <section id="projetos" className="py-24 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-5xl px-4">
            <FadeIn>
              <div className="mb-16 space-y-4">
                <div className="flex items-center gap-4 text-accent text-xs font-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  {"// 01 PROJETOS"}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Projetos principais</h2>
                <p className="text-lg text-secondary max-w-2xl leading-relaxed">Projetos com maior profundidade técnica ou aplicação real para pequenos negócios.</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 100}>
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Projetos Secundários */}
        <section className="py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <FadeIn>
              <div className="mb-16 space-y-4">
                <div className="flex items-center gap-4 text-accent text-xs font-bnt-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  {"// 02 EXPERIMENTOS"}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Ferramentas e demos</h2>
                <p className="text-lg text-secondary max-w-2xl leading-relaxed">Projetos secundários que mostram prática técnica, interfaces demonstráveis e ferramentas locais.</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {secondaryProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 100}>
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Sobre */}
        <section className="py-24 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-5xl px-4">
        <FadeIn>
              <div className="max-w-3xl space-y-8">
                <div className="flex items-center gap-4 text-accent text-xs font-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  {"// 03 SOBRE"}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Sobre mim</h2>
                <div className="space-y-6 text-secondary text-lg leading-relaxed">
                  <p>
                    Tenho interesse em desenvolvimento web, suporte técnico e criação de sites simples para pequenos negócios. Meu foco atual é construir projetos claros, navegáveis e fáceis de explicar para quem avalia o trabalho pelo resultado e pelo código.
                  </p>
                  <p>
                    Trabalho com escopos realistas: uma landing page precisa comunicar bem e carregar corretamente; um sistema web precisa ter fluxo compreensível, autenticação quando necessário e limites técnicos bem definidos.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 5. Stack e habilidades */}
        <section className="py-24">
          <div className="container mx-auto max-w-5xl px-4">
            <FadeIn>
              <div className="mb-16 space-y-4">
                <div className="flex items-center gap-4 text-accent text-xs font-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  {"// 04 STACK"}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Stack e habilidades</h2>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FadeIn delay={0}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <LayoutTemplate className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-xl">Frontend</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'HTML Semântico', 'Acessibilidade'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-raised text-primary text-sm font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn delay={100}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-xl">Backend e Dados</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Supabase', 'PostgreSQL', 'RLS', 'Server Actions', 'REST APIs'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-raised text-primary text-sm font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
              
              <FadeIn delay={200}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-xl">Ferramentas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Git', 'GitHub', 'Vercel', 'Python', 'PowerShell', 'FFmpeg'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-raised text-primary text-sm font-medium rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 6. Processo */}
        <section className="py-24 bg-surface/30 border-y border-border overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4">
            <FadeIn>
              <div className="mb-20 space-y-4">
                <div className="flex items-center gap-4 text-accent text-xs font-bold tracking-widest uppercase">
                  <span className="w-8 h-px bg-accent"></span>
                  {"// 05 MÉTODO"}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Processo de trabalho</h2>
              </div>
            </FadeIn>

            <div className="relative">
              {/* Connective Line */}
              <div className="absolute top-0 bottom-0 left-[27px] md:left-0 md:top-[27px] md:bottom-auto w-[2px] md:w-full md:h-[2px] bg-border z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                {[
                  { step: "01", title: "Entendimento", desc: "Levantamento do objetivo, do público e das restrições." },
                  { step: "02", title: "Definição", desc: "Escolha de uma solução compatível com o escopo." },
                  { step: "03", title: "Construção", desc: "Implementação focada em legibilidade e experiência." },
                  { step: "04", title: "Entrega", desc: "Publicação e organização do código para consulta." }
                ].map((item, i) => (
                  <FadeIn key={item.step} delay={i * 150}>
                    <div className="relative pl-16 md:pl-0 md:pt-16 flex flex-col group h-full">
                      <div className="absolute left-0 top-0 md:left-0 md:top-0 w-14 h-14 rounded-full bg-background border-2 border-border flex items-center justify-center font-heading font-bold text-primary group-hover:border-accent transition-colors z-10 shadow-sm">
                        {item.step}
                      </div>
                      
                      <div className="absolute -top-4 -left-2 md:-top-10 md:-left-4 text-[80px] md:text-[120px] font-heading font-extrabold text-foreground/[0.03] dark:text-white/[0.02] select-none pointer-events-none z-0">
                        {item.step}
                      </div>

                      <div className="relative z-10 mt-2 md:mt-4 bg-background p-6 rounded-lg border border-border flex-1">
                        <h3 className="font-heading font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Contato via GitHub */}
        <section className="py-32 relative">
          <div className="container mx-auto max-w-4xl px-4">
            <FadeIn>
              <div className="p-12 md:p-20 rounded-2xl bg-surface border border-border shadow-[0_0_60px_rgba(245,197,66,0.05)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                
                <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 text-accent">
                  <MessageSquare className="w-8 h-8" />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Vamos conversar?</h2>
                <p className="text-lg text-secondary mb-10 leading-relaxed max-w-2xl mx-auto">
                  Para oportunidades iniciais em desenvolvimento web, suporte ou projetos simples para pequenos negócios, o contato principal é via GitHub.
                </p>
                
                <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={getButtonClasses("primary", "default", "h-14 px-10 text-lg font-semibold inline-flex items-center")}>
                  <Github className="mr-3 h-6 w-6" /> Acessar Perfil no GitHub
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}