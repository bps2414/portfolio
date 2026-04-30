# Estudos de Caso

## ChamadaFácil

### Título

ChamadaFácil: sistema de chamados para pequenos negócios

### Resumo

O ChamadaFácil é um MVP full-stack para abertura, consulta e gerenciamento de chamados. Usuários públicos podem registrar solicitações e acompanhar o andamento por código/e-mail; operadores autenticados gerenciam a fila em um painel administrativo.

### Contexto

O projeto foi criado como peça técnica de portfólio para demonstrar fundamentos de desenvolvimento web em um cenário realista de suporte.

### Problema

Solicitações de suporte podem se perder em conversas, mensagens e planilhas. O desafio era criar um fluxo simples sem transformar o MVP em uma plataforma complexa.

### Solução

Um sistema single-company com rotas públicas para abrir e consultar chamados, mais área administrativa protegida para visualizar, filtrar, responder e atualizar status.

### Funcionalidades

- Landing page em PT-BR.
- Abertura pública de chamados sem cadastro.
- Geração de código de chamado.
- Consulta por código e e-mail.
- Login administrativo com Supabase Auth.
- Dashboard protegido.
- Filtros por status e urgência.
- Detalhe do chamado.
- Atualização de status e urgência.
- Respostas públicas do operador.
- Estados de loading, erro, vazio e sucesso.

### Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL, Row Level Security, Server Actions e Vercel.

### Decisões técnicas

- Usar App Router para separar rotas públicas e administrativas.
- Usar Server Actions para formulários e mutations.
- Manter solicitantes sem conta para reduzir atrito.
- Usar Supabase Auth apenas para operadores.
- Aplicar RLS e checagens server-side para proteger dados.
- Manter o produto single-company para evitar complexidade multiempresa antes da hora.

### Desafios

- Equilibrar fluxo público sem conta com privacidade mínima dos chamados.
- Evitar listagem pública de tickets.
- Documentar limites sem enfraquecer a apresentação do projeto.
- Usar service role apenas em pontos server-side controlados.

### Aprendizados

- Modelagem de fluxo de suporte.
- Integração entre Next.js, Supabase Auth e PostgreSQL.
- Escrita de policies RLS proporcionais ao escopo.
- Validação server-side e tratamento de estados de formulário.
- Comunicação técnica honesta para portfólio.

### Próximos passos

- Adicionar RBAC.
- Criar testes automatizados para fluxos críticos.
- Adicionar notificações por e-mail.
- Adicionar anexos e notas internas.
- Melhorar auditoria e histórico.

### Links

- Demo: https://chamadafacil.vercel.app/
- GitHub: https://github.com/bps2414/chamadafacil

## Prado Auto Peças

### Título

Prado Auto Peças: site institucional estático para negócio local

### Resumo

Site institucional para a Prado Auto Peças, com foco em presença local, contato rápido, SEO local e manutenção simples por editor local.

### Contexto

O projeto atende um cenário comum de pequeno negócio: precisar de presença online confiável sem depender de backend, banco, CMS ou painel administrativo hospedado.

### Problema

Um negócio local precisa publicar informações essenciais, contatos, área de atendimento e conteúdo de SEO sem criar uma operação técnica complexa.

### Solução

Um site estático em HTML/CSS/JS, com conteúdo centralizado em JSON e editor local em PowerShell. Ao salvar, scripts geram `index.html`, `404.html`, `js/config.js` e backups.

### Funcionalidades

- Página institucional responsiva.
- CTAs para telefone, WhatsApp e Instagram.
- Conteúdo editável em `data/site-content.json`.
- Editor local aberto por `editar-site.bat`.
- Upload local de imagens pelo editor.
- Backups automáticos.
- Sitemap, robots, canonical, Open Graph e JSON-LD.
- Headers de segurança e cache para deploy estático.
- Script de verificação técnica.

### Stack

HTML5, CSS3, JavaScript sem framework, JSON e PowerShell.

### Decisões técnicas

- Site estático primeiro para reduzir custo e manutenção.
- Editor local em vez de painel online para evitar login e backend.
- JSON como fonte única de conteúdo.
- Páginas geradas no salvamento para manter o deploy simples.
- PowerShell por ser adequado ao uso local em Windows.

### Desafios

- Criar uma solução útil sem exagerar a arquitetura.
- Manter conteúdo editável sem expor área administrativa pública.
- Cuidar de SEO local em um projeto estático.
- Separar site publicado, editor local e scripts de validação.

### Aprendizados

- Arquitetura simples pode ser a melhor solução para pequenos negócios.
- SEO local exige atenção a metadata, sitemap, robots e dados estruturados.
- Editor local reduz superfície de ataque em projetos pequenos.
- Scripts de validação ajudam a evitar quebra em deploy estático.

### Próximos passos

- Confirmar domínio definitivo.
- Revisar textos finais com o dono do negócio.
- Atualizar imagens reais quando disponíveis.
- Definir licença do repositório.
- Criar restauração de backups pelo editor.

### Links

- Site: https://pradoautopecas.pages.dev/
- GitHub: https://github.com/bps2414/pradoautopecas

## PTBRMerger

### Título

PTBRMerger: ferramenta local para workflow de mídia

### Resumo

PTBRMerger é uma ferramenta local para analisar arquivos MKV, detectar áudio PT-BR, criar um plano seguro e gerar um arquivo final com FFmpeg/FFprobe. O produto não tem demo pública porque foi desenhado para rodar na máquina do usuário.

### Contexto

O projeto nasceu para resolver um fluxo técnico específico de biblioteca local de mídia, preservando controle local sobre arquivos e credenciais.

### Problema

Um arquivo pode ter melhor qualidade de vídeo, enquanto outro contém o áudio PT-BR desejado. Fazer a análise e o mux manualmente pode ser repetitivo, sujeito a erro e difícil de auditar.

### Solução

Uma aplicação local em Python com interface web em `127.0.0.1`, inspeção via FFprobe, geração de plano seguro, execução com FFmpeg, relatórios, receitas e integrações opcionais.

### Funcionalidades

- Interface web local.
- Criação automática de pastas de trabalho.
- Inspeção de streams.
- Detecção de áudio PT-BR por metadados e palavras-chave.
- Plano seguro antes da execução.
- Mux com FFmpeg.
- Relatórios e receitas locais.
- Preflight operacional.
- Fila, histórico e retry por JSON local.
- Integrações opcionais com Radarr, qBittorrent, Discord e Bazarr.

### Stack

Python 3.11+, FFmpeg, FFprobe, Pytest, requests, PyYAML, loguru, numpy, HTML, CSS e JavaScript sem framework.

### Decisões técnicas

- Local-first para evitar expor arquivos e credenciais.
- Interface web simples em localhost para reduzir atrito.
- Separação entre workflow manual e automação externa.
- Relatórios e receitas para auditabilidade.
- Testes com fixtures sintéticas em vez de arquivos reais de terceiros.

### Desafios

- Lidar com ambiente local e dependências externas.
- Evitar operações destrutivas em arquivos originais.
- Explicar o projeto para avaliadores sem depender de demo pública.
- Manter integrações opcionais sem bloquear o fluxo manual.

### Aprendizados

- Automação local exige preflight e mensagens operacionais claras.
- Testes de fixtures ajudam a validar regras sem depender de dados reais.
- Ferramentas técnicas precisam documentar limites e dependências.
- Uma UI local pode tornar um fluxo de terminal mais avaliável.

### Próximos passos

- Adicionar CI para testes e compileall.
- Melhorar mensagens para usuários não técnicos.
- Versionar screenshots da interface local.
- Simplificar setup do FFmpeg.
- Separar responsabilidades internas do orquestrador principal.

### Links

- GitHub: https://github.com/bps2414/ptbr-merger

## Barbearia da Vila

### Título

Barbearia da Vila: landing page comercial para pequeno negócio

### Resumo

Landing page demonstrável para barbearia local, com foco em apresentação visual, serviços, galeria, mapa, FAQ, páginas legais, SEO básico e contato direto por WhatsApp.

### Contexto

O projeto representa um tipo comum de freela inicial: criar presença digital simples e publicável para pequeno negócio.

### Problema

Uma barbearia precisa apresentar serviços, localização, horários e contato sem investir em backend, agendamento próprio ou painel administrativo.

### Solução

Uma landing page em Next.js organizada por seções, com imagens locais otimizadas, metadados, sitemap, robots e CTA para WhatsApp.

### Funcionalidades

- Hero com imagem e CTA.
- Menu fixo com navegação por seções.
- Lista de serviços e preços.
- Galeria em WebP.
- Seções de sobre, equipe, primeira visita, depoimento e FAQ.
- Mapa incorporado.
- Páginas de privacidade e termos.
- SEO básico, Open Graph, sitemap e robots.
- Vercel Analytics e Speed Insights.

### Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React, Vercel Analytics, Speed Insights e Sharp.

### Decisões técnicas

- Next.js App Router para rotas, metadata, sitemap e robots.
- Componentes por seção para facilitar manutenção.
- WhatsApp como canal principal em vez de backend de agendamento.
- Imagens WebP locais para carregamento mais eficiente.
- Páginas legais simples e proporcionais ao escopo.

### Desafios

- Criar aparência comercial sem prometer que os dados são reais.
- Manter a página simples sem parecer template genérico.
- Tratar o projeto como demonstrável, não como prova de cliente real.
- Corrigir a comunicação entre deploy correto e metadata do GitHub.

### Aprendizados

- Landing pages comerciais exigem hierarquia visual, CTA claro e conteúdo objetivo.
- SEO básico em Next.js pode ser incorporado cedo.
- Dados de negócio precisam ser validados antes de uso real.
- Um projeto visual também precisa de documentação técnica honesta.

### Próximos passos

- Revisar telefone, endereço, horários e redes sociais com dados reais antes de uso comercial.
- Corrigir `homepageUrl` do GitHub.
- Criar testes básicos de renderização.
- Rodar auditoria Lighthouse no deploy.
- Centralizar conteúdo repetido em arquivo de configuração.

### Links

- Demo: https://barbeariadavila.vercel.app/
- GitHub: https://github.com/bps2414/landingparabarbearia
