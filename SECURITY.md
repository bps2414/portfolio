# Segurança e configuração de secrets

Este portfólio usa um endpoint server-only para receber pedidos de orçamento e encaminhar o lead para um webhook privado do n8n.

## Variáveis obrigatórias

```txt
N8N_WEBHOOK_URL=https://n8n.exemplo.com/webhook/REPLACE_WITH_ID
NEXT_PUBLIC_SITE_URL=https://bps2414.vercel.app
```

- `N8N_WEBHOOK_URL` é privado. Nunca use prefixo `NEXT_PUBLIC_` nele.
- `NEXT_PUBLIC_SITE_URL` é público e serve para canonical, sitemap e validação de origem.
- Não coloque valores reais em `.env.example`, README, issues, screenshots ou código.

## Vercel

1. Abra o projeto na Vercel.
2. Acesse `Settings` -> `Environment Variables`.
3. Adicione `N8N_WEBHOOK_URL` para Production e Preview se quiser testar preview.
4. Adicione `NEXT_PUBLIC_SITE_URL` com a URL pública final.
5. Redeploy.

O script `npm run env:check` valida o formato do webhook antes do build. Um build sem webhook válido deve falhar para evitar deploy com formulário quebrado.

## Controles implementados

- Webhook chamado apenas por `/api/budget-request`.
- Payload JSON obrigatório e limite de 16 KB.
- Rate limit básico por IP em memória.
- Honeypot invisível (campo `website`) que, quando preenchido, retorna 200 sem encaminhar o payload.
- Timeout de 8s em `fetch` para o webhook do n8n (`AbortSignal.timeout`).
- Validação server-side com Zod e normalização de campos.
- Pacote/preço canônico no servidor, ignorando preço manipulado pelo frontend.
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
