import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(__dirname, "validate-env.mjs");

function runScript(env) {
    return spawnSync(
        process.execPath,
        [SCRIPT_PATH],
        {
            env: { ...env, PATH: process.env.PATH },
            encoding: "utf8",
        },
    );
}

describe("validate-env.mjs", () => {
    it("passa quando executado sem variáveis (vazio)", () => {
        const result = runScript({});
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("Env check OK.");
    });

    it("falha quando NEXT_PUBLIC_SITE_URL é inválida", () => {
        const result = runScript({ NEXT_PUBLIC_SITE_URL: "invalid-url" });
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain("NEXT_PUBLIC_SITE_URL");
    });

    it("passa quando NEXT_PUBLIC_SITE_URL é uma URL válida", () => {
        const result = runScript({
            NEXT_PUBLIC_SITE_URL: "https://bps2414.vercel.app",
        });
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("Env check OK.");
    });
});
