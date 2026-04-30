# Fases de Implementação

## Fase 0: inventário

### Objetivo

Levantar os projetos permitidos, links, stack, status, riscos e limites antes de escrever ou implementar.

### Tarefas

- Ler READMEs, docs e configs dos projetos.
- Confirmar links públicos.
- Registrar inconsistências.
- Separar projetos principais e secundários.

### Arquivos prováveis

- `.planning/portfolio/00-INVENTORY.md`

### Critério de pronto

Todos os quatro projetos têm inventário com descrição, status, links, pontos fortes, riscos e promessas proibidas.

## Fase 1: conteúdo

### Objetivo

Definir posicionamento e copy completa em PT-BR para home e estudos de caso.

### Tarefas

- Escrever hero, CTAs e microcopy.
- Escrever cards e descrições médias.
- Escrever seções sobre, stack, processo e contato.
- Escrever estudos de caso.
- Conferir se não há claims exagerados.

### Arquivos prováveis

- `.planning/portfolio/01-POSITIONING.md`
- `.planning/portfolio/02-CONTENT.md`
- `.planning/portfolio/03-PROJECT_CASE_STUDIES.md`

### Critério de pronto

Conteúdo pronto para implementação, sem dados pessoais fora do escopo profissional, sem claims falsos e com contato apenas via GitHub.

## Fase 2: branding

### Objetivo

Definir direção visual dark-first e regras de estilo para implementação.

### Tarefas

- Definir cores.
- Definir tipografia.
- Definir cards, hero, botões e páginas de projeto.
- Definir animações permitidas e proibidas.
- Escrever referência descritiva para Gemini.

### Arquivos prováveis

- `.planning/portfolio/04-BRAND_DIRECTION.md`

### Critério de pronto

Há uma direção visual clara, com preto/branco/amarelo, dark-first e sem estética genérica ou exagerada.

## Fase 3: arquitetura

### Objetivo

Definir rotas, seções, estrutura de dados, componentes e SEO antes do frontend.

### Tarefas

- Definir IA da home.
- Definir rotas obrigatórias.
- Definir schema de dados dos projetos.
- Definir organização de arquivos.
- Definir metadata, sitemap e robots.

### Arquivos prováveis

- `.planning/portfolio/05-IA_AND_ROUTES.md`

### Critério de pronto

Gemini ou outro agente consegue implementar sem perguntar estrutura básica.

## Fase 4: implementação frontend com Gemini 3.1 Pro

### Objetivo

Implementar a primeira versão funcional do portfólio com home, tema, rotas e dados dos projetos.

### Tarefas

- Criar app Next.js se o projeto ainda estiver vazio.
- Configurar TypeScript e Tailwind.
- Criar layout, header, footer e theme toggle.
- Criar dados centralizados dos projetos.
- Implementar home.
- Implementar roteamento dinâmico ou páginas dedicadas.
- Implementar metadata inicial.

### Arquivos prováveis

- `package.json`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/data/projects.ts`
- `src/components/**`

### Critério de pronto

Home renderiza, dark/light funcionam, cards aparecem na ordem correta e links externos apontam para GitHub/demos corretos.

## Fase 5: páginas de projeto

### Objetivo

Implementar estudos de caso navegáveis para cada rota obrigatória.

### Tarefas

- Criar páginas para os quatro slugs.
- Reutilizar dados centralizados.
- Montar seções de contexto, problema, solução, stack e próximos passos.
- Adicionar navegação entre projetos.
- Garantir fallback para slug inválido se usar rota dinâmica.

### Arquivos prováveis

- `src/app/projetos/[slug]/page.tsx`
- `src/components/projects/ProjectHero.tsx`
- `src/components/projects/ProjectCaseStudy.tsx`
- `src/components/projects/ProjectNavigation.tsx`

### Critério de pronto

Todas as rotas obrigatórias abrem, têm conteúdo completo e mantêm linguagem honesta.

## Fase 6: polish técnico

### Objetivo

Revisar qualidade, acessibilidade, responsividade, SEO e performance antes do deploy.

### Tarefas

- Rodar lint/build/typecheck.
- Testar mobile e desktop.
- Validar contraste e navegação por teclado.
- Conferir textos e links.
- Criar ou ajustar Open Graph.
- Conferir sitemap e robots.
- Remover claims exagerados.

### Arquivos prováveis

- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/opengraph-image.tsx` ou asset OG
- `src/app/globals.css`
- componentes de UI

### Critério de pronto

Build passa, links funcionam, layout é responsivo e o conteúdo está pronto para currículo.

## Fase 7: deploy na Vercel

### Objetivo

Publicar o portfólio e registrar URL final para currículo.

### Tarefas

- Subir repositório para GitHub.
- Importar na Vercel.
- Configurar domínio ou usar domínio `.vercel.app`.
- Conferir produção.
- Atualizar canonical, sitemap e metadata com domínio final.
- Rodar checklist final.

### Arquivos prováveis

- `vercel.json`, se necessário.
- `src/lib/metadata.ts`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `README.md`, se criado depois.

### Critério de pronto

URL pública funciona, SEO básico está correto, GitHub está linkado e o portfólio pode entrar no currículo.
