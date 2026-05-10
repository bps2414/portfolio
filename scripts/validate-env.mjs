import { z } from "zod";

// Schema para validação das variáveis de ambiente necessárias em build/prebuild.
// Executado por `npm run env:check` (ver `package.json`).
const envSchema = z.object({
  // URL do webhook do n8n — server-only, nunca expor no bundle do cliente.
  // Precisa ser uma URL válida começando com https://.
  N8N_WEBHOOK_URL: z
    .string({ message: "N8N_WEBHOOK_URL obrigatória." })
    .trim()
    .min(1, "N8N_WEBHOOK_URL obrigatória.")
    .url("N8N_WEBHOOK_URL deve ser uma URL válida.")
    .refine(
      (value) => value.startsWith("https://"),
      "N8N_WEBHOOK_URL deve usar https://.",
    ),
  // URL pública canônica do portfólio. Opcional, mas se presente precisa ser URL válida.
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
