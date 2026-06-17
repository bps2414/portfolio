# Segurança e configuração de secrets

Este portfólio é um site estático e sem banco de dados (zero-retention), focado em performance e design.

## Variáveis obrigatórias

```txt
NEXT_PUBLIC_SITE_URL=https://bps2414.vercel.app
```

- `NEXT_PUBLIC_SITE_URL` é público e serve para canonical, sitemap e validação de origem.
- Não coloque valores reais em `.env.example`, README, issues, screenshots ou código.

## Vercel

1. Abra o projeto na Vercel.
2. Acesse `Settings` -> `Environment Variables`.
3. Adicione `NEXT_PUBLIC_SITE_URL` com a URL pública final.
4. Redeploy.

## Controles implementados

- Headers de segurança via `next.config.ts`.
- `/api/` bloqueado no `robots.txt` (por precaução de rotas futuras).

## Operação

- Ativar secret scanning no GitHub.
- Rodar antes de publicar:

```bash
npm run env:check
npm run lint
npm run build
npm audit
```
