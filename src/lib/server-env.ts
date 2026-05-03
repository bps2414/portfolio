import { z } from "zod";

const discordWebhookUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) =>
      value.startsWith("https://discord.com/api/webhooks/") ||
      value.startsWith("https://discordapp.com/api/webhooks/"),
    "DISCORD_BUDGET_WEBHOOK_URL deve ser uma URL de webhook do Discord.",
  );

export const serverEnvSchema = z.object({
  DISCORD_BUDGET_WEBHOOK_URL: discordWebhookUrlSchema,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function readServerEnv(
  env: NodeJS.ProcessEnv = process.env,
):
  | { ok: true; data: ServerEnv }
  | { ok: false; issues: string[] } {
  const parsed = serverEnvSchema.safeParse(env);

  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  return {
    ok: false,
    issues: parsed.error.issues.map((issue) => issue.message),
  };
}
