# Auditoria de segurança do portfólio

Data: 2026-05-02  
Escopo: aplicação Next.js 16 em `src/`, rotas App Router, formulário de orçamento, webhook Discord, variáveis de ambiente, SEO, headers, dependências e arquivos versionados.

## Resumo executivo

O projeto já tinha boas proteções iniciais: webhook Discord somente no backend, CSP configurada, `robots.txt` bloqueando `/api/`, honeypot, rate limit básico em memória, limite por `Content-Length`, sanitização parcial para Discord e `npm audit` sem vulnerabilidades conhecidas.

O principal risco real encontrado é o backend aceitar `selectedPackage.title` e `selectedPackage.priceLabel` vindos do frontend. Isso permite que um usuário manipule pacote/preço antes do envio ao Discord. Também havia lacunas em validação formal de env, documentação de deploy seguro, neutralização de links no Discord e teste automatizado das proteções.

## Achados críticos

Nenhum achado crítico confirmado.

## Achados médios

### M1. Pacote e preço confiados ao payload do frontend

- Arquivos afetados: `src/components/budget-request-modal.tsx`, `src/lib/budget-request.ts`, `src/app/api/budget-request/route.ts`
- Risco real: um usuário pode editar o JSON enviado ao endpoint e trocar `selectedPackage.title` ou `selectedPackage.priceLabel`. O Discord receberia uma mensagem aparentemente legítima com pacote/preço manipulado.
- Como corrigir: manter pacote/preço como dado meramente sugestivo no frontend e recalcular/canonizar no backend a partir de `kind`.
- Prioridade: alta.
- Status: corrigido nesta rodada.

### M2. Validação de ambiente insuficiente para deploy seguro

- Arquivos afetados: `.env.example`, `README.md`, `package.json`, scripts de validação ausentes
- Risco real: deploy pode subir sem `DISCORD_BUDGET_WEBHOOK_URL` ou com URL inválida, deixando o formulário quebrado em produção. Se alguém usar `NEXT_PUBLIC_` para segredo por engano, o valor pode ir para o bundle.
- Como corrigir: criar validação server-only para webhook, script `env:check`, exemplo claro sem segredo real e documentação curta para Vercel/hosting.
- Prioridade: alta.
- Status: corrigido nesta rodada.

### M3. Erro de validação retornava detalhes além do necessário

- Arquivo afetado: `src/app/api/budget-request/route.ts`
- Risco real: a UI ignorava `errors`, mas a resposta JSON expunha detalhes internos da validação. Não é vazamento crítico, mas aumenta superfície de enumeração para bots.
- Como corrigir: responder com mensagem genérica para usuário e manter detalhes apenas em testes/logs internos quando necessário.
- Prioridade: média.
- Status: corrigido nesta rodada.

## Achados baixos

### B1. Links enviados para Discord podiam ficar clicáveis

- Arquivo afetado: `src/lib/budget-request.ts`
- Risco real: campos livres como referências e observações poderiam gerar links clicáveis no Discord, aumentando risco de clique acidental em URL maliciosa.
- Como corrigir: neutralizar `http://` e `https://` antes de aplicar escape de markdown.
- Prioridade: média-baixa.
- Status: corrigido nesta rodada.

### B2. `.gitignore` ignorava `.env.example` por padrão amplo

- Arquivo afetado: `.gitignore`
- Risco real: `.env.example` já estava versionado, mas a regra `.env*` dificulta manter exemplos de env em clones/novos arquivos.
- Como corrigir: manter `.env*` ignorado e adicionar exceção explícita para `.env.example`.
- Prioridade: baixa.
- Status: corrigido nesta rodada.

### B3. Aviso de privacidade do formulário era mínimo

- Arquivo afetado: `src/components/budget-request-modal.tsx`
- Risco real: o formulário coleta nome, WhatsApp e briefing comercial sem explicar de forma clara o uso dos dados.
- Como corrigir: reforçar no consentimento que os dados serão usados para contato/orçamento e não devem incluir dados sensíveis.
- Prioridade: baixa.
- Status: corrigido nesta rodada.

### B4. Testes de segurança do formulário não cobriam casos abusivos

- Arquivos afetados: `package.json`, testes ausentes
- Risco real: regressões em limite de payload, método errado, neutralização de menções ou manipulação de pacote poderiam passar despercebidas.
- Como corrigir: adicionar testes mínimos para payload inválido, payload gigante, método errado, fluxo válido, `@everyone` e pacote/preço manipulado.
- Prioridade: média.
- Status: corrigido nesta rodada.

## Verificações sem achados acionáveis

- Secrets hardcoded: nenhum webhook real, token privado, Mercado Pago token, Supabase service role ou API key privada confirmada no código atual.
- Histórico Git: busca simples por padrões de segredo não encontrou webhook real; apareceu apenas `.env.example` e documentação com valor fake.
- XSS: `dangerouslySetInnerHTML` aparece apenas para JSON-LD montado de dados estáticos locais. Não há markdown/HTML dinâmico vindo de usuário.
- Links externos: usos encontrados de `target="_blank"` têm `rel="noopener noreferrer"`.
- SEO: sitemap lista somente `/` e projetos públicos; `robots.txt` bloqueia `/api/`.
- Dependências: `npm audit --json` retornou 0 vulnerabilidades conhecidas no estado auditado.

## Limitações da auditoria

- Rate limit em memória é proteção básica e pode ser reiniciado por instâncias serverless. Para alto volume real, usar KV/Upstash/Vercel KV.
- Não houve acesso ao painel da Vercel. A auditoria cobre o que está refletido no código e documentação.
- A busca de histórico usa padrões comuns e não substitui ferramenta dedicada como GitHub secret scanning ou `gitleaks`.
