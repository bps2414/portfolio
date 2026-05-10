import { z } from "zod";

// n8n hospedado/self-hosted não tem prefixo fixo; apenas exigimos https.
const n8nWebhookUrlSchema = z
  .string()
  .trim()
  .min(1, "N8N_WEBHOOK_URL obrigatória.")
  .url("N8N_WEBHOOK_URL deve ser uma URL válida.")
  .refine(
    (value) => value.startsWith("https://"),
    "N8N_WEBHOOK_URL deve usar https.",
  );

export const serverEnvSchema = z.object({
  N8N_WEBHOOK_URL: n8nWebhookUrlSchema,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function readServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): { ok: true; data: ServerEnv } | { ok: false; issues: string[] } {
  const parsed = serverEnvSchema.safeParse(env);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => issue.message),
  };
}
