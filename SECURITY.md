# Segurança e configuração de secrets

Este portfólio usa um endpoint server-only para receber pedidos de orçamento e encaminhar uma mensagem para um webhook privado do Discord.

## Variáveis obrigatórias

```txt
DISCORD_BUDGET_WEBHOOK_URL=https://discord.com/api/webhooks/REPLACE_WITH_ID/REPLACE_WITH_TOKEN
NEXT_PUBLIC_SITE_URL=https://bps2414.vercel.app
```

- `DISCORD_BUDGET_WEBHOOK_URL` é privado. Nunca use prefixo `NEXT_PUBLIC_` nele.
- `NEXT_PUBLIC_SITE_URL` é público e serve para canonical, sitemap e validação de origem.
- Não coloque valores reais em `.env.example`, README, issues, screenshots ou código.

## Vercel

1. Abra o projeto na Vercel.
2. Acesse `Settings` -> `Environment Variables`.
3. Adicione `DISCORD_BUDGET_WEBHOOK_URL` para Production e Preview se quiser testar preview.
4. Adicione `NEXT_PUBLIC_SITE_URL` com a URL pública final.
5. Redeploy.

O script `npm run env:check` valida o formato do webhook antes do build. Um build sem webhook válido deve falhar para evitar deploy com formulário quebrado.

## Controles implementados

- Webhook chamado apenas por `/api/budget-request`.
- Payload JSON obrigatório e limite de 16 KB.
- Rate limit básico por IP em memória.
- Honeypot invisível para bots.
- Validação server-side com Zod e normalização de campos.
- Pacote/preço canônico no servidor, ignorando preço manipulado pelo frontend.
- Neutralização de markdown, menções e links clicáveis no Discord.
- `allowed_mentions: { parse: [] }` no payload do Discord.
- Headers de segurança via `next.config.ts`.
- `/api/` bloqueado no `robots.txt`.

## Operação

- Para tráfego alto ou campanha pública, trocar o rate limit em memória por KV/Upstash/Vercel KV.
- Ativar secret scanning no GitHub.
- Rodar antes de publicar:

```bash
npm run env:check
npm run test
npm run lint
npm run build
npm audit
```
