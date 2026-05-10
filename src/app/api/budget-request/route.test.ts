// @vitest-environment node

// Testes example-based para o handler POST /api/budget-request.
//
// Cobre todos os cenarios da tabela Error Handling do design document, alem
// do caminho feliz (fetch resolve 2xx) e do rate limit in-memory.
//
// Importante: o rate limit da rota usa um `Map` em escopo de modulo. Para
// que cada teste comece com estado limpo usamos `vi.resetModules()` no
// `beforeEach` e `await import("./route")` dentro de cada `it`, forcando a
// reavaliacao do modulo e, com isso, um novo `Map` zerado.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

// -----------------------------------------------------------------------------
// Helpers de teste
// -----------------------------------------------------------------------------

// Corpo valido padrao, usado em quase todos os cenarios de sucesso/falha.
const VALID_BODY = {
    name: "Bryan",
    whatsapp: "(21) 98778-3382",
    businessType: "Barbearia",
    projectType: "landing_page",
    budget: "up_to_300",
    message: "Teste",
    pageUrl: "http://localhost:3000/",
};

function makeRequest(opts: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}): Request {
    // O runtime do Next valida os cabecalhos como uma requisicao HTTP real;
    // aqui definimos apenas os headers que a rota realmente inspeciona.
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-forwarded-for": "1.2.3.4",
        ...(opts.headers ?? {}),
    };

    // Remocao explicita de headers setados como string vazia — permite aos
    // testes "apagarem" cabecalhos padrao (ex.: Content-Type ausente).
    for (const key of Object.keys(headers)) {
        if (headers[key] === "") {
            delete headers[key];
        }
    }

    return new Request("http://localhost:3000/api/budget-request", {
        method: opts.method ?? "POST",
        headers,
        body: opts.body,
    });
}

// Mock compartilhado de `fetch`. Cada teste limpa/reconfigura no beforeEach.
const fetchMock = vi.fn();

describe("POST /api/budget-request", () => {
    beforeEach(() => {
        // Reset total: o modulo da rota sera recarregado em cada `it`,
        // entao o rate limit in-memory comeca zerado.
        vi.resetModules();

        // Envs default: webhook valido e site URL de desenvolvimento.
        vi.stubEnv("N8N_WEBHOOK_URL", "https://example.com/fake-n8n-webhook");
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

        // Fetch mock padrao: responde 200 OK (sucesso do webhook).
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // -------------------------------------------------------------------------
    // 1. Metodo nao permitido
    // -------------------------------------------------------------------------

    it("retorna 405 com Allow: POST em GET", async () => {
        const { GET } = await import("./route");

        const response = GET();

        expect(response.status).toBe(405);
        expect(response.headers.get("Allow")).toBe("POST");
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Método não permitido.",
        });
    });

    // -------------------------------------------------------------------------
    // 2-3. Content-Type
    // -------------------------------------------------------------------------

    it("retorna 415 quando Content-Type esta ausente", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                headers: { "Content-Type": "" },
                body: JSON.stringify(VALID_BODY),
            }),
        );

        expect(response.status).toBe(415);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Content-Type inválido.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("retorna 415 quando Content-Type e text/plain", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(VALID_BODY),
            }),
        );

        expect(response.status).toBe(415);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Content-Type inválido.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 4. Origin nao permitida
    // -------------------------------------------------------------------------

    it("retorna 403 quando Origin nao e permitida", async () => {
        // Com NEXT_PUBLIC_SITE_URL=http://localhost:3000 a origem abaixo
        // continua proibida.
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bps2414.vercel.app");

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                headers: { Origin: "https://evil.example" },
                body: JSON.stringify(VALID_BODY),
            }),
        );

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Origem não permitida.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 5-6. Tamanho do corpo
    // -------------------------------------------------------------------------

    it("retorna 413 quando Content-Length declarado excede 16384", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                headers: { "Content-Length": "20000" },
                body: JSON.stringify(VALID_BODY),
            }),
        );

        expect(response.status).toBe(413);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Payload muito grande.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("retorna 413 quando os bytes reais excedem 16384 mesmo com Content-Length mentido", async () => {
        const { POST } = await import("./route");

        // Corpo JSON enorme. Declaramos Content-Length pequeno para garantir
        // que a rota nao confia so no cabecalho.
        const bigPayload = JSON.stringify({
            ...VALID_BODY,
            message: "a".repeat(17_000),
        });

        const response = await POST(
            makeRequest({
                headers: { "Content-Length": "100" },
                body: bigPayload,
            }),
        );

        expect(response.status).toBe(413);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Payload muito grande.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 7. JSON invalido
    // -------------------------------------------------------------------------

    it("retorna 400 quando o corpo nao e JSON valido", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: "{not-json" }),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Confira os campos obrigatórios.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 8-9. Honeypot preenchido
    // -------------------------------------------------------------------------

    it("retorna 200 sem encaminhar quando o honeypot website esta preenchido", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                body: JSON.stringify({
                    ...VALID_BODY,
                    website: "https://spam.example",
                }),
            }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("retorna 200 sem encaminhar quando o honeypot companyWebsite esta preenchido", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                body: JSON.stringify({
                    ...VALID_BODY,
                    companyWebsite: "https://spam.example",
                }),
            }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 10-11. Falha de schema
    // -------------------------------------------------------------------------

    it("retorna 400 quando projectType nao e uma opcao valida", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                body: JSON.stringify({
                    ...VALID_BODY,
                    projectType: "foo",
                }),
            }),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Confira os campos obrigatórios.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("retorna 400 quando name esta vazio", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                body: JSON.stringify({ ...VALID_BODY, name: "" }),
            }),
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Confira os campos obrigatórios.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 12-13. Env invalida
    // -------------------------------------------------------------------------

    it("retorna 500 quando N8N_WEBHOOK_URL esta ausente", async () => {
        vi.stubEnv("N8N_WEBHOOK_URL", "");

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Não consegui processar agora.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("retorna 500 quando N8N_WEBHOOK_URL nao e https", async () => {
        vi.stubEnv("N8N_WEBHOOK_URL", "http://insecure.example/hook");

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Não consegui processar agora.",
        });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    // -------------------------------------------------------------------------
    // 14-16. Falhas do webhook
    // -------------------------------------------------------------------------

    it("retorna 502 quando fetch rejeita (erro de rede)", async () => {
        fetchMock.mockReset();
        fetchMock.mockRejectedValue(new Error("ECONNRESET"));

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Não consegui enviar agora.",
        });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("retorna 502 quando o webhook responde 500", async () => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Não consegui enviar agora.",
        });
    });

    it("retorna 502 quando o webhook responde 302 (redirecionamento)", async () => {
        fetchMock.mockReset();
        // Response nao aceita status 302 com body; usar redirect helper.
        fetchMock.mockResolvedValue(
            Response.redirect("https://other.example", 302),
        );

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
            ok: false,
            message: "Não consegui enviar agora.",
        });
    });

    // -------------------------------------------------------------------------
    // 17-18. Sucesso
    // -------------------------------------------------------------------------

    it("retorna 200 { ok: true } quando o webhook responde 204", async () => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("retorna 200 { ok: true } e encaminha Lead_Payload correto quando o webhook responde 200", async () => {
        const { POST } = await import("./route");

        const response = await POST(
            makeRequest({
                headers: { "User-Agent": "Mozilla/5.0 (Vitest)" },
                body: JSON.stringify(VALID_BODY),
            }),
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ ok: true });

        // Verificar a chamada ao webhook.
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [
            string,
            RequestInit,
        ];

        expect(url).toBe("https://example.com/fake-n8n-webhook");
        expect(init.method).toBe("POST");
        expect(
            (init.headers as Record<string, string>)["Content-Type"],
        ).toBe("application/json");

        const parsed = JSON.parse(init.body as string) as Record<
            string,
            unknown
        >;

        expect(parsed.source).toBe("portfolio");
        expect(parsed.metadata).toEqual({
            site: "portfolio",
            form: "lead-request",
        });
        expect(parsed.name).toBe("Bryan");
        expect(parsed.phone).toBe("21987783382");
        expect(parsed.businessType).toBe("Barbearia");
        expect(parsed.projectType).toBe("landing_page");
        expect(parsed.budget).toBe("up_to_300");
        expect(parsed.message).toBe("Teste");
        expect(parsed.pageUrl).toBe("http://localhost:3000/");

        // createdAt precisa ser ISO 8601 UTC roundtrip-consistente.
        expect(typeof parsed.createdAt).toBe("string");
        expect(
            new Date(parsed.createdAt as string).toISOString(),
        ).toBe(parsed.createdAt);
    });

    // -------------------------------------------------------------------------
    // 19. Rate limit
    // -------------------------------------------------------------------------

    it("retorna 429 no 6o POST do mesmo IP dentro da janela de 10 minutos", async () => {
        // Congelar o relogio para garantir que o reset nao acontece durante
        // as 6 requisicoes.
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));

        const { POST } = await import("./route");

        for (let i = 0; i < 5; i += 1) {
            const response = await POST(
                makeRequest({ body: JSON.stringify(VALID_BODY) }),
            );
            expect(response.status).toBe(200);
        }

        const sixth = await POST(
            makeRequest({ body: JSON.stringify(VALID_BODY) }),
        );

        expect(sixth.status).toBe(429);
        await expect(sixth.json()).resolves.toEqual({
            ok: false,
            message: "Tente novamente em instantes.",
        });

        // O sexto pedido NAO deve ter chamado fetch.
        expect(fetchMock).toHaveBeenCalledTimes(5);
    });
});

// -----------------------------------------------------------------------------
// Property-based tests
// -----------------------------------------------------------------------------

describe("POST /api/budget-request - property tests", () => {
    beforeEach(() => {
        // Mesmo setup dos testes example-based: reset modular + env + fetch mock.
        vi.resetModules();
        vi.stubEnv("N8N_WEBHOOK_URL", "https://example.com/fake-n8n-webhook");
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // Feature: budget-request-form, Property 7: Honeypot preenchido encerra a requisição com 200 e não encaminha
    // Validates: Requirements 7.4
    it("encerra com 200 { ok: true } e nao encaminha quando o honeypot website esta preenchido (PBT)", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string().filter((s) => s.trim().length > 0),
                async (website) => {
                    // Isolamento entre runs: cada iteracao precisa de um modulo
                    // fresco (rate limit zerado) e um fetch mock limpo.
                    vi.resetModules();
                    fetchMock.mockReset();
                    fetchMock.mockResolvedValue(
                        new Response(null, { status: 200 }),
                    );
                    vi.stubGlobal("fetch", fetchMock);
                    vi.stubEnv(
                        "N8N_WEBHOOK_URL",
                        "https://example.com/fake-n8n-webhook",
                    );
                    vi.stubEnv(
                        "NEXT_PUBLIC_SITE_URL",
                        "http://localhost:3000",
                    );

                    const { POST } = await import("./route");

                    const response = await POST(
                        makeRequest({
                            body: JSON.stringify({
                                ...VALID_BODY,
                                website,
                            }),
                        }),
                    );

                    expect(response.status).toBe(200);
                    await expect(response.json()).resolves.toEqual({
                        ok: true,
                    });
                    expect(fetchMock).not.toHaveBeenCalled();
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: budget-request-form, Property 8: Mapping deterministico do status do n8n
    // Validates: Requirements 9.4, 9.5
    //
    // Para todo status HTTP `c` retornado pelo webhook do n8n, a rota deve
    // mapear deterministicamente:
    //   - c em [200, 299] -> resposta com status 200 e corpo { ok: true }.
    //   - Caso contrario (inclui 3xx, 4xx, 5xx) -> resposta com status 502 e
    //     corpo { ok: false, message: "Não consegui enviar agora." }.
    //
    // Nota sobre o gerador: o design especifica c em [100, 599], porem o
    // construtor `new Response(...)` no runtime Node/undici nao aceita status
    // < 200 (lanca RangeError), e na pratica o cliente fetch tambem nunca
    // observa 1xx como resposta final (o runtime consome esses provisórios
    // antes de entregar a Response). Restringimos o gerador a [200, 599], que
    // cobre o conjunto de status realmente observavel vindo do webhook.
    it("mapeia deterministicamente o status do n8n para sucesso ou 502 (PBT)", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 200, max: 599 }),
                async (status) => {
                    // Isolamento por run: modulo fresco (rate limit zerado) e
                    // mocks reconfigurados do zero.
                    vi.resetModules();
                    fetchMock.mockReset();

                    // Alguns status 3xx (301, 302, 303, 307, 308) exigem um
                    // header `Location` quando construidos via `new Response`.
                    // Incluir o header para toda a faixa 3xx mantem o mock
                    // robusto sem alterar o comportamento esperado da rota
                    // (que apenas inspeciona `response.status`).
                    const mockResponse =
                        status >= 300 && status < 400
                            ? new Response(null, {
                                status,
                                headers: {
                                    Location: "https://location.example/",
                                },
                            })
                            : new Response(null, { status });

                    fetchMock.mockResolvedValue(mockResponse);
                    vi.stubGlobal("fetch", fetchMock);
                    vi.stubEnv(
                        "N8N_WEBHOOK_URL",
                        "https://example.com/fake-n8n-webhook",
                    );
                    vi.stubEnv(
                        "NEXT_PUBLIC_SITE_URL",
                        "http://localhost:3000",
                    );

                    const { POST } = await import("./route");

                    const response = await POST(
                        makeRequest({ body: JSON.stringify(VALID_BODY) }),
                    );

                    if (status >= 200 && status < 300) {
                        expect(response.status).toBe(200);
                        await expect(response.json()).resolves.toEqual({
                            ok: true,
                        });
                    } else {
                        expect(response.status).toBe(502);
                        await expect(response.json()).resolves.toEqual({
                            ok: false,
                            message: "Não consegui enviar agora.",
                        });
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: budget-request-form, Property 9: Respostas do Budget_API nunca vazam dados internos
    // Validates: Requirements 9.2
    //
    // Em qualquer cenario gerado (body valido/invalido, headers variados,
    // erros de env, erros de webhook, honeypot, origin proibida etc.), o corpo
    // de texto retornado pela rota NAO deve conter:
    //   - O valor literal de process.env.N8N_WEBHOOK_URL (quando definido).
    //   - A substring "N8N_WEBHOOK_URL" (nome da variavel de ambiente).
    //   - Um marcador tipico de stack trace no formato /at .+\.[jt]s/.
    //
    // A estrategia usa fc.oneof sobre records descritivos — um record por
    // familia de resposta (10 no total) — para garantir cobertura uniforme
    // das rotas de sucesso/erro e manter shrinking legivel em falhas.
    it("respostas nunca vazam URL do webhook, nome da env nem stack traces (PBT)", async () => {
        const WEBHOOK_URL = "https://example.com/fake-n8n-webhook";

        // Gerador de cenarios: cada record e discriminado por `kind` e carrega
        // apenas os dados extras necessarios para configurar o cenario.
        const scenarioGen = fc.oneof(
            // 1. Body valido + fetch 200 -> Response 200 { ok: true }.
            fc.record({ kind: fc.constant("fetch200" as const) }),
            // 2. Body valido + fetch rejeita -> 502.
            fc.record({
                kind: fc.constant("fetchReject" as const),
                errorMessage: fc.string({ maxLength: 50 }),
            }),
            // 3. Body valido + fetch 500 -> 502.
            fc.record({ kind: fc.constant("fetch500" as const) }),
            // 4. projectType invalido -> 400.
            fc.record({ kind: fc.constant("invalidProjectType" as const) }),
            // 5. name vazio -> 400.
            fc.record({ kind: fc.constant("emptyName" as const) }),
            // 6. JSON invalido -> 400.
            fc.record({ kind: fc.constant("invalidJson" as const) }),
            // 7. Content-Type text/plain -> 415.
            fc.record({ kind: fc.constant("textPlain" as const) }),
            // 8. Origin nao permitida -> 403.
            fc.record({ kind: fc.constant("forbiddenOrigin" as const) }),
            // 9. Honeypot preenchido -> 200 fake-success.
            fc.record({
                kind: fc.constant("honeypot" as const),
                website: fc
                    .string({ minLength: 1, maxLength: 50 })
                    .filter((s) => s.trim().length > 0),
            }),
            // 10. Env N8N_WEBHOOK_URL ausente -> 500.
            fc.record({ kind: fc.constant("envMissing" as const) }),
        );

        await fc.assert(
            fc.asyncProperty(scenarioGen, async (scenario) => {
                // Isolamento por run: modulo fresco (rate limit zerado),
                // fetch mock resetado e envs re-stubadas do zero.
                vi.resetModules();
                fetchMock.mockReset();

                // Env default para todos os cenarios; os cenarios especificos
                // re-stubam abaixo se precisarem de valores diferentes.
                vi.stubEnv("N8N_WEBHOOK_URL", WEBHOOK_URL);
                vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

                // Request default: headers/body valid body. Cada cenario sobrescreve
                // o que precisar.
                let headers: Record<string, string> = {};
                let body: string = JSON.stringify(VALID_BODY);

                switch (scenario.kind) {
                    case "fetch200":
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "fetchReject":
                        // Erro de rede: o catch da rota NAO deve incluir
                        // o stack/mensagem na resposta enviada ao cliente.
                        fetchMock.mockRejectedValue(
                            new Error(`ECONNRESET ${scenario.errorMessage}`),
                        );
                        break;
                    case "fetch500":
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 500 }),
                        );
                        break;
                    case "invalidProjectType":
                        body = JSON.stringify({
                            ...VALID_BODY,
                            projectType: "not_a_valid_project_type_xyz",
                        });
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "emptyName":
                        body = JSON.stringify({ ...VALID_BODY, name: "" });
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "invalidJson":
                        body = "{not-json-at-all";
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "textPlain":
                        headers = { "Content-Type": "text/plain" };
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "forbiddenOrigin":
                        // Em producao `localhost` nao e permitido; forcamos
                        // uma Origin claramente externa contra um SITE_URL
                        // valido nao-localhost.
                        vi.stubEnv(
                            "NEXT_PUBLIC_SITE_URL",
                            "https://bps2414.vercel.app",
                        );
                        headers = { Origin: "https://evil.example" };
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "honeypot":
                        body = JSON.stringify({
                            ...VALID_BODY,
                            website: scenario.website,
                        });
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                    case "envMissing":
                        vi.stubEnv("N8N_WEBHOOK_URL", "");
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                        break;
                }

                vi.stubGlobal("fetch", fetchMock);

                const { POST } = await import("./route");

                const response = await POST(makeRequest({ headers, body }));
                const bodyText = await response.text();

                // Property 9: invariantes de nao-vazamento no corpo da resposta.
                expect(bodyText).not.toContain(WEBHOOK_URL);
                expect(bodyText).not.toContain("N8N_WEBHOOK_URL");
                expect(bodyText).not.toMatch(/at .+\.[jt]s/);
            }),
            { numRuns: 100 },
        );
    });
});

describe("POST /api/budget-request - property tests (logs sem PII)", () => {
    // Setup isolado deste describe para nao interferir com o bloco anterior
    // nem depender da ordem de execucao. O estado e reconstruido do zero em
    // cada iteracao da property (rate limit zerado, fetch mock fresco, envs
    // restubadas, spies re-instalados), entao o beforeEach/afterEach aqui
    // so garantem o baseline entre casos example-based do describe — nao
    // sao estritamente necessarios mas mantem consistencia com o padrao
    // usado nos outros describes do arquivo.
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("N8N_WEBHOOK_URL", "https://example.com/fake-n8n-webhook");
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    // Feature: budget-request-form, Property 10: Logs do Budget_API não contêm PII do Lead_Payload
    // Validates: Requirements 13.1, 13.2
    //
    // Para todo ServerInput valido combinado com qualquer cenario que produza
    // logs (fetch rejeita, fetch 500, fetch 200), nenhum argumento serializado
    // de console.log/info/warn/error deve conter:
    //   - input.name
    //   - os digitos normalizados de input.whatsapp
    //   - input.message (quando nao vazio)
    //
    // Estrategia para minimizar falsos positivos de substring:
    //   - name, businessType e message sao gerados com prefixo "__usertest_"
    //     + sufixo alpha aleatorio (5..30 chars). Isso garante que nenhuma
    //     string legitima dos logs (ex.: "n8n bad status", "portfolio",
    //     "lead forwarded", chaves como "projectType"/"budget"/"status") se
    //     sobreponha por acidente ao valor gerado.
    //   - whatsapp e sempre exatamente 11 digitos (formato celular BR, DDD+9+8).
    //     Logs so emitem status HTTP (3 digitos), entao 11 digitos nunca
    //     coincidem por substring.
    it("logs nunca contem PII do lead (name, phone, message) (PBT)", async () => {
        // Alfabeto alpha minusculo — evita digitos, acentos e simbolos que
        // poderiam colidir com tokens dos logs (ex.: "200", "502").
        const alphaArb = fc.string({
            minLength: 5,
            maxLength: 30,
            unit: fc.constantFrom(
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
            ),
        });

        const nameArb = alphaArb.map((s) => `__usertest_name_${s}`);
        const businessTypeArb = alphaArb.map((s) => `__usertest_bt_${s}`);
        // Mensagem pode ser vazia (opcional) ou unica. O test pula o check de
        // substring quando vazia para nao disparar `expect` trivial.
        const messageArb = fc.oneof(
            fc.constant(""),
            alphaArb.map((s) => `__usertest_msg_${s}`),
        );
        // 11 digitos — sempre dentro de [10, 13], schema nunca rejeita pelo
        // tamanho. Digitos arbitrarios cobrem tambem casos "000...0" e
        // "999...9" sem risco de colisao com os 3 digitos de status HTTP.
        const whatsappArb = fc.string({
            minLength: 11,
            maxLength: 11,
            unit: fc.constantFrom(
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
            ),
        });
        const projectTypeArb = fc.constantFrom(
            "landing_page",
            "institutional_site",
            "digital_menu",
            "scheduling",
            "simple_system",
            "other",
        );
        const budgetArb = fc.oneof(
            fc.constant(""),
            fc.constantFrom(
                "up_to_300",
                "300_to_600",
                "600_to_1000",
                "unsure",
            ),
        );
        // Apenas cenarios que realmente produzem logs no caminho principal
        // (fetch rejeita, fetch 500, fetch 200). Honeypot e erros 4xx emitem
        // seus proprios warns mas nao contem PII por construcao — cobrir os
        // 3 cenarios acima ja estabelece a invariante para o fluxo feliz e os
        // dois erros de webhook, que sao os unicos que manipulam o Lead_Payload.
        const scenarioArb = fc.constantFrom(
            "fetchReject" as const,
            "fetch500" as const,
            "fetch200" as const,
        );

        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    name: nameArb,
                    whatsapp: whatsappArb,
                    businessType: businessTypeArb,
                    projectType: projectTypeArb,
                    budget: budgetArb,
                    message: messageArb,
                }),
                scenarioArb,
                async (input, scenario) => {
                    // Isolamento por run.
                    vi.resetModules();
                    fetchMock.mockReset();
                    vi.stubEnv(
                        "N8N_WEBHOOK_URL",
                        "https://example.com/fake-n8n-webhook",
                    );
                    vi.stubEnv(
                        "NEXT_PUBLIC_SITE_URL",
                        "http://localhost:3000",
                    );

                    if (scenario === "fetchReject") {
                        // Injeta propositalmente input.name na mensagem do Error:
                        // se a rota logasse o error ou seu stack, o teste
                        // detectaria imediatamente o vazamento.
                        fetchMock.mockRejectedValue(
                            new Error(`ECONNRESET ${input.name}`),
                        );
                    } else if (scenario === "fetch500") {
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 500 }),
                        );
                    } else {
                        fetchMock.mockResolvedValue(
                            new Response(null, { status: 200 }),
                        );
                    }

                    vi.stubGlobal("fetch", fetchMock);

                    // Instala spies silenciosos em todos os niveis de log.
                    const logSpy = vi
                        .spyOn(console, "log")
                        .mockImplementation(() => { });
                    const infoSpy = vi
                        .spyOn(console, "info")
                        .mockImplementation(() => { });
                    const warnSpy = vi
                        .spyOn(console, "warn")
                        .mockImplementation(() => { });
                    const errorSpy = vi
                        .spyOn(console, "error")
                        .mockImplementation(() => { });

                    try {
                        const { POST } = await import("./route");

                        await POST(
                            makeRequest({
                                body: JSON.stringify({
                                    name: input.name,
                                    whatsapp: input.whatsapp,
                                    businessType: input.businessType,
                                    projectType: input.projectType,
                                    budget: input.budget,
                                    message: input.message,
                                    pageUrl: "http://localhost:3000/",
                                }),
                            }),
                        );

                        // Coleta todos os argumentos passados para cada nivel.
                        const allCalls = [
                            ...logSpy.mock.calls,
                            ...infoSpy.mock.calls,
                            ...warnSpy.mock.calls,
                            ...errorSpy.mock.calls,
                        ];

                        // Serializa cada chamada como uma linha de texto.
                        // Argumentos nao-string viram JSON para que objetos
                        // aninhados (ex.: contextos dos logs) sejam inspecionaveis.
                        const serialized = allCalls
                            .map((args) =>
                                args
                                    .map((a) =>
                                        typeof a === "string"
                                            ? a
                                            : JSON.stringify(a),
                                    )
                                    .join(" "),
                            )
                            .join("\n");

                        // Invariantes do Property 10.
                        expect(serialized).not.toContain(input.name);

                        const phoneDigits = input.whatsapp.replace(/\D/g, "");
                        if (phoneDigits.length >= 10) {
                            expect(serialized).not.toContain(phoneDigits);
                        }

                        if (input.message.length > 0) {
                            expect(serialized).not.toContain(input.message);
                        }
                    } finally {
                        logSpy.mockRestore();
                        infoSpy.mockRestore();
                        warnSpy.mockRestore();
                        errorSpy.mockRestore();
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
