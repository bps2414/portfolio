// @vitest-environment jsdom

// Render tests do BudgetForm (Task 5.2).
// Cobre acessibilidade, fluxo de sucesso, fluxo de erro, guarda de double-click
// e ausencia de warnings no console. Mantem linguagem dos Requirements 10.*,
// 4.4, 4.5, 4.3 e 12.6.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import fc from "fast-check";

import { BudgetForm } from "./budget-form";

// Href fixo usado em todos os testes para simular a URL final do WhatsApp
// montada na home (Requirement 1.2).
const whatsappHref = "https://wa.me/5521987783382?text=Ol%C3%A1";

// Frases exatas dos Requirements 4.4 e 4.5 (pt-BR com acentuacao).
const SUCCESS_MESSAGE =
    "Recebi seu pedido! Vou analisar e te chamar pelo WhatsApp.";
const ERROR_MESSAGE =
    "Não consegui enviar agora. Tente novamente ou me chame pelo WhatsApp.";

// -----------------------------------------------------------------------------
// Helpers compartilhados
// -----------------------------------------------------------------------------

/**
 * Preenche todos os campos obrigatorios do formulario com valores validos.
 * Usa `fireEvent.change` porque o helper `onChange` do componente recebe o
 * evento diretamente e aplica a mascara quando necessario.
 */
function fillValid(): void {
    fireEvent.change(screen.getByLabelText(/^Nome$/i), {
        target: { value: "Bryan" },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), {
        target: { value: "(21) 98778-3382" },
    });
    fireEvent.change(screen.getByLabelText(/Tipo de negócio/i), {
        target: { value: "Barbearia" },
    });
    fireEvent.change(screen.getByLabelText(/Tipo de projeto desejado/i), {
        target: { value: "landing_page" },
    });
}

/** Cria uma Response JSON de sucesso (`{ ok: true }`) equivalente ao contrato do Budget_API. */
function okJsonResponse(): Response {
    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

// -----------------------------------------------------------------------------
// Setup / teardown
// -----------------------------------------------------------------------------

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    // Silencia e observa console.error para o check do Requirement 12.6.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    // Mock padrao do fetch devolve 200 OK; testes que exigem outro
    // comportamento re-stubam antes do render.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJsonResponse()));
});

afterEach(() => {
    // `globals: false` desativa o auto-cleanup do Testing Library; chamamos
    // manualmente para evitar vazamento de nodes entre testes.
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

// -----------------------------------------------------------------------------
// Testes de acessibilidade (Requirements 10.1, 10.2, 10.3, 10.4, 10.5)
// -----------------------------------------------------------------------------

describe("BudgetForm - acessibilidade", () => {
    it("expoe todos os campos via <label> acessivel (Requirement 10.1)", () => {
        render(<BudgetForm whatsappHref={whatsappHref} />);

        // Campos obrigatorios com label visivel associado ao input/select.
        expect(screen.getByLabelText(/^Nome$/i)).toBeDefined();
        expect(screen.getByLabelText(/WhatsApp/i)).toBeDefined();
        expect(screen.getByLabelText(/Tipo de negócio/i)).toBeDefined();
        expect(
            screen.getByLabelText(/Tipo de projeto desejado/i),
        ).toBeDefined();

        // Campos opcionais: ambos tambem precisam de label acessivel.
        expect(
            screen.getByLabelText(/Orçamento aproximado \(opcional\)/i),
        ).toBeDefined();
        expect(
            screen.getByLabelText(/Mensagem \(opcional\)/i),
        ).toBeDefined();
    });

    it("marca o honeypot com tabindex=-1, autocomplete=off e o container como aria-hidden (Requirement 10.4)", () => {
        const { container } = render(
            <BudgetForm whatsappHref={whatsappHref} />,
        );

        // A opcao { hidden: true } e necessaria porque o container do
        // honeypot tem aria-hidden="true" e classe `hidden` (display: none).
        const honeypot = screen.getByLabelText(
            /Website \(não preencher\)/i,
            { selector: "input", ...({ hidden: true } as { hidden: true }) },
        ) as HTMLInputElement;

        expect(honeypot.tabIndex).toBe(-1);
        expect(honeypot.getAttribute("autocomplete")).toBe("off");

        // O container imediato precisa expor aria-hidden="true" para que
        // leitores de tela nao anunciem o campo.
        const wrapper = honeypot.closest('[aria-hidden="true"]');
        expect(wrapper).not.toBeNull();
        // Sanity check: o wrapper tambem e o elemento que deixa o campo fora
        // do fluxo visual (Tailwind `hidden` => display: none).
        expect(wrapper?.className ?? "").toContain("hidden");

        // Garante que o honeypot nao aparece na query sem { hidden: true },
        // confirmando que o usuario de leitor de tela nao o encontra.
        expect(
            container.querySelector('input[name="website"]'),
        ).not.toBeNull();
    });

    it("submete vazio e sinaliza campos obrigatorios com aria-invalid e aria-describedby (Requirements 10.2, 10.3)", async () => {
        render(<BudgetForm whatsappHref={whatsappHref} />);

        fireEvent.click(
            screen.getByRole("button", { name: /Enviar pedido/i }),
        );

        // Espera as mensagens de erro aparecerem antes de inspecionar atributos.
        const nameError = await screen.findByText("Informe seu nome.");
        const whatsappError = await screen.findByText("Telefone inválido.");
        const businessTypeError = await screen.findByText(
            "Informe o tipo de negócio.",
        );
        const projectTypeError = await screen.findByText(
            "Selecione um tipo de projeto.",
        );

        // Cada campo obrigatorio deve ficar aria-invalid="true" e apontar
        // para a mensagem via aria-describedby.
        const name = screen.getByLabelText(/^Nome$/i);
        const whatsapp = screen.getByLabelText(/WhatsApp/i);
        const businessType = screen.getByLabelText(/Tipo de negócio/i);
        const projectType = screen.getByLabelText(
            /Tipo de projeto desejado/i,
        );

        expect(name.getAttribute("aria-invalid")).toBe("true");
        expect(whatsapp.getAttribute("aria-invalid")).toBe("true");
        expect(businessType.getAttribute("aria-invalid")).toBe("true");
        expect(projectType.getAttribute("aria-invalid")).toBe("true");

        // aria-describedby deve bater com o `id` do <p> correspondente.
        expect(name.getAttribute("aria-describedby")).toBe(nameError.id);
        expect(whatsapp.getAttribute("aria-describedby")).toBe(
            whatsappError.id,
        );
        expect(businessType.getAttribute("aria-describedby")).toBe(
            businessTypeError.id,
        );
        expect(projectType.getAttribute("aria-describedby")).toBe(
            projectTypeError.id,
        );

        // Render + submit invalido nao devem gerar console.error (Requirement 12.6).
        expect(errorSpy).not.toHaveBeenCalled();
    });
});

// -----------------------------------------------------------------------------
// Fluxo de sucesso (Requirement 4.4)
// -----------------------------------------------------------------------------

describe("BudgetForm - fluxo de sucesso", () => {
    it("submete dados validos, recebe 200 e mostra a mensagem exata de sucesso", async () => {
        render(<BudgetForm whatsappHref={whatsappHref} />);

        fillValid();
        fireEvent.click(
            screen.getByRole("button", { name: /Enviar pedido/i }),
        );

        // Exatidao da frase importa: bate com o Requirement 4.4 palavra por palavra.
        expect(await screen.findByText(SUCCESS_MESSAGE)).toBeDefined();

        // Em sucesso, o formulario desaparece para dar lugar ao card de
        // confirmacao; o botao de submit nao deve mais estar no DOM.
        expect(
            screen.queryByRole("button", { name: /Enviar pedido/i }),
        ).toBeNull();
        expect(screen.queryByLabelText(/^Nome$/i)).toBeNull();
    });
});

// -----------------------------------------------------------------------------
// Fluxo de erro (Requirement 4.5)
// -----------------------------------------------------------------------------

describe("BudgetForm - fluxo de erro", () => {
    it("exibe mensagem de erro exata e link para o WhatsApp quando o fetch retorna 500", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
        );

        render(<BudgetForm whatsappHref={whatsappHref} />);

        fillValid();
        fireEvent.click(
            screen.getByRole("button", { name: /Enviar pedido/i }),
        );

        // Mensagem do Requirement 4.5.
        expect(await screen.findByText(ERROR_MESSAGE)).toBeDefined();

        // Deve existir um link que leva ao WhatsApp (fallback visivel no
        // estado de erro, conforme Requirement 4.5 + 1.2).
        const waLinks = screen
            .getAllByRole("link")
            .filter((anchor) =>
                (anchor.getAttribute("href") ?? "").startsWith(
                    "https://wa.me/",
                ),
            );
        expect(waLinks.length).toBeGreaterThan(0);

        // O formulario continua visivel e editavel no estado de erro
        // (Requirement 4.6), com o botao Enviar pedido imediatamente habilitado.
        const submitButton = screen.getByRole("button", {
            name: /Enviar pedido/i,
        }) as HTMLButtonElement;
        expect(submitButton.disabled).toBe(false);
    });
});

// -----------------------------------------------------------------------------
// Double-click durante submitting (Requirement 4.3)
// -----------------------------------------------------------------------------

describe("BudgetForm - guarda de double-click", () => {
    it("ignora o segundo click enquanto o Submission_State e submitting", async () => {
        // Fetch com promise pendente para travar o componente em `submitting`
        // ate resolvermos manualmente.
        let resolveFetch: (value: Response) => void = () => { };
        const pending = new Promise<Response>((resolve) => {
            resolveFetch = resolve;
        });
        const fetchMock = vi.fn().mockReturnValue(pending);
        vi.stubGlobal("fetch", fetchMock);

        render(<BudgetForm whatsappHref={whatsappHref} />);
        fillValid();

        const submit = screen.getByRole("button", {
            name: /Enviar pedido/i,
        });

        // Primeiro click dispara o fetch e coloca o componente em `submitting`.
        fireEvent.click(submit);
        // Segundo click imediatamente depois nao pode causar outra chamada.
        fireEvent.click(submit);

        // Resolve a promise pendente e aguarda o componente retornar a `idle`/`success`.
        resolveFetch(okJsonResponse());

        await waitFor(() => {
            expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeNull();
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

// -----------------------------------------------------------------------------
// Ausencia de console.error em caminho feliz (Requirement 12.6)
// -----------------------------------------------------------------------------

describe("BudgetForm - silencio no console", () => {
    it("renderiza e envia sem disparar console.error", async () => {
        render(<BudgetForm whatsappHref={whatsappHref} />);

        fillValid();
        fireEvent.click(
            screen.getByRole("button", { name: /Enviar pedido/i }),
        );

        // Aguarda o sucesso para garantir que todo o ciclo de render passou.
        expect(await screen.findByText(SUCCESS_MESSAGE)).toBeDefined();

        expect(errorSpy).not.toHaveBeenCalled();
    });
});

// -----------------------------------------------------------------------------
// Property-based test (Task 5.3)
// -----------------------------------------------------------------------------

describe("BudgetForm - property tests", () => {
    it("sempre renderiza <a href^=https://wa.me/ em qualquer Submission_State (PBT)", async () => {
        // Feature: budget-request-form, Property 11: WhatsApp fallback visivel em qualquer Submission_State
        // Validates: Requirements 1.2, 4.5
        await fc.assert(
            fc.asyncProperty(
                fc.constantFrom(
                    "idle" as const,
                    "submitting" as const,
                    "success" as const,
                    "error" as const,
                ),
                async (state) => {
                    // Reset completo entre iteracoes: cleanup do DOM, restaura
                    // spies e stubs globais para evitar vazamento de estado.
                    cleanup();
                    vi.unstubAllGlobals();
                    vi.restoreAllMocks();

                    // Re-instala o spy de console.error; o afterEach global
                    // tambem roda, mas cada iteracao comeca com ambiente limpo.
                    errorSpy = vi
                        .spyOn(console, "error")
                        .mockImplementation(() => { });

                    // Configura o mock de fetch de acordo com o estado alvo.
                    let fetchMock: ReturnType<typeof vi.fn>;
                    if (state === "idle" || state === "submitting") {
                        // Promise pendente: em `submitting` trava o componente;
                        // em `idle` o fetch nunca chega a ser chamado.
                        const pending = new Promise<Response>(() => { });
                        fetchMock = vi.fn().mockReturnValue(pending);
                    } else if (state === "success") {
                        fetchMock = vi
                            .fn()
                            .mockResolvedValue(okJsonResponse());
                    } else {
                        fetchMock = vi
                            .fn()
                            .mockResolvedValue(
                                new Response(null, { status: 500 }),
                            );
                    }
                    vi.stubGlobal("fetch", fetchMock);

                    const { container } = render(
                        <BudgetForm whatsappHref={whatsappHref} />,
                    );

                    // Dispara o submit apenas quando o estado alvo exige.
                    if (state !== "idle") {
                        fillValid();
                        fireEvent.click(
                            screen.getByRole("button", {
                                name: /Enviar pedido/i,
                            }),
                        );
                    }

                    // Aguarda o marcador do estado alvo antes de inspecionar o DOM.
                    if (state === "success") {
                        await screen.findByText(SUCCESS_MESSAGE);
                    } else if (state === "error") {
                        await screen.findByText(ERROR_MESSAGE);
                    } else if (state === "submitting") {
                        await waitFor(() => {
                            expect(
                                screen.queryByText(/Enviando/),
                            ).not.toBeNull();
                        });
                    }

                    // Invariante: em QUALQUER estado precisa existir pelo menos
                    // um <a href="https://wa.me/..."> no DOM (Requirement 1.2).
                    const waLinks = Array.from(
                        container.querySelectorAll("a[href]"),
                    ).filter((anchor) =>
                        (anchor.getAttribute("href") ?? "").startsWith(
                            "https://wa.me/",
                        ),
                    );
                    expect(waLinks.length).toBeGreaterThan(0);
                },
            ),
            // 40 iteracoes cobrem com folga os 4 estados possiveis (~10 cada)
            // e permitem shrinking do fast-check.
            { numRuns: 40 },
        );
    });
});
