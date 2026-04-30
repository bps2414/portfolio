# bps2414 — Portfólio

Portfólio pessoal construído com **Next.js 16**, **React 19**, **TypeScript** e **Tailwind CSS 4**, com foco em performance, acessibilidade e apresentação profissional de projetos.

🔗 **Demo:** [bps2414.vercel.app](https://bps2414.vercel.app)

---

## Projetos em destaque

| Projeto | Tipo | Stack |
|---|---|---|
| [ChamadaFácil](https://chamadafacil.vercel.app) | Sistema full-stack | Next.js, Supabase, PostgreSQL, RLS |
| [Prado Auto Peças](https://pradoautopecas.pages.dev) | Site real para negócio local | HTML, CSS, JavaScript |
| PTBRMerger | Ferramenta local técnica | Python, FFmpeg |
| Barbearia da Vila | Landing page comercial | Next.js, Framer Motion |

---

## Stack do portfólio

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4
- **Fontes:** Geist Sans (headings), Inter (corpo)
- **Tema:** dark-first com suporte a light mode via `next-themes`
- **Ícones:** lucide-react
- **Deploy:** Vercel

---

## Estrutura

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz (metadados, fontes, tema)
│   ├── page.tsx            # Home: hero, projetos, stack, processo, contato
│   ├── globals.css         # Design system e tokens CSS
│   ├── robots.ts           # Robots.txt dinâmico
│   ├── sitemap.ts          # Sitemap dinâmico
│   └── projetos/[slug]/
│       └── page.tsx        # Páginas de detalhe / estudo de caso
├── components/
│   ├── layout/
│   │   ├── header.tsx      # Cabeçalho com scroll detection e theme toggle
│   │   └── footer.tsx      # Rodapé com links
│   ├── ui/
│   │   └── button.tsx      # Utilitário de classes de botão
│   ├── fade-in.tsx         # Animação de entrada via IntersectionObserver
│   ├── icons.tsx           # Ícone GitHub SVG inline
│   ├── project-card.tsx    # Card de projeto (home)
│   ├── screenshot-gallery.tsx # Galeria com lightbox e suporte a swipe
│   ├── theme-provider.tsx  # Provider de tema (next-themes)
│   └── theme-toggle.tsx    # Botão dark/light mode
├── config/
│   └── site.ts             # Configuração global (nome, URL, links)
├── data/
│   └── projects.ts         # Dados dos projetos (tipo, stack, case study)
└── lib/
    └── utils.ts            # Utilitário cn() (clsx + tailwind-merge)
```

---

## Como rodar localmente

**Requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# → http://localhost:3000

# Verificar lint
npm run lint

# Build de produção
npm run build
```

---

## Deploy (Vercel)

O projeto está configurado para deploy direto no Vercel sem variáveis de ambiente adicionais:

1. Importar o repositório em [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Next.js** (detectado automaticamente)
3. Clicar em **Deploy**

> **Nota:** Atualizar `siteConfig.url` em `src/config/site.ts` com a URL final após o primeiro deploy.

---

## Adicionar novos projetos

Editar `src/data/projects.ts` e adicionar um objeto ao array `projects`:

```ts
{
  slug: "meu-projeto",        // URL: /projetos/meu-projeto
  title: "Meu Projeto",
  type: "tipo do projeto",
  order: 5,                   // Ordem na home
  description: "...",
  stack: ["React", "Node.js"],
  links: {
    demo: "https://...",
    github: "https://github.com/...",
  },
  isMain: false,              // true = seção principal, false = outros projetos
}
```

---

## Licença

MIT © [Bryan / bps2414](https://github.com/bps2414)
