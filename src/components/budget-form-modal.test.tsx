// @vitest-environment jsdom

// Render tests do BudgetFormModal.
// - Modal nao renderiza no DOM antes de abrir.
// - Abre ao clicar no trigger, expondo o form dentro.
// - Fecha pelo botao X, pelo backdrop e pelo Escape.
// - Bloqueia o scroll do body enquanto aberto.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import { BudgetFormModal } from "./budget-form-modal";

const whatsappHref = "https://wa.me/5521987783382?text=Ol%C3%A1";

function okJsonResponse(): Response {
    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJsonResponse()));
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // Restaura o overflow do body caso algum teste tenha esquecido.
    document.body.style.overflow = "";
});

describe("BudgetFormModal", () => {
    it("não renderiza o diálogo antes de abrir", () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("abre o modal ao clicar no trigger e expõe o formulário", () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Solicitar orçamento/i }),
        );

        // Dialog acessível (role + aria-modal).
        const dialog = screen.getByRole("dialog");
        expect(dialog.getAttribute("aria-modal")).toBe("true");

        // Formulário do BudgetForm dentro do modal.
        expect(screen.getByLabelText(/^Nome$/i)).toBeDefined();
        expect(
            screen.getByRole("button", { name: /Enviar pedido/i }),
        ).toBeDefined();

        // Scroll do body travado.
        expect(document.body.style.overflow).toBe("hidden");
    });

    it("fecha o modal pelo botão X", async () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Solicitar orçamento/i }),
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Fechar formulário/i }),
        );

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).toBeNull();
        });

        // Overflow do body volta ao estado anterior (vazio no jsdom).
        expect(document.body.style.overflow).toBe("");
    });

    it("fecha o modal ao pressionar Escape", async () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Solicitar orçamento/i }),
        );

        fireEvent.keyDown(document, { key: "Escape" });

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).toBeNull();
        });
    });

    it("fecha o modal ao clicar no backdrop", async () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Solicitar orçamento/i }),
        );

        // O backdrop é um botão com aria-label="Fechar".
        // Existem dois no DOM quando aberto (backdrop + botão X com label
        // "Fechar formulário"). Buscamos exatamente "Fechar".
        fireEvent.click(
            screen.getByRole("button", { name: /^Fechar$/ }),
        );

        await waitFor(() => {
            expect(screen.queryByRole("dialog")).toBeNull();
        });
    });

    it("propaga o whatsappHref ao BudgetForm interno", () => {
        render(
            <BudgetFormModal
                triggerLabel="Solicitar orçamento"
                whatsappHref={whatsappHref}
            />,
        );

        fireEvent.click(
            screen.getByRole("button", { name: /Solicitar orçamento/i }),
        );

        // O BudgetForm renderiza um link wa.me já no estado idle (fallback
        // discreto). Deve usar o href passado pelo modal.
        const waLinks = screen
            .getAllByRole("link")
            .filter((anchor) =>
                (anchor.getAttribute("href") ?? "").startsWith(
                    "https://wa.me/",
                ),
            );
        expect(waLinks.length).toBeGreaterThan(0);
        expect(waLinks[0].getAttribute("href")).toBe(whatsappHref);
    });
});
