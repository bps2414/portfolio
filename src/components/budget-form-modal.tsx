"use client";

// Wrapper modal para o BudgetForm.
// - Usa React Portal para escapar do stacking context dos cards.
// - Fecha no ESC, no clique fora e no botao X.
// - Trava o scroll do body enquanto aberto.
// - Nao injeta nenhuma logica de envio: delega tudo ao BudgetForm existente.

import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BudgetForm } from "@/components/budget-form";
import { cn } from "@/lib/utils";

export type BudgetFormModalProps = {
    /** Conteudo do botao que abre o modal (ex.: <>Solicitar orçamento</>). */
    triggerLabel: ReactNode;
    /** Classe aplicada ao botao trigger. */
    triggerClassName?: string;
    /** Href do WhatsApp repassado ao BudgetForm interno. */
    whatsappHref: string;
    /** Titulo exibido no topo do modal. */
    title?: string;
    /** Subtitulo opcional abaixo do titulo. */
    subtitle?: string;
};

export function BudgetFormModal({
    triggerLabel,
    triggerClassName,
    whatsappHref,
    title = "Solicitar orçamento",
    subtitle = "Preencha os campos abaixo. Eu leio e te respondo pelo WhatsApp informado.",
}: BudgetFormModalProps) {
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    const close = useCallback(() => setOpen(false), []);

    // ESC fecha o modal.
    useEffect(() => {
        if (!open) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, close]);

    // Scroll lock + foco inicial no botao de fechar quando abre.
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Foco no botao fechar por acessibilidade (rotina de teclado).
        closeButtonRef.current?.focus();

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={triggerClassName}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                {triggerLabel}
            </button>

            {open && typeof document !== "undefined"
                ? createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        className={cn(
                            "fixed inset-0 z-50 flex items-center justify-center",
                            "px-4 py-6 sm:px-6",
                        )}
                    >
                        {/* Backdrop clicavel para fechar */}
                        <button
                            type="button"
                            aria-label="Fechar"
                            onClick={close}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />

                        {/* Card do modal */}
                        <div
                            className={cn(
                                "relative z-10 w-full max-w-xl",
                                "max-h-[calc(100dvh-3rem)] overflow-y-auto",
                                "rounded-2xl border border-border bg-surface shadow-2xl",
                            )}
                        >
                            {/* Header do modal */}
                            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface px-6 py-4">
                                <div>
                                    <h2
                                        id={titleId}
                                        className="font-heading text-xl font-bold tracking-tight text-primary"
                                    >
                                        {title}
                                    </h2>
                                    {subtitle ? (
                                        <p className="mt-1 text-sm leading-relaxed text-secondary">
                                            {subtitle}
                                        </p>
                                    ) : null}
                                </div>
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    onClick={close}
                                    className="shrink-0 rounded-md p-2 text-secondary transition-colors hover:bg-raised hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    aria-label="Fechar formulário"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* BudgetForm encapsulado; remove a borda externa
                                do form porque o modal ja fornece o container. */}
                            <div className="px-6 py-5">
                                <BudgetForm
                                    whatsappHref={whatsappHref}
                                    className="!rounded-none !border-0 !bg-transparent !p-0"
                                />
                            </div>
                        </div>
                    </div>,
                    document.body,
                )
                : null}
        </>
    );
}
