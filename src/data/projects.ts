export type Project = {
  slug: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  ogImage?: string;
  links: {
    demo?: string;
    site?: string;
    github?: string;
  };
  limitations?: string;
  microcopy?: string;
  isMain: boolean;
  caseStudy?: {
    summary: {
      title: string;
      body: string[];
    };
    sections: {
      title: string;
      body?: string[];
      items?: string[];
    }[];
    screenshots?: {
      src: string;
      alt: string;
      width: number;
      height: number;
      caption: string;
    }[];
  };
};

export const projects: Project[] = [
  {
    slug: "chamadafacil",
    title: "ChamadaFácil",
    type: "projeto técnico principal",
    description:
      "Help desk full-stack para pequenos negócios, com abertura pública de chamados, consulta por código e e-mail, painel administrativo protegido e gestão de status, urgência e respostas.",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "Supabase Auth",
      "Supabase PostgreSQL",
      "RLS",
      "Server Actions",
      "Vercel",
    ],
    image: {
      src: "/projects/chamadafacil-cover.png",
      alt: "Capa do projeto ChamadaFácil, sistema de chamados para pequenos negócios",
      width: 1672,
      height: 941,
    },
    ogImage: "/projects/chamadafacil-cover.png",
    links: {
      demo: "https://chamadafacil.vercel.app/",
      github: "https://github.com/bps2414/chamadafacil",
    },
    limitations:
      "MVP voltado a um único negócio; não inclui multiempresa, RBAC completo, anexos, SLA ou testes automatizados configurados no momento.",
    isMain: true,
    caseStudy: {
      summary: {
        title: "Um fluxo simples para registrar, acompanhar e responder chamados.",
        body: [
          "ChamadaFácil é um sistema web de chamados para pequenos negócios que precisam organizar solicitações de suporte sem depender de planilhas, conversas espalhadas ou acompanhamento manual.",
          "O produto cobre o fluxo essencial de um help desk interno: o solicitante abre um chamado sem criar conta, recebe um código, consulta o andamento com código e e-mail, e operadores autenticados gerenciam a fila em um painel administrativo protegido.",
        ],
      },
      sections: [
        {
          title: "Problema",
          body: [
            "Pequenos negócios costumam receber pedidos de suporte por WhatsApp, e-mail, ligações e mensagens informais. Isso facilita a perda de contexto, dificulta a priorização e deixa o solicitante sem visibilidade sobre o andamento.",
            "O desafio era criar um sistema suficientemente completo para demonstrar produto e engenharia full-stack, mas sem inflar o escopo como se fosse uma plataforma SaaS madura.",
          ],
        },
        {
          title: "Solução",
          body: [
            "O ChamadaFácil organiza o fluxo em duas áreas: rotas públicas para abertura e consulta de chamados, e rotas administrativas para operadores autenticados.",
            "A implementação usa Server Actions para criação, consulta e mutações; validações server-side; Supabase Auth para login administrativo; PostgreSQL com migrations; e RLS para limitar acesso direto às tabelas.",
          ],
        },
        {
          title: "Funcionalidades implementadas",
          items: [
            "Landing page em português brasileiro com chamadas para abrir e consultar chamados.",
            "Abertura pública de chamados sem cadastro.",
            "Geração automática de código no formato CF-YYYY-00000.",
            "Consulta pública por código do chamado e e-mail.",
            "Login administrativo com Supabase Auth.",
            "Dashboard protegido com estatísticas resumidas.",
            "Listagem responsiva de chamados com filtros por status e urgência.",
            "Tela de detalhe do chamado com dados do solicitante e histórico de respostas.",
            "Atualização de status e marcação de urgência.",
            "Respostas públicas do operador visíveis na consulta do solicitante.",
            "Estados de loading, erro, vazio e sucesso.",
            "Rate limit básico para formulários públicos com sujeitos armazenados em hash.",
          ],
        },
        {
          title: "Decisões técnicas",
          items: [
            "Next.js App Router separado em grupos de rotas públicas e administrativas.",
            "Server Components para composição de páginas e Server Actions para formulários e mutações.",
            "Camada src/lib/data para operações de dados e src/lib/validation para contratos de formulário.",
            "Supabase Auth com usuários administrativos criados manualmente.",
            "Supabase PostgreSQL com tabelas para tickets, respostas e eventos de rate limit.",
            "RLS habilitado em tabelas públicas e uso server-only da service role key em fluxos controlados.",
            "Proteção de rotas /admin por Next.js Proxy e revalidação server-side dentro das ações administrativas.",
            "Headers de segurança configurados no next.config.ts do projeto ChamadaFácil.",
            "Vercel como alvo principal de deploy documentado.",
          ],
        },
        {
          title: "Desafios",
          items: [
            "Equilibrar um fluxo público sem conta com privacidade mínima dos chamados.",
            "Evitar acesso anônimo direto para listar tickets ou respostas.",
            "Transformar uma ideia simples em um sistema navegável, com área pública e painel administrativo.",
            "Manter a UI clara no mobile e no desktop sem criar um dashboard genérico demais.",
            "Documentar limitações reais do MVP com honestidade.",
          ],
        },
        {
          title: "Aprendizados",
          items: [
            "Modelagem relacional para fluxo de atendimento.",
            "Migrations, constraints e políticas RLS no Supabase.",
            "Integração de Supabase Auth com sessões server-side.",
            "Uso de Server Actions para formulários com validação e feedback.",
            "Separar decisões de produto, segurança e UX em documentação clara.",
          ],
        },
        {
          title: "Próximos passos",
          items: [
            "RBAC com papéis de admin, operador e visualizador.",
            "Notificações por e-mail ao abrir ou responder chamados.",
            "Upload de anexos.",
            "Notas internas para operadores.",
            "Histórico e auditoria mais detalhados.",
            "SLA, indicadores de prazo e exportação CSV.",
            "Testes automatizados para fluxos críticos.",
          ],
        },
      ],
      screenshots: [
        {
          src: "/projects/chamadafacil/landing-desktop.png",
          alt: "Landing page do ChamadaFácil com chamadas para abrir e consultar chamados.",
          width: 1920,
          height: 3048,
          caption: "Página pública com explicação do fluxo e chamadas principais.",
        },
        {
          src: "/projects/chamadafacil/admin-dashboard.png",
          alt: "Dashboard administrativo do ChamadaFácil com cards de status e lista de chamados.",
          width: 1920,
          height: 1127,
          caption: "Painel protegido para acompanhar, filtrar e gerenciar a fila de chamados.",
        },
      ],
    },
  },
  {
    slug: "prado-auto-pecas",
    title: "Prado Auto Peças",
    type: "site real para negócio local",
    description:
      "Site institucional publicado para negócio local de autopeças e serviços relacionados, com foco em apresentação clara, contato rápido, SEO local e manutenção simples.",
    stack: ["HTML", "CSS", "JavaScript", "JSON", "PowerShell"],
    image: {
      src: "/projects/prado-auto-pecas-cover.png",
      alt: "Capa do projeto Prado Auto Peças, site institucional para negócio local",
      width: 1672,
      height: 941,
    },
    ogImage: "/projects/prado-auto-pecas-cover.png",
    links: {
      site: "https://pradoautopecas.pages.dev/",
      github: "https://github.com/bps2414/pradoautopecas",
    },
    limitations:
      "Site estático; não inclui backend, CMS online, login ou dados públicos de resultado.",
    isMain: true,
  },
  {
    slug: "ptbr-merger",
    title: "PTBRMerger",
    type: "ferramenta local técnica",
    description:
      "Ferramenta local para analisar arquivos MKV, detectar faixas de áudio PT-BR, criar um plano de processamento e gerar um arquivo final com FFmpeg/FFprobe.",
    stack: ["Python", "FFmpeg", "FFprobe", "Pytest", "HTML", "CSS", "JavaScript"],
    image: {
      src: "/projects/ptbr-merger-cover.png",
      alt: "Capa do projeto PTBRMerger, ferramenta local para automação de mídia",
      width: 1672,
      height: 941,
    },
    ogImage: "/projects/ptbr-merger-cover.png",
    links: {
      github: "https://github.com/bps2414/ptbr-merger",
    },
    microcopy:
      "Não exige demo pública: a ferramenta foi pensada para rodar localmente, com dependência de arquivos e utilitários instalados na máquina do usuário.",
    isMain: false,
  },
  {
    slug: "barbearia-da-vila",
    title: "Barbearia da Vila",
    type: "landing page comercial demonstrável",
    description:
      "Landing page responsiva para barbearia, com apresentação visual, serviços, galeria, equipe, FAQ, mapa, páginas legais, SEO básico e chamada para contato comercial.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Lucide React"],
    image: {
      src: "/projects/barbearia-da-vila-cover.png",
      alt: "Capa do projeto Barbearia da Vila, landing page comercial para barbearia",
      width: 1672,
      height: 941,
    },
    ogImage: "/projects/barbearia-da-vila-cover.png",
    links: {
      demo: "https://barbeariadavila.vercel.app/",
      github: "https://github.com/bps2414/landingparabarbearia",
    },
    limitations:
      "Projeto demonstrável; textos, dados comerciais e canais de contato devem ser revisados antes de uso por um negócio real.",
    isMain: false,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
