export type ProjectScreenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  type: string;
  description: string;
  stack: string[];
  order: number;
  ogImage?: string;
  links: {
    demo?: string;
    site?: string;
    github?: string;
  };
  demoLinks?: {
    label: string;
    href: string;
  }[];
  limitations?: string;
  microcopy?: string;
  isMain: boolean;
  screenshots?: ProjectScreenshot[];
  features?: string[];
  technicalDecisions?: string[];
  learnings?: string[];
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
    screenshots?: ProjectScreenshot[];
  };
};

export const projects: Project[] = [
  {
    slug: "chamadafacil",
    title: "ChamadaFácil",
    type: "projeto técnico principal",
    order: 1,
    description:
      "Sistema full-stack de chamados para pequenos negócios, com abertura pública, consulta por código/e-mail e painel admin protegido com fila operacional.",
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL/RLS",
      "Server Actions",
      "Tailwind",
      "Full-stack",
      "Testes",
    ],
    ogImage: "/projects/chamadafacil/landing-desktop.png",
    links: {
      demo: "https://chamadafacil.vercel.app/",
      github: "https://github.com/bps2414/chamadafacil",
    },
    limitations:
      "MVP voltado a um único negócio; não inclui multiempresa, anexos, chat em tempo real, e-mail transacional ou RBAC completo. O foco é demonstrar um produto técnico realista, não um SaaS enterprise.",
    isMain: true,
    caseStudy: {
      summary: {
        title: "Um fluxo claro para abrir, acompanhar e operar chamados.",
        body: [
          "ChamadaFácil é um sistema web de chamados para pequenos negócios que precisam organizar solicitações de suporte sem depender de planilhas, conversas espalhadas ou acompanhamento manual.",
          "O produto cobre o fluxo essencial de um help desk interno: o solicitante abre um chamado sem criar conta, recebe um código copiável, consulta o andamento com código e e-mail, e operadores autenticados gerenciam a fila em um painel administrativo protegido.",
        ],
      },
      sections: [
        {
          title: "Problema",
          body: [
            "Pequenos negócios costumam receber solicitações por WhatsApp, e-mail, ligações e mensagens informais. Isso espalha o contexto, dificulta o acompanhamento e deixa o solicitante sem uma forma simples de consultar o andamento.",
            "O desafio era criar um sistema suficientemente completo para demonstrar produto e engenharia full-stack, mas sem inflar o escopo como se fosse uma plataforma SaaS madura.",
          ],
        },
        {
          title: "Solução",
          body: [
            "O ChamadaFácil organiza o fluxo em duas áreas: rotas públicas para abertura e consulta de chamados, e rotas administrativas para operadores autenticados acompanharem a fila de atendimento.",
            "A implementação usa Server Actions para criação, consulta e mutações; validações server-side; Supabase Auth para login administrativo; PostgreSQL com migrations; e RLS para limitar acesso direto às tabelas.",
          ],
        },
        {
          title: "Melhorias recentes",
          items: [
            "Estado de sucesso com código do chamado destacado, botão de copiar e CTA para consulta.",
            "Consulta pública mais clara, com mensagens neutras para chamado não encontrado e erro técnico.",
            "Fila administrativa com busca, filtros por status/urgência/resposta e ordenação por atualização, criação ou urgência.",
            "Destaques visuais para chamados urgentes e chamados sem resposta.",
            "Idade do chamado e última atualização visíveis na fila e no detalhe administrativo.",
            "Testes unitários mínimos para validações, filtros, datas relativas e regras puras do fluxo admin.",
            "README, checklist final e textos de portfólio preparados para avaliação técnica.",
          ],
        },
        {
          title: "Funcionalidades implementadas",
          items: [
            "Landing page em português brasileiro com chamadas para abrir e consultar chamados.",
            "Abertura pública de chamados sem cadastro.",
            "Geração automática de código no formato CF-YYYY-00000.",
            "Estado de sucesso com código copiável e atalho para consultar o chamado.",
            "Consulta pública por código do chamado e e-mail.",
            "Login administrativo com Supabase Auth.",
            "Dashboard protegido com estatísticas resumidas.",
            "Listagem responsiva de chamados com busca, filtros por status, urgência e resposta, além de ordenação operacional.",
            "Tela de detalhe do chamado com dados do solicitante e histórico de respostas.",
            "Atualização de status e marcação de urgência.",
            "Respostas públicas do operador visíveis na consulta do solicitante.",
            "Estados de loading, erro, vazio e sucesso.",
            "Rate limit básico para formulários públicos com sujeitos armazenados em hash.",
            "Testes automatizados mínimos com Vitest para regras de validação e filtros.",
          ],
        },
        {
          title: "Decisões técnicas",
          items: [
            "Separação explícita entre área pública e área administrativa no Next.js App Router.",
            "Server Components para composição de páginas e Server Actions para formulários e mutações.",
            "Camada src/lib/data para operações de dados e src/lib/validation para contratos de formulário.",
            "Supabase Auth no painel admin, com usuários administrativos criados manualmente.",
            "Supabase PostgreSQL com tabelas para tickets, respostas e eventos de rate limit.",
            "RLS habilitado em tabelas públicas e uso server-only da service role key em fluxos controlados.",
            "Proteção de rotas /admin por Next.js Proxy e revalidação server-side dentro das ações administrativas.",
            "Validação server-side em formulários públicos e administrativos.",
            "Rate limit básico para reduzir abuso nos fluxos públicos.",
            "Testes unitários mínimos para validações e regras puras, mantendo o escopo de MVP controlado.",
            "Headers de segurança configurados no next.config.ts do projeto ChamadaFácil.",
            "Vercel como alvo principal de deploy documentado.",
          ],
        },
        {
          title: "Limitações conscientes",
          items: [
            "Não há multiempresa ou isolamento por tenant.",
            "Não há anexos.",
            "Não há chat em tempo real.",
            "Não há e-mail transacional.",
            "Não há RBAC completo; o painel admin usa um escopo simples de operadores autenticados.",
            "O objetivo é demonstrar um MVP técnico realista, não uma suíte enterprise de atendimento.",
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
            "Cobertura de testes mais ampla para fluxos críticos de ponta a ponta.",
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
          src: "/projects/chamadafacil/ticket-new-form.png",
          alt: "Formulário de abertura de chamado com campos de informações e detalhes do problema.",
          width: 1920,
          height: 1080,
          caption: "Formulário público para abrir um novo chamado sem necessidade de cadastro.",
        },
        {
          src: "/projects/chamadafacil/ticket-lookup-form.png",
          alt: "Página de consulta de chamado com campos de número do ticket e e-mail.",
          width: 1920,
          height: 1080,
          caption: "Consulta pública por código do chamado e e-mail do solicitante.",
        },
        {
          src: "/projects/chamadafacil/admin-login.png",
          alt: "Tela de login administrativo com formulário de e-mail e senha.",
          width: 1920,
          height: 1080,
          caption: "Acesso restrito ao painel de controle para operadores autenticados.",
        },
        {
          src: "/projects/chamadafacil/admin-dashboard.png",
          alt: "Dashboard administrativo do ChamadaFácil com cards de status, filtros e fila de chamados.",
          width: 1920,
          height: 1127,
          caption: "Painel protegido para buscar, filtrar, ordenar e gerenciar a fila de chamados.",
        },
        {
          src: "/projects/chamadafacil/admin-ticket-detail.png",
          alt: "Detalhe do chamado com dados do solicitante, histórico de respostas e gerenciamento.",
          width: 1920,
          height: 1080,
          caption: "Tela de detalhe com informações completas, respostas e ações de gerenciamento.",
        },
      ],
    },
  },
  {
    slug: "prado-auto-pecas",
    title: "Prado Auto Peças",
    type: "site real para negócio local",
    order: 2,
    description:
      "Site institucional publicado para negócio local de autopeças e serviços relacionados, com foco em apresentação clara, contato rápido, SEO local e manutenção simples.",
    stack: ["HTML", "CSS", "JavaScript", "JSON", "PowerShell"],
    links: {
      site: "https://pradoautopecas.pages.dev/",
      github: "https://github.com/bps2414/pradoautopecas",
    },
    limitations:
      "Site estático; não inclui backend, CMS online, login ou dados públicos de resultado.",
    isMain: true,
    features: [
      "Página institucional responsiva.",
      "CTAs para telefone, WhatsApp e Instagram.",
      "Conteúdo editável em JSON com editor local.",
      "Editor local aberto por script batch.",
      "Upload local de imagens pelo editor.",
      "Backups automáticos a cada salvamento.",
      "Sitemap, robots, canonical, Open Graph e JSON-LD.",
      "Headers de segurança e cache para deploy estático.",
      "Script de verificação técnica.",
    ],
    technicalDecisions: [
      "Site estático primeiro para reduzir custo e manutenção.",
      "Editor local em vez de painel online para evitar login e backend.",
      "JSON como fonte única de conteúdo.",
      "Páginas geradas no salvamento para manter o deploy simples.",
      "PowerShell por ser adequado ao uso local em Windows.",
    ],
    learnings: [
      "Arquitetura simples pode ser a melhor solução para pequenos negócios.",
      "SEO local exige atenção a metadata, sitemap, robots e dados estruturados.",
      "Editor local reduz superfície de ataque em projetos pequenos.",
      "Scripts de validação ajudam a evitar quebra em deploy estático.",
    ],
  },
  {
    slug: "food-templates-bps",
    title: "Templates de Alimentação",
    type: "template comercial / estudo de produto",
    order: 3,
    description:
      "Template multi-tema para negócios de alimentação, com demos para restaurante, pizzaria e hamburgueria. Inclui páginas comerciais, cardápio digital, galeria, contato via WhatsApp e estudo técnico de backend/admin.",
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Prisma",
      "Vercel",
    ],
    links: {
      github: "https://github.com/bps2414/templaterestaurantebps",
    },
    demoLinks: [
      {
        label: "Restaurante",
        href: "https://saborearte-seven.vercel.app/",
      },
      {
        label: "Pizzaria",
        href: "https://fornoemassa.vercel.app/",
      },
      {
        label: "Hamburgueria",
        href: "https://burguerhouse-lilac.vercel.app/",
      },
    ],
    limitations:
      "Projeto criado no início da minha evolução como desenvolvedor e posteriormente higienizado para documentação, demonstração e reaproveitamento de escopo.",
    microcopy:
      "Apresentado como template comercial multi-tema e estudo de produto, não como sistema pronto para operação crítica.",
    isMain: false,
    caseStudy: {
      summary: {
        title:
          "Uma base comercial reaproveitável para negócios de alimentação.",
        body: [
          "Este projeto nasceu como uma tentativa de transformar desenvolvimento web em produto comercial. A proposta era criar uma base reutilizável para pequenos negócios de alimentação, permitindo adaptar identidade visual, cardápio, páginas institucionais e canais de contato.",
          "Com o tempo, o projeto também virou um estudo técnico de backend, autenticação, upload de imagens e deploy. Hoje ele é apresentado como case de evolução, organização de escopo e aprendizado sobre limites entre template, sistema e produto vendável.",
        ],
      },
      sections: [
        {
          title: "Proposta",
          body: [
            "A coleção reúne variações para restaurante, pizzaria e hamburgueria, mantendo a mesma intenção comercial: apresentar o negócio, mostrar produtos, criar confiança visual e facilitar o contato pelo WhatsApp.",
            "O foco do case é demonstrar raciocínio de produto para pequenos negócios, reaproveitamento de escopo e adaptação visual entre segmentos próximos.",
          ],
        },
        {
          title: "Demos publicadas",
          items: [
            "Restaurante: Saborearte, com identidade voltada a refeições e apresentação institucional.",
            "Pizzaria: Forno e Massa, com linguagem visual e cardápio adaptados para pizzaria.",
            "Hamburgueria: Burguer House, com estética mais direta para lanches e combos.",
          ],
        },
        {
          title: "Funcionalidades exploradas",
          items: [
            "Páginas institucionais para apresentação do negócio.",
            "Cardápio digital com categorias e itens comerciais.",
            "Galeria visual para reforçar produto e ambiente.",
            "Contato via WhatsApp como canal principal de conversão.",
            "Variações de identidade visual para segmentos diferentes.",
            "Estudo técnico de backend/admin, autenticação, upload de imagens e persistência de dados.",
          ],
        },
        {
          title: "Decisões técnicas",
          items: [
            "Separação entre proposta visual demonstrável e estudo técnico de administração.",
            "Uso de HTML, CSS e JavaScript para manter as páginas comerciais simples de entender.",
            "Exploração de Node.js, Express, PostgreSQL e Prisma para aprender fluxos de backend.",
            "Deploys separados na Vercel para validar as variações como demos independentes.",
            "Documentação e higienização posterior para apresentar o projeto com escopo mais claro.",
          ],
        },
        {
          title: "Aprendizados",
          items: [
            "Templates comerciais precisam equilibrar aparência, conteúdo e facilidade de adaptação.",
            "Nem toda ideia com painel administrativo deve ser vendida como produto completo.",
            "Demos publicadas ajudam a comunicar variações de nicho com mais clareza.",
            "Organizar limitações e contexto melhora a leitura técnica do projeto.",
            "Pensamento comercial também faz parte do desenvolvimento para negócios locais.",
          ],
        },
      ],
      screenshots: [
        {
          src: "/screenshots/saborearte-desktop.png",
          alt: "Screenshot desktop do template Restaurante Saborearte.",
          width: 1440,
          height: 1000,
          caption: "Restaurante Saborearte em desktop.",
        },
        {
          src: "/screenshots/fornoemassa-desktop.png",
          alt: "Screenshot desktop do template Pizzaria Forno e Massa.",
          width: 1440,
          height: 1000,
          caption: "Pizzaria Forno e Massa em desktop.",
        },
        {
          src: "/screenshots/burguerhouse-desktop.png",
          alt: "Screenshot desktop do template Hamburgueria Burguer House.",
          width: 1440,
          height: 1000,
          caption: "Hamburgueria Burguer House em desktop.",
        },
      ],
    },
  },
  {
    slug: "ptbr-merger",
    title: "PTBRMerger",
    type: "ferramenta local técnica",
    order: 5,
    description:
      "Ferramenta local para analisar arquivos MKV, detectar faixas de áudio PT-BR, criar um plano de processamento e gerar um arquivo final com FFmpeg/FFprobe.",
    stack: ["Python", "FFmpeg", "FFprobe", "Pytest", "HTML", "CSS", "JavaScript"],
    links: {
      github: "https://github.com/bps2414/ptbr-merger",
    },
    microcopy:
      "Não exige demo pública: a ferramenta foi pensada para rodar localmente, com dependência de arquivos e utilitários instalados na máquina do usuário.",
    isMain: false,
    features: [
      "Interface web local em 127.0.0.1.",
      "Criação automática de pastas de trabalho.",
      "Inspeção de streams via FFprobe.",
      "Detecção de áudio PT-BR por metadados e palavras-chave.",
      "Plano seguro antes da execução.",
      "Mux com FFmpeg.",
      "Relatórios e receitas locais.",
      "Preflight operacional.",
      "Fila, histórico e retry por JSON local.",
      "Integrações opcionais com Radarr, qBittorrent, Discord e Bazarr.",
    ],
    technicalDecisions: [
      "Local-first para evitar expor arquivos e credenciais.",
      "Interface web simples em localhost para reduzir atrito.",
      "Separação entre workflow manual e automação externa.",
      "Relatórios e receitas para auditabilidade.",
      "Testes com fixtures sintéticas em vez de arquivos reais de terceiros.",
    ],
    learnings: [
      "Automação local exige preflight e mensagens operacionais claras.",
      "Testes de fixtures ajudam a validar regras sem depender de dados reais.",
      "Ferramentas técnicas precisam documentar limites e dependências.",
      "Uma UI local pode tornar um fluxo de terminal mais avaliável.",
    ],
  },
  {
    slug: "barbearia-da-vila",
    title: "Barbearia da Vila",
    type: "landing page comercial demonstrável",
    order: 4,
    description:
      "Landing page responsiva para barbearia, com apresentação visual, serviços, galeria, equipe, FAQ, mapa, páginas legais, SEO básico e chamada para contato comercial.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Lucide React"],
    links: {
      demo: "https://barbeariadavila.vercel.app/",
      github: "https://github.com/bps2414/landingparabarbearia",
    },
    limitations:
      "Projeto demonstrável; textos, dados comerciais e canais de contato devem ser revisados antes de uso por um negócio real.",
    isMain: false,
    screenshots: [
      {
        src: "/screenshots/barbeariadavila-desktop.png",
        alt: "Screenshot desktop da landing page Barbearia da Vila.",
        width: 1440,
        height: 1000,
        caption: "Landing page da Barbearia da Vila em desktop.",
      },
    ],
    features: [
      "Hero com imagem e CTA.",
      "Menu fixo com navegação por seções.",
      "Lista de serviços e preços.",
      "Galeria em WebP otimizada.",
      "Seções de sobre, equipe, primeira visita, depoimento e FAQ.",
      "Mapa incorporado com localização.",
      "Páginas de privacidade e termos.",
      "SEO básico, Open Graph, sitemap e robots.",
      "Vercel Analytics e Speed Insights.",
    ],
    technicalDecisions: [
      "Next.js App Router para rotas, metadata, sitemap e robots.",
      "Componentes por seção para facilitar manutenção.",
      "WhatsApp como canal principal em vez de backend de agendamento.",
      "Imagens WebP locais para carregamento mais eficiente.",
      "Páginas legais simples e proporcionais ao escopo.",
    ],
    learnings: [
      "Landing pages comerciais exigem hierarquia visual, CTA claro e conteúdo objetivo.",
      "SEO básico em Next.js pode ser incorporado cedo.",
      "Dados de negócio precisam ser validados antes de uso real.",
      "Um projeto visual também precisa de documentação técnica honesta.",
    ],
  },
  {
    slug: "bps-fishing-macro",
    title: "BPS Fishing Macro",
    type: "primeiro projeto técnico",
    order: 6,
    description:
      "Ferramenta desktop local para Windows que automatiza um fluxo de pesca em jogo, com interface própria, controle de mouse e teclado, OCR, detecção por cor, configurações persistentes, logs e empacotamento em executável.",
    stack: [
      "Python",
      "Tkinter",
      "PyInstaller",
      "Tesseract OCR",
      "Pillow",
      "Pytest",
      "Windows automation",
    ],
    links: {
      github: "https://github.com/bps2414/bps-fishing-macro",
    },
    limitations:
      "Foi meu primeiro projeto de todos, então o código carrega decisões bagunçadas, versões antigas, experimentos e marcas de aprendizado. Não tem demo pública por depender de Windows, captura de tela, entrada de mouse/teclado e do jogo alvo.",
    microcopy:
      "Mantido no portfólio como registro do começo: mais importante pelo caminho de aprendizado, empacotamento e automação local do que por arquitetura limpa.",
    isMain: false,
    features: [
      "Interface desktop local para configurar e controlar a automação.",
      "Automação de ciclo de pesca com mouse, teclado e janelas do Windows.",
      "OCR para leitura de informações visuais do jogo.",
      "Detecção por cor para interpretar estados na tela.",
      "Configurações persistentes em arquivo local.",
      "Logs e estatísticas locais.",
      "Webhooks opcionais para notificações.",
      "Build em executável Windows com PyInstaller.",
      "Testes automatizados em módulos isolados nas versões mais recentes.",
    ],
    technicalDecisions: [
      "Python foi escolhido por permitir prototipagem rápida de automação desktop.",
      "Execução local para acessar captura de tela, mouse, teclado e arquivos sem backend.",
      "OCR e detecção por cor foram usados porque o fluxo depende de sinais visuais do jogo.",
      "Empacotamento com PyInstaller para facilitar teste por executável sem exigir ambiente Python do usuário.",
      "Evolução por versões sucessivas, deixando histórico de tentativa, erro e reorganização do código.",
    ],
    learnings: [
      "Primeiro contato real com um projeto maior do que scripts pequenos.",
      "Aprendi na prática o custo de deixar código crescer sem arquitetura clara desde o começo.",
      "Entendi melhor logs, configuração local, empacotamento e dependências nativas no Windows.",
      "Aprendi a transformar uma automação improvisada em uma ferramenta com interface e distribuição.",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
