import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";
import { getButtonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Code2, Wrench, LayoutTemplate, MessageSquare, CheckCircle2 } from "lucide-react";
import { Github } from "@/components/icons";
import { FadeIn } from "@/components/fade-in";
import { cn } from "@/lib/utils";

export default function Home() {
  const mainProjects = projects.filter((p) => p.isMain);
  const secondaryProjects = projects.filter((p) => !p.isMain);

  return (
    <div className="flex flex-col min-h-screen selection:bg-accent/30 selection:text-primary">
      <Header />
      
      <main className="flex-1">
        {/* 1. Hero */}
        <section className="relative min-h-[95vh] flex flex-col justify-center py-24 md:py-32 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/5 blur-[150px] rounded-[100%] pointer-events-none" />
          
          <div className="container mx-auto max-w-6xl px-6 relative z-10 mt-16 md:mt-0">
            <FadeIn>
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-secondary mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Disponível para novos projetos
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading font-extrabold tracking-tighter mb-8 max-w-5xl leading-[1.05]">
                Construo projetos web com foco em <span className="bg-gradient-to-r from-accent to-yellow-600 text-transparent bg-clip-text">clareza</span>, usabilidade e <span className="text-primary/70 italic font-medium">entrega real</span>.
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-lg md:text-2xl text-secondary max-w-3xl mb-12 leading-relaxed font-light">
                Sou Bryan / bps2414. Crio interfaces, sistemas simples e ferramentas úteis com foco em organização, experiência do usuário e apresentação profissional.
              </p>
            </FadeIn>
            
            <FadeIn delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <a href="#projetos" className={getButtonClasses("primary", "lg", "w-full sm:w-auto font-semibold")}>
                  Ver projetos selecionados
                </a>
                <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={getButtonClasses("outline", "lg", "w-full sm:w-auto font-semibold group")}>
                  <Github className="mr-2 h-5 w-5 text-secondary group-hover:text-primary transition-colors" /> GitHub
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="mt-12 max-w-3xl">
                <p className="text-sm font-medium text-secondary uppercase tracking-widest mb-4">Stack principal</p>
                <div className="flex flex-wrap gap-2.5">
                  {['React', 'Next.js', 'TypeScript', 'Tailwind', 'HTML', 'CSS', 'JavaScript', 'Supabase'].map((tech) => (
                    <div 
                      key={tech}
                      className="px-4 py-2 rounded border border-border/40 bg-surface/50 backdrop-blur-sm text-sm font-medium text-primary shadow-sm"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 2. Projetos Principais */}
        <section id="projetos" className="py-32 relative">
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
                    Casos de estudo com maior profundidade técnica e aplicação real no mercado local.
                  </p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {mainProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 150} className="h-full">
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Projetos Secundários */}
        <section className="py-32 bg-surface/30 border-y border-border">
          <div className="container mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="mb-16 md:mb-20 space-y-4 max-w-2xl">
                <div className="flex items-center gap-4 text-accent text-sm font-bold tracking-widest uppercase">
                  <span className="w-12 h-px bg-accent"></span>
                  Ferramentas & Demos
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">Outros projetos</h2>
                <p className="text-lg text-secondary leading-relaxed">
                  Experimentos técnicos, automação local e templates comerciais.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {secondaryProjects.map((project, i) => (
                <FadeIn key={project.slug} delay={i * 150} className="h-full">
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Sobre */}
        <section className="py-32">
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
                    Tenho interesse em desenvolvimento web, suporte técnico e criação de sites simples para pequenos negócios. Meu foco atual é construir projetos claros, navegáveis e fáceis de explicar para quem avalia o trabalho pelo resultado e pelo código.
                  </p>
                  <p>
                    Trabalho com escopos realistas: uma landing page precisa comunicar bem e carregar corretamente; um sistema web precisa ter fluxo compreensível, autenticação quando necessário e limites técnicos bem definidos.
                  </p>
                  
                  <div className="pt-8 mt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      "Organização de código",
                      "Acessibilidade básica",
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

        {/* 5. Stack e habilidades */}
        <section className="py-32 bg-surface/30 border-y border-border">
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
                  desc: "Desenvolvimento de interfaces performáticas e responsivas.",
                  skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Acessibilidade']
                },
                {
                  icon: Code2,
                  title: "Backend e Dados",
                  desc: "APIs, autenticação e modelagem de banco de dados.",
                  skills: ['Supabase', 'PostgreSQL', 'RLS', 'Server Actions', 'REST APIs', 'Node.js']
                },
                {
                  icon: Wrench,
                  title: "Ferramentas",
                  desc: "Controle de versão, deploy e automação local.",
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

        {/* 6. Processo */}
        <section className="py-32 overflow-hidden relative">
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

        {/* 7. Contato via GitHub */}
        <section className="py-32 relative border-t border-border">
          {/* Subtle glow for the final section */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-accent/5 blur-[100px] rounded-[100%] pointer-events-none" />
          
          <div className="container mx-auto max-w-4xl px-6 relative z-10">
            <FadeIn>
              <div className="p-12 md:p-24 rounded-3xl bg-surface border border-border shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
                
                <div className="mx-auto w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center mb-10 text-primary shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                
                <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6">Vamos conversar?</h2>
                <p className="text-lg md:text-xl text-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                  Para oportunidades em desenvolvimento web, suporte ou projetos para pequenos negócios, meu contato é direto pelo GitHub.
                </p>
                
                <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className={getButtonClasses("primary", "lg", "font-semibold shadow-lg")}>
                  <Github className="mr-3 h-5 w-5" /> Acessar Perfil no GitHub
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