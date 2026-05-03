import { z } from "zod";

const envSchema = z.object({
  DISCORD_BUDGET_WEBHOOK_URL: z
    .string()
    .trim()
    .url()
    .refine(
      (value) =>
        value.startsWith("https://discord.com/api/webhooks/") ||
        value.startsWith("https://discordapp.com/api/webhooks/"),
      "DISCORD_BUDGET_WEBHOOK_URL deve ser uma URL de webhook do Discord.",
    ),
  NEXT_PUBLIC_SITE_URL: z.string().trim().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Env check falhou:");
  for (const issue of parsed.error.issues) {
    console.error(`- ${issue.path.join(".") || "env"}: ${issue.message}`);
  }
  process.exit(1);
}

console.log("Env check OK.");
