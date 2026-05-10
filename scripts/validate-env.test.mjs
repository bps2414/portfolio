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
    it("falha quando N8N_WEBHOOK_URL está ausente", () => {
        const result = runScript({});
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain("N8N_WEBHOOK_URL");
    });

    it("falha quando N8N_WEBHOOK_URL não é https", () => {
        const result = runScript({ N8N_WEBHOOK_URL: "http://foo" });
        expect(result.status).not.toBe(0);
        expect(result.stderr).toContain("N8N_WEBHOOK_URL");
    });

    it("passa quando N8N_WEBHOOK_URL é URL https válida", () => {
        const result = runScript({
            N8N_WEBHOOK_URL: "https://n8n.exemplo.com/webhook/abc",
        });
        expect(result.status).toBe(0);
        expect(result.stdout).toContain("Env check OK.");
    });
});
