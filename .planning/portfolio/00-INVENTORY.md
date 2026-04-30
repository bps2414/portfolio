# Inventário do Portfólio

Data do inventário: 2026-04-30

Fontes consultadas: repositórios locais em `F:\Projetinhos\ChamadaFacil`, `F:\VSCode\Guincho`, `F:\VSCode\BarberShop`; repositórios públicos `bps2414/chamadafacil`, `bps2414/pradoautopecas`, `bps2414/ptbr-merger` e `bps2414/landingparabarbearia`; READMEs, docs, configs, metadados de SEO e links públicos.

## 1. ChamadaFácil

### Nome

ChamadaFácil

### Tipo

Projeto principal técnico. MVP full-stack de help desk/sistema de chamados para pequenos negócios.

### Descrição curta

Sistema web de chamados com abertura pública, consulta por código e e-mail, painel administrativo autenticado, filtros, status, urgência e respostas do operador.

### Problema que resolve

Pequenos negócios podem perder solicitações de suporte em conversas, planilhas e canais espalhados. O ChamadaFácil organiza o fluxo básico: registrar um chamado, acompanhar o status e permitir que um operador responda por um painel protegido.

### Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Row Level Security
- Server Actions
- Vercel como alvo de deploy

### Status atual

MVP funcional de portfólio. O deploy público respondeu `200` em `https://chamadafacil.vercel.app/`. O README descreve o projeto como demonstrável e documenta o escopo com limitações claras.

### Links públicos

- Demo: https://chamadafacil.vercel.app/
- GitHub: https://github.com/bps2414/chamadafacil

### Pontos fortes para recrutador

- Demonstra fluxo full-stack completo, não apenas interface estática.
- Mostra modelagem de tickets, respostas e eventos de rate limit.
- Usa autenticação administrativa real com Supabase Auth.
- Inclui RLS, validação server-side, Server Actions e cuidado com service role server-only.
- Tem separação clara entre área pública e área administrativa.
- Documentação do projeto, estudo de caso, deploy, segurança e textos de portfólio já existem.

### Riscos/inconsistências

- O repositório local estava com mudanças não commitadas no momento do inventário.
- O checklist final do projeto ainda marca alguns itens como não conferidos, incluindo testes de fluxo e deploy, embora o link público esteja online.
- Não há script de testes automatizados no `package.json`.
- O MVP não tem RBAC; qualquer usuário autenticado no Supabase é tratado como operador/admin dentro do escopo single-company.
- Não há multiempresa, anexos, e-mail automático, SLA ou base de conhecimento.

### O que NÃO devemos prometer

- Não prometer SaaS pronto para produção multiempresa.
- Não prometer métricas de uso, redução de tempo, clientes atendidos ou resultados financeiros.
- Não prometer RBAC, notificações, anexos, SLA ou base de conhecimento.
- Não apresentar o projeto como experiência profissional formal.
- Não publicar credenciais, seeds locais ou dados fictícios como se fossem reais.

## 2. Prado Auto Peças

### Nome

Prado Auto Peças

### Tipo

Projeto principal por ser site real/cliente local. Site institucional estático para negócio local de guincho e auto peças.

### Descrição curta

Site institucional responsivo para Prado Auto Peças, com foco em presença local, contato rápido por telefone/WhatsApp, SEO local e editor de conteúdo local sem backend.

### Problema que resolve

Um negócio local precisa de presença online simples, rápida de publicar e fácil de manter, sem painel hospedado, banco de dados ou dependências complexas. O projeto entrega uma página estática com conteúdo editável por JSON e editor local.

### Stack

- HTML5
- CSS3
- JavaScript sem framework
- JSON como fonte de conteúdo
- PowerShell para editor local, geração de páginas, backup e validação
- Deploy estático compatível com Cloudflare Pages, Vercel e Netlify

### Status atual

Site estático funcional. O deploy público respondeu `200` em `https://pradoautopecas.pages.dev/`. O repositório local estava limpo e sincronizado com `origin/master`.

### Links públicos

- Site: https://pradoautopecas.pages.dev/
- GitHub: https://github.com/bps2414/pradoautopecas

### Pontos fortes para recrutador

- Demonstra entrega pragmática para negócio local real.
- Mostra decisão técnica adequada ao contexto: estático, sem backend e com baixa manutenção.
- Inclui editor local para conteúdo, backups automáticos e geração de páginas.
- Trabalha SEO local com metadata, canonical, Open Graph, sitemap, robots e JSON-LD.
- Inclui headers de segurança/cache e scripts de verificação.
- Mostra maturidade ao evitar painel online desnecessário.

### Riscos/inconsistências

- O README aponta produção em Cloudflare Pages, mas o repositório também contém configurações para Vercel e Netlify.
- O campo `homepageUrl` do GitHub está vazio.
- A linguagem principal exibida pelo GitHub é PowerShell, por causa dos scripts, embora o site público seja HTML/CSS/JS.
- O roadmap ainda pede validação de textos finais, domínio definitivo, imagens reais e licença.
- A copy do site contém afirmações operacionais do negócio; no portfólio, isso deve ser apresentado como conteúdo do site, não como métrica ou prova criada pelo desenvolvedor.

### O que NÃO devemos prometer

- Não prometer tráfego, conversão, receita ou crescimento do negócio.
- Não prometer que o portfólio participou de detalhes comerciais internos do cliente.
- Não prometer painel online, CMS, login ou publicação automática pelo cliente final.
- Não transformar afirmações comerciais do site em conquistas técnicas pessoais.
- Não apresentar domínio definitivo se ainda estiver em Pages.

## 3. PTBRMerger

### Nome

PTBRMerger

### Tipo

Projeto técnico secundário. Ferramenta local, Windows-first, para workflow de mídia local.

### Descrição curta

Ferramenta local para inspecionar arquivos MKV, detectar áudio PT-BR, criar plano seguro e gerar um MKV final com apoio de FFmpeg/FFprobe, mantendo relatórios e receitas locais.

### Problema que resolve

Em bibliotecas locais de mídia, pode existir um arquivo em melhor qualidade sem áudio PT-BR e outro arquivo compatível com o áudio desejado. O PTBRMerger ajuda a analisar, planejar, muxar e validar o resultado localmente, sem serviço em nuvem.

### Stack

- Python 3.11+
- FFmpeg e FFprobe
- Pytest
- requests
- PyYAML
- loguru
- numpy
- HTML/CSS/JavaScript sem framework para interface local
- Integrações opcionais com Radarr, qBittorrent, Discord Webhook e Bazarr

### Status atual

Projeto funcional em evolução. Não há deploy público por decisão de produto: a aplicação foi feita para rodar localmente em `127.0.0.1` e operar arquivos da máquina do usuário. O repositório público existe em GitHub.

### Links públicos

- GitHub: https://github.com/bps2414/ptbr-merger

### Pontos fortes para recrutador

- Mostra automação local e integração com ferramentas externas.
- Demonstra leitura de streams, validação de mídia e uso operacional de FFmpeg/FFprobe.
- Tem interface web local sem build frontend pesado.
- Inclui suíte de testes automatizados para regras de negócio, integração simulada, snapshots e fixtures sintéticas.
- Documenta preflight, status, higiene de runtime, filas, histórico e retry.
- Expõe capacidade de trabalhar além de CRUD web comum.

### Riscos/inconsistências

- Não há clone local encontrado no workspace; a leitura foi feita pelo repositório remoto público.
- Não há demo pública, e isso é correto para o produto, mas precisa ser explicado no portfólio.
- O repositório ainda não declara licença.
- O domínio do projeto é técnico e sensível a ambiente local; não deve depender de demonstração ao vivo.
- O changelog registra verificações passadas, mas elas não foram reexecutadas neste inventário.

### O que NÃO devemos prometer

- Não prometer SaaS, app público ou demo hospedada.
- Não prometer suporte a todo arquivo MKV possível.
- Não prometer download de conteúdo ou automação independente de ferramentas locais do usuário.
- Não fazer qualquer claim de uso comercial, audiência ou escala.
- Não prometer instalador final ou experiência polida para usuário não técnico.

## 4. Barbearia da Vila / landingparabarbearia

### Nome

Barbearia da Vila

### Tipo

Projeto secundário. Landing page comercial demonstrável para pequeno negócio local.

### Descrição curta

Landing page responsiva para barbearia, com hero visual, serviços, galeria, equipe, FAQ, mapa, páginas legais, SEO básico e conversão direta para WhatsApp.

### Problema que resolve

Pequenos negócios locais precisam de uma página clara e publicável para apresentar serviços, localização e contato sem criar backend, agenda ou painel administrativo.

### Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Vercel Analytics
- Vercel Speed Insights
- Sharp para conversão local de imagens

### Status atual

Versão demonstrável para portfólio. O deploy `https://barbeariadavila.vercel.app/` respondeu `200`. O repositório público permitido é `bps2414/landingparabarbearia`.

### Links públicos

- Demo indicada no README: https://barbeariadavila.vercel.app/
- GitHub: https://github.com/bps2414/landingparabarbearia

### Pontos fortes para recrutador

- Demonstra domínio de landing page comercial com visual, conteúdo e CTA.
- Usa Next.js App Router, metadados, sitemap e robots.
- Inclui imagens WebP locais, páginas legais e organização por componentes.
- Mostra bom senso de escopo: WhatsApp em vez de backend de agenda.
- Serve como exemplo de frontend publicável para pequeno negócio.

### Riscos/inconsistências

- O repositório local `F:\VSCode\BarberShop` aponta para o remoto antigo `UrbanHeritage`, enquanto o repositório público permitido é `landingparabarbearia`.
- O `homepageUrl` do GitHub aponta para `https://urbanheritage-three.vercel.app`, que retornou `404`.
- O README indica `https://barbeariadavila.vercel.app/`, que está online.
- O README e roadmap indicam necessidade de revisar telefone, endereço, horários e redes sociais com dados reais.
- Não deve ser apresentado como cliente real sem validação; é melhor tratá-lo como landing page comercial demonstrável.

### O que NÃO devemos prometer

- Não prometer cliente real, tráfego, agendamentos, conversões ou métricas de performance.
- Não prometer backend de agendamento, cobrança online ou painel.
- Não prometer que dados de telefone, endereço, equipe e preços são reais.
- Não usar o link 404 como demo.
- Não confundir o nome do repositório com o nome público do projeto.
