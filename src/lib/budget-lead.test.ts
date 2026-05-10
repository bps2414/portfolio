// @vitest-environment node

import fc from "fast-check";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
    BUDGET_VALUES,
    budgetFormClientSchema,
    budgetLeadServerSchema,
    buildLeadPayload,
    FIELD_LIMITS,
    maskBrPhone,
    normalizeBrPhone,
    PROJECT_TYPE_VALUES,
    stripControlChars,
    truncate,
    type LeadPayload,
    type ServerInput,
} from "./budget-lead";

// -----------------------------------------------------------------------------
// Property-based tests
// -----------------------------------------------------------------------------
//
// Todos os PBTs deste arquivo executam com `numRuns: 100` para dar cobertura
// significativa sobre o espaco de entradas. Comentarios `Feature: ...`
// sao requeridos pelo design document para rastrear a propriedade testada.

describe("budget-lead: helpers", () => {
    // -------------------------------------------------------------------------
    // maskBrPhone
    // -------------------------------------------------------------------------
    describe("maskBrPhone", () => {
        // Gerador extra que exercita ruido tipico de mascara de telefone
        // (digitos, parenteses, hifen, espaco) para aumentar a chance de
        // disparar casos de borda da mascara.
        const phoneNoiseArb = fc.string({
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
                "-",
                "(",
                ")",
                " ",
            ),
        });

        it("Property 1: produz apenas caracteres do conjunto permitido e prefixa (DD) quando ha 3+ digitos", () => {
            // Feature: budget-request-form, Property 1: Máscara BR produz formato estável
            // Validates: Requirement 3.1
            fc.assert(
                fc.property(
                    fc.oneof(fc.string(), phoneNoiseArb),
                    (raw) => {
                        const result = maskBrPhone(raw);
                        const inputDigits = raw.replace(/\D/g, "");
                        const takenDigits = inputDigits.slice(0, 11);

                        // Caracteres permitidos: digitos, parenteses, hifen e espaco.
                        expect(result).toMatch(/^[()\- 0-9]*$/);

                        // Nunca extrai mais do que 11 digitos.
                        const resultDigits = result.replace(/\D/g, "");
                        expect(resultDigits.length).toBeLessThanOrEqual(11);
                        expect(resultDigits).toBe(takenDigits);

                        // Com 3+ digitos, o resultado comeca com "(DD) ".
                        if (inputDigits.length >= 3) {
                            expect(
                                result.startsWith(
                                    `(${inputDigits.slice(0, 2)}) `,
                                ),
                            ).toBe(true);
                        }

                        // Formato final depende da contagem de digitos extraidos.
                        if (takenDigits.length === 10) {
                            expect(result).toMatch(
                                /^\(\d{2}\) \d{4}-\d{4}$/,
                            );
                            expect(result.length).toBe(14);
                        }
                        if (takenDigits.length === 11) {
                            expect(result).toMatch(
                                /^\(\d{2}\) \d{5}-\d{4}$/,
                            );
                            expect(result.length).toBe(15);
                        }
                    },
                ),
                { numRuns: 100 },
            );
        });

        // Exemplos dirigidos (EXAMPLE-based): cobrem casos de borda e a
        // transicao entre cada um dos 5 ramos da mascara.
        it("retorna '' para string vazia", () => {
            expect(maskBrPhone("")).toBe("");
        });

        it("aceita 1 digito sem fechar o parenteses", () => {
            expect(maskBrPhone("1")).toBe("(1");
        });

        it("aceita 2 digitos sem fechar o parenteses", () => {
            expect(maskBrPhone("12")).toBe("(12");
        });

        it("aplica prefixo (DD) a partir de 3 digitos", () => {
            expect(maskBrPhone("123")).toBe("(12) 3");
        });

        it("mantem formato (DD) XXX enquanto houver ate 6 digitos", () => {
            expect(maskBrPhone("12345")).toBe("(12) 345");
        });

        it("introduz o hifen a partir do 7o digito", () => {
            expect(maskBrPhone("1234567")).toBe("(12) 3456-7");
        });

        it("formata telefone fixo BR com 10 digitos", () => {
            expect(maskBrPhone("1234567890")).toBe("(12) 3456-7890");
        });

        it("formata celular BR com 11 digitos", () => {
            expect(maskBrPhone("12345678901")).toBe("(12) 34567-8901");
        });

        it("trunca em 11 digitos ignorando o excedente", () => {
            expect(maskBrPhone("123456789012")).toBe("(12) 34567-8901");
        });

        it("e idempotente sobre um telefone ja mascarado", () => {
            expect(maskBrPhone("(21) 98778-3382")).toBe("(21) 98778-3382");
        });
    });

    // -------------------------------------------------------------------------
    // normalizeBrPhone
    // -------------------------------------------------------------------------
    describe("normalizeBrPhone", () => {
        it("Property 2: preserva apenas digitos e respeita a faixa aceita", () => {
            // Feature: budget-request-form, Property 2: Normalização de telefone preserva apenas dígitos
            // Validates: Requirement 3.2
            fc.assert(
                fc.property(fc.string(), (raw) => {
                    const result = normalizeBrPhone(raw);
                    const digitCount = raw.replace(/\D/g, "").length;

                    // Apenas digitos ou string vazia.
                    expect(result).toMatch(/^\d*$/);

                    if (result === "") {
                        // Vazio => a entrada tinha digitCount fora de [10, 13].
                        expect(
                            digitCount < FIELD_LIMITS.phoneDigitsMin ||
                            digitCount > FIELD_LIMITS.phoneDigitsMax,
                        ).toBe(true);
                    } else {
                        // Nao vazio => length dentro da faixa e igual a digitCount.
                        expect(result.length).toBeGreaterThanOrEqual(
                            FIELD_LIMITS.phoneDigitsMin,
                        );
                        expect(result.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.phoneDigitsMax,
                        );
                        expect(result.length).toBe(digitCount);
                    }
                }),
                { numRuns: 100 },
            );
        });

        it("extrai 11 digitos de um telefone mascarado BR", () => {
            expect(normalizeBrPhone("(21) 98778-3382")).toBe("21987783382");
        });

        it("aceita 13 digitos quando ha codigo do pais", () => {
            expect(normalizeBrPhone("+55 21 98778-3382")).toBe(
                "5521987783382",
            );
        });

        it("retorna '' para entrada abaixo do minimo", () => {
            expect(normalizeBrPhone("1234")).toBe("");
        });

        it("retorna '' para entrada acima do maximo", () => {
            expect(normalizeBrPhone("12345678901234")).toBe("");
        });

        it("retorna '' para string vazia", () => {
            expect(normalizeBrPhone("")).toBe("");
        });
    });

    // -------------------------------------------------------------------------
    // truncate
    // -------------------------------------------------------------------------
    describe("truncate", () => {
        it("nao altera string menor ou igual ao limite", () => {
            expect(truncate("hello", 10)).toBe("hello");
        });

        it("corta string maior que o limite", () => {
            expect(truncate("hello world", 5)).toBe("hello");
        });

        it("retorna '' para string vazia", () => {
            expect(truncate("", 10)).toBe("");
        });

        it("corta por code units UTF-16 (comportamento atual de .slice)", () => {
            // Documentado: `truncate` usa `.slice`, que conta code units.
            // "é" = 1 code unit (U+00E9), "😀" = 2 code units (par substituto).
            expect(truncate("é😀", 1)).toBe("é");
        });
    });

    // -------------------------------------------------------------------------
    // stripControlChars
    // -------------------------------------------------------------------------
    describe("stripControlChars", () => {
        // Regex banida (igual a usada na implementacao).
        const bannedControlRegex =
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

        // Conta as ocorrencias de \t, \n e \r em uma string.
        function countPreservedControls(value: string): number {
            let count = 0;
            for (const char of value) {
                if (char === "\t" || char === "\n" || char === "\r") {
                    count += 1;
                }
            }
            return count;
        }

        // Gerador que inclui explicitamente bytes de controle para disparar
        // o caminho de remocao com mais frequencia.
        const controlCharArb = fc.string({
            unit: fc.oneof(
                fc.constantFrom(
                    "\u0000",
                    "\u0001",
                    "\u0007",
                    "\u0008",
                    "\u000B",
                    "\u000C",
                    "\u000E",
                    "\u001F",
                    "\t",
                    "\n",
                    "\r",
                    "a",
                    " ",
                ),
                fc.string({ maxLength: 1, minLength: 1 }),
            ),
        });

        it("Property 3: remove caracteres de controle banidos e preserva \\t, \\n, \\r", () => {
            // Feature: budget-request-form, Property 3: Sanitização remove todo caractere de controle banido
            // Validates: Requirement 8.7
            fc.assert(
                fc.property(
                    fc.oneof(fc.string(), controlCharArb),
                    (raw) => {
                        const result = stripControlChars(raw);

                        // Nenhum caractere banido sobrevive.
                        expect(bannedControlRegex.test(result)).toBe(false);

                        // \t, \n e \r sao preservados em igual quantidade.
                        expect(countPreservedControls(result)).toBe(
                            countPreservedControls(raw),
                        );
                    },
                ),
                { numRuns: 100 },
            );
        });

        it("remove NUL (\\u0000)", () => {
            expect(stripControlChars("a\u0000b")).toBe("ab");
        });

        it("preserva \\t, \\n e \\r", () => {
            expect(stripControlChars("a\tb\nc\rd")).toBe("a\tb\nc\rd");
        });

        it("remove multiplos caracteres de controle misturados", () => {
            expect(stripControlChars("a\u001Fb\u0001c")).toBe("abc");
        });

        it("retorna '' para string vazia", () => {
            expect(stripControlChars("")).toBe("");
        });

        it("nao altera string sem caracteres de controle", () => {
            expect(stripControlChars("hello")).toBe("hello");
        });
    });
});

// -----------------------------------------------------------------------------
// Schemas server-side e construcao do Lead_Payload
// -----------------------------------------------------------------------------
//
// Este bloco cobre as Properties 4, 5 e 6 do design document:
// - Property 4 valida que `budgetLeadServerSchema` aceita uma entrada se e
//   somente se TODAS as regras semanticas do Requirement 2/3/8 valerem.
// - Property 5 garante que `buildLeadPayload` respeita os limites de
//   truncamento do Requirement 6.8/6.9/8.2/8.3.
// - Property 6 garante a estrutura canonica + constantes fixas do payload
//   (Requirements 6.1..6.7), incluindo a invariante de nao vazamento da URL
//   do webhook do n8n injetada em `process.env` (Requirement 5.2).

describe("budget-lead: schemas e payload", () => {
    // -------------------------------------------------------------------------
    // Geradores compartilhados
    // -------------------------------------------------------------------------

    // Gera uma string formada apenas por digitos com tamanho no intervalo
    // [min, max]. `fc.string({ unit })` restringe o alfabeto gerado aos
    // itens de `fc.constantFrom`.
    const digitsArb = (min: number, max: number) =>
        fc.string({
            minLength: min,
            maxLength: max,
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

    // Garante que a string resultante tem pelo menos 1 caractere nao-whitespace
    // apos `.trim()`. Usado para gerar valores obrigatorios validos nas
    // Properties 5 e 6.
    const nonBlankStringArb = (maxLength: number) =>
        fc
            .tuple(
                fc.constantFrom("a", "B", "9", "ç", "ã"),
                fc.string({ maxLength: Math.max(0, maxLength - 1) }),
            )
            .map(([head, tail]) => head + tail);

    // Gerador de `whatsapp` com ampla variacao: so digitos de tamanhos
    // variaveis (tanto validos quanto invalidos), strings com mascara e
    // strings arbitrarias que podem conter letras.
    const whatsappArb = fc.oneof(
        digitsArb(0, 15),
        fc
            .tuple(digitsArb(2, 2), digitsArb(4, 5), digitsArb(4, 4))
            .map(([ddd, prefix, suffix]) => `(${ddd}) ${prefix}-${suffix}`),
        fc.string({ maxLength: 20 }),
    );

    // Gerador de `projectType` que mescla valores do enum com strings
    // arbitrarias (incluindo strings vazias) fora do enum.
    const projectTypeArb = fc.oneof(
        fc.constantFrom(...PROJECT_TYPE_VALUES),
        fc.string({ maxLength: 20 }),
    );

    // Gerador de `budget` que mescla `""`, valores do enum e strings fora.
    const budgetArb = fc.oneof(
        fc.constant(""),
        fc.constantFrom(...BUDGET_VALUES),
        fc.string({ maxLength: 20 }),
    );

    // Gerador de `message` com tamanhos variados, incluindo > 1000 chars
    // para cobrir o limite do Requirement 2.9/8.3.
    const messageArb = fc.oneof(
        fc.constant(""),
        fc.string({ maxLength: 500 }),
        fc.string({ minLength: 1000, maxLength: 1001 }),
        fc.string({ minLength: 1001, maxLength: 1200 }),
    );

    // Gerador de `name` / `businessType` com mix de vazio, so-whitespace,
    // curtos e normais.
    const maybeBlankStringArb = fc.oneof(
        fc.constant(""),
        fc.constant("   "),
        fc.constant("\t\n "),
        fc.string({ maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
    );

    // -------------------------------------------------------------------------
    // Property 4
    // -------------------------------------------------------------------------
    describe("budgetLeadServerSchema", () => {
        it("Property 4: aceita iff todas as regras valem", () => {
            // Feature: budget-request-form, Property 4: Schema server-side aceita iff regras valem
            // Validates: Requirements 2.5, 2.6, 2.7, 2.8, 2.9, 3.3, 8.1, 8.4, 8.5
            fc.assert(
                fc.property(
                    fc.record({
                        name: maybeBlankStringArb,
                        whatsapp: whatsappArb,
                        businessType: maybeBlankStringArb,
                        projectType: projectTypeArb,
                        budget: budgetArb,
                        message: messageArb,
                    }),
                    (input) => {
                        // Calcula a expectativa a partir das regras descritas no
                        // Requirement 2/3/8 sem depender do Zod.
                        const whatsappDigits = input.whatsapp.replace(
                            /\D/g,
                            "",
                        ).length;

                        const nameOk = input.name.trim().length >= 1;
                        const whatsappOk =
                            whatsappDigits >= FIELD_LIMITS.phoneDigitsMin &&
                            whatsappDigits <= FIELD_LIMITS.phoneDigitsMax;
                        const businessTypeOk =
                            input.businessType.trim().length >= 1;
                        const projectTypeOk = (
                            PROJECT_TYPE_VALUES as readonly string[]
                        ).includes(input.projectType);
                        const budgetOk =
                            input.budget === "" ||
                            (BUDGET_VALUES as readonly string[]).includes(
                                input.budget,
                            );
                        const messageOk =
                            input.message.length <= FIELD_LIMITS.message;

                        const expected =
                            nameOk &&
                            whatsappOk &&
                            businessTypeOk &&
                            projectTypeOk &&
                            budgetOk &&
                            messageOk;

                        const result =
                            budgetLeadServerSchema.safeParse(input).success;

                        expect(result).toBe(expected);
                    },
                ),
                { numRuns: 100 },
            );
        });

        // ----- Exemplos dirigidos -----

        it("aceita mensagem com exatamente 1000 caracteres (cliente e servidor)", () => {
            const base = {
                name: "Bryan",
                whatsapp: "(21) 98778-3382",
                businessType: "Barbearia",
                projectType: "landing_page" as const,
                budget: "" as const,
                message: "a".repeat(1000),
            };

            const clientResult = budgetFormClientSchema.safeParse(base);
            expect(clientResult.success).toBe(true);

            const serverResult = budgetLeadServerSchema.safeParse(base);
            expect(serverResult.success).toBe(true);

            // No limite o `.max` aceita e o `.transform` mantem o comprimento
            // inalterado (nao adiciona truncamento alem do necessario).
            if (serverResult.success) {
                expect(serverResult.data.message.length).toBe(1000);
            }
        });

        it("rejeita mensagem com 1001 caracteres em ambos os schemas", () => {
            // Documentacao do comportamento: `.max(1000)` vem ANTES do
            // `.transform(truncate)`, entao 1001+ chars sao rejeitados no
            // servidor tambem. Se quisermos truncar em vez de rejeitar, o
            // schema precisa ser reordenado; por ora mantemos o `.max()`
            // como ultima linha de defesa conforme o design.
            const base = {
                name: "Bryan",
                whatsapp: "(21) 98778-3382",
                businessType: "Barbearia",
                projectType: "landing_page" as const,
                budget: "" as const,
                message: "a".repeat(1001),
            };

            expect(budgetFormClientSchema.safeParse(base).success).toBe(
                false,
            );
            expect(budgetLeadServerSchema.safeParse(base).success).toBe(
                false,
            );
        });

        it("aceita phone com codigo do pais (13 digitos apos normalizar)", () => {
            const result = budgetLeadServerSchema.safeParse({
                name: "Bryan",
                whatsapp: "+55 21 98778-3382",
                businessType: "Barbearia",
                projectType: "landing_page",
                budget: "",
                message: "",
            });
            expect(result.success).toBe(true);
        });

        it("rejeita phone com apenas 4 digitos", () => {
            const result = budgetLeadServerSchema.safeParse({
                name: "Bryan",
                whatsapp: "1234",
                businessType: "Barbearia",
                projectType: "landing_page",
                budget: "",
                message: "",
            });
            expect(result.success).toBe(false);
        });

        it("aceita projectType 'landing_page'", () => {
            const result = budgetLeadServerSchema.safeParse({
                name: "Bryan",
                whatsapp: "21987783382",
                businessType: "Barbearia",
                projectType: "landing_page",
                budget: "",
                message: "",
            });
            expect(result.success).toBe(true);
        });

        it("rejeita projectType 'foo' (fora do enum)", () => {
            const result = budgetLeadServerSchema.safeParse({
                name: "Bryan",
                whatsapp: "21987783382",
                businessType: "Barbearia",
                projectType: "foo",
                budget: "",
                message: "",
            });
            expect(result.success).toBe(false);
        });

        it("aceita budget '' e preserva o valor apos parse", () => {
            const result = budgetLeadServerSchema.safeParse({
                name: "Bryan",
                whatsapp: "21987783382",
                businessType: "Barbearia",
                projectType: "landing_page",
                budget: "",
                message: "",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.budget).toBe("");
            }
        });
    });

    // -------------------------------------------------------------------------
    // Properties 5 e 6
    // -------------------------------------------------------------------------
    describe("buildLeadPayload", () => {
        // URL "fake" injetada em process.env para verificar que o payload
        // jamais contem a URL do webhook (Requirement 5.2).
        const FAKE_WEBHOOK_URL = "https://example.com/fake-n8n-webhook";
        const PREVIOUS_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
        const FIXED_NOW = new Date("2025-01-15T12:00:00.000Z");

        beforeEach(() => {
            process.env.N8N_WEBHOOK_URL = FAKE_WEBHOOK_URL;
        });

        afterEach(() => {
            if (PREVIOUS_WEBHOOK_URL === undefined) {
                delete process.env.N8N_WEBHOOK_URL;
            } else {
                process.env.N8N_WEBHOOK_URL = PREVIOUS_WEBHOOK_URL;
            }
        });

        // Gerador de `ServerInput` valido. `message` e intencionalmente
        // gerada com ate 3000 chars para exercitar o truncamento.
        const serverInputArb: fc.Arbitrary<ServerInput> = fc.record({
            name: nonBlankStringArb(300),
            phone: digitsArb(10, 13),
            businessType: nonBlankStringArb(300),
            projectType: fc.constantFrom(...PROJECT_TYPE_VALUES),
            budget: fc.oneof(
                fc.constant("" as const),
                fc.constantFrom(...BUDGET_VALUES),
            ),
            message: fc.oneof(
                fc.constant(""),
                fc.string({ maxLength: 3000 }),
            ),
            pageUrl: fc.string({ maxLength: 800 }),
        });

        // userAgent opcional: string longa ou null (Requirement 6.9).
        const userAgentArb = fc.oneof(
            fc.constant(null),
            fc.string({ maxLength: 600 }),
        );

        it("Property 5: todos os campos do payload respeitam os limites", () => {
            // Feature: budget-request-form, Property 5: Lead_Payload respeita limites de truncamento
            // Validates: Requirements 6.8, 6.9, 8.2, 8.3
            fc.assert(
                fc.property(
                    serverInputArb,
                    userAgentArb,
                    fc.string({ maxLength: 800 }),
                    (server, userAgent, pageUrl) => {
                        const p = buildLeadPayload({
                            server,
                            userAgent,
                            pageUrl,
                            now: FIXED_NOW,
                        });

                        expect(p.name.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.name,
                        );
                        expect(p.businessType.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.businessType,
                        );
                        expect(p.projectType.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.projectType,
                        );
                        expect(p.message.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.message,
                        );
                        expect(p.pageUrl.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.pageUrl,
                        );
                        expect(p.userAgent.length).toBeLessThanOrEqual(
                            FIELD_LIMITS.userAgent,
                        );
                        expect(p.phone).toMatch(/^\d{10,13}$/);
                    },
                ),
                { numRuns: 100 },
            );
        });

        it("Property 6: estrutura canonica + constantes fixas + nao vaza webhook", () => {
            // Feature: budget-request-form, Property 6: Lead_Payload tem estrutura canônica e constantes fixas
            // Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
            const expectedKeys = [
                "budget",
                "businessType",
                "createdAt",
                "message",
                "metadata",
                "name",
                "pageUrl",
                "phone",
                "projectType",
                "source",
                "userAgent",
            ];

            fc.assert(
                fc.property(
                    serverInputArb,
                    userAgentArb,
                    fc.string({ maxLength: 800 }),
                    (server, userAgent, pageUrl) => {
                        const p: LeadPayload = buildLeadPayload({
                            server,
                            userAgent,
                            pageUrl,
                            now: FIXED_NOW,
                        });

                        // Conjunto de chaves top-level EXATAMENTE o esperado.
                        expect(Object.keys(p).sort()).toEqual(expectedKeys);

                        // Constantes fixas.
                        expect(p.source).toBe("portfolio");
                        expect(p.metadata).toEqual({
                            site: "portfolio",
                            form: "lead-request",
                        });

                        // Phone so-digitos no intervalo aceito.
                        expect(p.phone).toMatch(/^\d{10,13}$/);

                        // createdAt e round-trip ISO 8601 UTC.
                        expect(
                            new Date(p.createdAt).toISOString(),
                        ).toBe(p.createdAt);

                        // Budget e message propagam a string vazia do ServerInput.
                        if (server.budget === "") {
                            expect(p.budget).toBe("");
                        }
                        if (server.message === "") {
                            expect(p.message).toBe("");
                        }

                        // A URL do webhook NUNCA aparece no payload serializado.
                        expect(JSON.stringify(p)).not.toContain(
                            FAKE_WEBHOOK_URL,
                        );
                    },
                ),
                { numRuns: 100 },
            );
        });

        // Sanity check do cleanup: process.env deve ter sido restaurado pela
        // combinacao beforeEach/afterEach. Este teste roda isoladamente e
        // confirma o valor injetado.
        it("injeta N8N_WEBHOOK_URL no process.env durante os testes", () => {
            expect(process.env.N8N_WEBHOOK_URL).toBe(FAKE_WEBHOOK_URL);
        });
    });
});
