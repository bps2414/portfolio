# Arquitetura de Informação e Rotas

## Arquitetura de informação

Objetivo: permitir que recrutadores entendam rapidamente quem é Bryan / bps2414, que tipo de oportunidade busca, quais projetos demonstram habilidade e onde ver código.

Estrutura:

1. Hero com posicionamento, CTAs e GitHub.
2. Projetos principais.
3. Projetos secundários.
4. Sobre.
5. Stack e habilidades.
6. Processo.
7. Contato via GitHub.

## Rotas obrigatórias

- `/`
- `/projetos/chamadafacil`
- `/projetos/prado-auto-pecas`
- `/projetos/ptbr-merger`
- `/projetos/barbearia-da-vila`

## Ordem das seções na home

1. `HeroSection`
2. `FeaturedProjectsSection`
3. `SecondaryProjectsSection`
4. `AboutSection`
5. `SkillsSection`
6. `ProcessSection`
7. `ContactSection`

## Estrutura de dados dos projetos

```ts
export type ProjectPriority = "primary" | "secondary";

export type ProjectLink = {
  label: string;
  href: string;
  kind: "demo" | "site" | "github" | "case";
};

export type Project = {
  slug: "chamadafacil" | "prado-auto-pecas" | "ptbr-merger" | "barbearia-da-vila";
  title: string;
  priority: ProjectPriority;
  label: string;
  type: string;
  shortDescription: string;
  mediumDescription: string;
  problem: string;
  solution: string;
  stack: string[];
  strengths: string[];
  limitations: string[];
  links: ProjectLink[];
  status: string;
};
```

## Nomes de componentes

Layout:

- `SiteHeader`
- `SiteFooter`
- `ThemeToggle`
- `Container`
- `SectionHeader`

Home:

- `HeroSection`
- `FeaturedProjectsSection`
- `SecondaryProjectsSection`
- `ProjectCard`
- `AboutSection`
- `SkillsSection`
- `SkillGroup`
- `ProcessSection`
- `ProcessStep`
- `ContactSection`

Projeto:

- `ProjectHero`
- `ProjectMeta`
- `ProjectLinks`
- `ProjectCaseStudy`
- `CaseStudySection`
- `ProjectNavigation`

UI:

- `Button`
- `Badge`
- `Card`
- `StackList`
- `ExternalLink`

## Organização sugerida dos arquivos

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    sitemap.ts
    robots.ts
    projetos/
      [slug]/
        page.tsx
  components/
    layout/
      SiteHeader.tsx
      SiteFooter.tsx
      ThemeToggle.tsx
    home/
      HeroSection.tsx
      FeaturedProjectsSection.tsx
      SecondaryProjectsSection.tsx
      AboutSection.tsx
      SkillsSection.tsx
      ProcessSection.tsx
      ContactSection.tsx
    projects/
      ProjectCard.tsx
      ProjectHero.tsx
      ProjectCaseStudy.tsx
      ProjectNavigation.tsx
    ui/
      Button.tsx
      Badge.tsx
      Card.tsx
      Container.tsx
      SectionHeader.tsx
  data/
    projects.ts
    site.ts
  lib/
    metadata.ts
    routes.ts
```

## Estratégia para SEO

### Metadata base

- Site name: `Bryan / bps2414`
- Title home: `Bryan / bps2414 - Portfólio de desenvolvimento web`
- Description home: `Portfólio em PT-BR com projetos de desenvolvimento web, suporte/tecnologia, ferramentas locais e sites para pequenos negócios.`
- Locale: `pt_BR`
- Type: `website`
- Canonical: domínio final da Vercel quando existir.

### Metadata das páginas de projeto

Cada projeto deve ter:

- Title específico.
- Description honesta e curta.
- Open Graph com título e descrição.
- Canonical da rota.
- Link para GitHub no corpo, não necessariamente em metadata.

### Sitemap

Gerar sitemap com:

- `/`
- `/projetos/chamadafacil`
- `/projetos/prado-auto-pecas`
- `/projetos/ptbr-merger`
- `/projetos/barbearia-da-vila`

Prioridade sugerida:

- Home: `1.0`
- ChamadaFácil e Prado Auto Peças: `0.9`
- PTBRMerger e Barbearia da Vila: `0.8`

### Robots

Permitir indexação geral:

```text
User-agent: *
Allow: /
Sitemap: https://DOMINIO_FINAL/sitemap.xml
```

### Open Graph

Criar uma imagem OG simples e premium depois da implementação visual:

- Fundo preto.
- Nome `Bryan / bps2414`.
- Linha de apoio: `Desenvolvimento web, suporte e tecnologia`.
- Acento amarelo.

Não usar imagens de projetos sem confirmar direitos/qualidade.
