// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// O arquivo vive em src/app/__guards__/; a raiz do repositório está 3 níveis acima.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

function readRepoFile(relativePath: string): string {
    return readFileSync(resolve(REPO_ROOT, relativePath), "utf8");
}

describe("Guardas arquiteturais do budget-form", () => {
    it("o bundle do cliente não referencia N8N_WEBHOOK_URL nem process.env", () => {
        const content = readRepoFile("src/components/budget-form.tsx");

        expect(
            content,
            "O componente cliente não pode mencionar N8N_WEBHOOK_URL — isso vazaria a URL do webhook para o bundle enviado ao navegador.",
        ).not.toMatch(/N8N_WEBHOOK_URL/);

        expect(
            content,
            "O componente cliente não pode usar process.env — o formulário deve enviar apenas para /api/budget-request, sem ler variáveis de ambiente.",
        ).not.toMatch(/\bprocess\.env\b/);
    });

    it(".env.example contém a linha N8N_WEBHOOK_URL com valor vazio", () => {
        const envExample = readRepoFile(".env.example");

        expect(
            envExample,
            "O arquivo .env.example deve declarar a variável N8N_WEBHOOK_URL com valor vazio (linha `N8N_WEBHOOK_URL=`), para documentar a configuração obrigatória sem versionar a URL real.",
        ).toMatch(/^N8N_WEBHOOK_URL=\s*$/m);
    });

    it("package.json tem prebuild configurado para rodar npm run env:check", () => {
        const pkg = JSON.parse(readRepoFile("package.json")) as {
            scripts?: Record<string, string>;
        };

        expect(
            pkg.scripts?.prebuild,
            "O script prebuild do package.json deve ser exatamente 'npm run env:check' para falhar cedo em builds sem webhook configurado.",
        ).toBe("npm run env:check");
    });
});
