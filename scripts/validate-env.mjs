import { z } from "zod";

// Schema para validação das variáveis de ambiente necessárias em build/prebuild.
// Executado por `npm run env:check` (ver `package.json`).
const envSchema = z.object({
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
