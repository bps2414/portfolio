# Prompt para Gemini 3.1 Pro

Você é um senior frontend engineer e product designer. Implemente o frontend do portfólio pessoal/profissional de Bryan / bps2414 diretamente no projeto, sem etapa de imagem e sem criar documentação longa adicional.

## Identidade

- Nome público: Bryan / bps2414.
- Idioma do site: PT-BR.
- Contato público: apenas GitHub.
- GitHub: https://github.com/bps2414
- Deploy alvo: Vercel.
- Não incluir dados pessoais fora do escopo profissional.
- Não usar rótulos informais que pareçam improviso sem método.
- Não inventar experiência profissional formal.
- Não inventar métricas, usuários, resultados financeiros ou claims não provados.
- Não mencionar detalhes comerciais internos ou problemas comerciais.

## Posicionamento

Bryan / bps2414 é um desenvolvedor web em início de carreira, com foco em projetos web claros, suporte/tecnologia, ferramentas locais e sites para pequenos negócios.

Headline recomendada:

> Desenvolvedor web em início de carreira, com projetos claros e publicáveis.

Subtítulo:

> Sou Bryan / bps2414. Construo interfaces, sistemas simples e ferramentas locais com foco em clareza, utilidade e documentação. Este portfólio reúne projetos em Next.js, React, TypeScript, Supabase e Python, com escopo honesto e links para GitHub.

## Branding

- Dark-first.
- Light mode como opção.
- Paleta: preto, branco e amarelo como acento.
- Visual premium, limpo, editorial tech, moderno e confiável.
- Evitar neon exagerado, estilo gamer, template genérico, glassmorphism excessivo, gradientes roxos, orbs/blobs e visual genérico de IA.
- Cards com radius 6-8px, fundo sólido e borda fina.
- Botão primário amarelo com texto preto.
- Botão secundário transparente com borda.

Cores sugeridas:

- Dark background: `#050505`
- Dark surface: `#0D0D0D`
- Dark raised: `#151515`
- Border dark: `#2A2A2A`
- Text primary dark: `#F5F5F5`
- Text secondary dark: `#B8B8B8`
- Accent: `#F5C542`
- Light background: `#FAFAF7`
- Light surface: `#FFFFFF`
- Text primary light: `#101010`
- Border light: `#DDD8C8`

Tipografia sugerida:

- Headings: Space Grotesk ou Geist.
- Body: Inter.
- Não usar letter spacing negativo.

## Estrutura da home

1. Hero
2. Projetos principais
3. Projetos secundários
4. Sobre
5. Stack e habilidades
6. Processo
7. Contato via GitHub

## Rotas obrigatórias

- `/`
- `/projetos/chamadafacil`
- `/projetos/prado-auto-pecas`
- `/projetos/ptbr-merger`
- `/projetos/barbearia-da-vila`

## Ordem dos projetos

Projetos principais:

1. ChamadaFácil
2. Prado Auto Peças

Projetos secundários:

3. PTBRMerger
4. Barbearia da Vila

## Conteúdo dos projetos

### ChamadaFácil

Tipo: projeto técnico principal.

Descrição curta:

Sistema web de chamados para pequenos negócios, com abertura pública, consulta por código e e-mail, painel administrativo autenticado, filtros, status, urgência e respostas do operador.

Stack:

Next.js, React, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, RLS, Server Actions.

Links:

- Demo: https://chamadafacil.vercel.app/
- GitHub: https://github.com/bps2414/chamadafacil

Limitações a mencionar:

MVP single-company; sem multiempresa, sem RBAC completo, sem anexos, sem SLA e sem testes automatizados configurados no momento.

### Prado Auto Peças

Tipo: site real para negócio local.

Descrição curta:

Site institucional estático para negócio local de guincho e auto peças, com foco em contato rápido, SEO local e manutenção simples por editor local.

Stack:

HTML, CSS, JavaScript, JSON e PowerShell.

Links:

- Site: https://pradoautopecas.pages.dev/
- GitHub: https://github.com/bps2414/pradoautopecas

Limitações a mencionar:

Site estático; sem backend, sem CMS online, sem login e sem métricas públicas de resultado.

### PTBRMerger

Tipo: ferramenta local técnica.

Descrição curta:

Aplicação local para analisar arquivos MKV, detectar áudio PT-BR, criar plano seguro e gerar um arquivo final com FFmpeg/FFprobe.

Stack:

Python, FFmpeg, FFprobe, Pytest, HTML, CSS, JavaScript.

Links:

- GitHub: https://github.com/bps2414/ptbr-merger

Microcopy obrigatória:

Sem demo pública por decisão de produto: a ferramenta roda localmente em `127.0.0.1`.

### Barbearia da Vila

Tipo: landing page comercial demonstrável.

Descrição curta:

Landing page responsiva para barbearia, com hero visual, serviços, galeria, equipe, FAQ, mapa, páginas legais, SEO básico e CTA para WhatsApp.

Stack:

Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.

Links:

- Demo: https://barbeariadavila.vercel.app/
- GitHub: https://github.com/bps2414/landingparabarbearia

Limitações a mencionar:

Projeto demonstrável; dados comerciais devem ser revisados antes de uso real.

## Requisitos técnicos

- Use Next.js App Router, TypeScript e Tailwind CSS.
- Crie dados dos projetos em arquivo centralizado.
- Implemente dark/light mode.
- Crie rotas obrigatórias.
- Use componentes reutilizáveis.
- Não criar backend.
- Não criar formulário de contato.
- Não adicionar e-mail, telefone ou redes sociais além do GitHub.
- Não implementar analytics nesta fase, a menos que já exista no template do projeto.

## Responsividade

- Mobile-first real.
- Hero deve caber bem em telas estreitas.
- Cards em coluna no mobile e grid controlado no desktop.
- Botões com área de toque confortável.
- Texto não pode sobrepor elementos.
- Evitar layouts com colunas apertadas em mobile.

## SEO

- Metadata base em PT-BR.
- Open Graph básico.
- Canonical usando domínio final como variável/configuração.
- `sitemap.ts` com todas as rotas.
- `robots.ts` permitindo indexação.
- Titles e descriptions únicos para páginas de projeto.

## Acessibilidade

- HTML semântico.
- Contraste adequado.
- Navegação por teclado.
- Foco visível.
- Links externos com texto claro.
- Respeitar `prefers-reduced-motion`.
- Botão de tema com label acessível.

## Critérios de pronto

- Todas as rotas obrigatórias renderizam.
- Home mostra os projetos na ordem correta.
- Dark mode é padrão e light mode funciona.
- Todos os links públicos estão corretos.
- Contato aparece apenas como GitHub.
- Não há dados pessoais fora do escopo profissional, métricas inventadas ou experiência formal inventada.
- Textos dos projetos deixam limitações claras.
- `npm run build` passa.
- `npm run lint` passa, se existir.
- Layout funciona em mobile e desktop.
