"use client";

// Formulario inline de solicitacao de orcamento renderizado na home.
// Envia apenas para a rota interna `/api/budget-request`; nao faz nenhuma
// referencia a variaveis de ambiente ou ao endpoint externo.

import {
    useId,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { cn } from "@/lib/utils";
import { getButtonClasses } from "@/components/ui/button";
import {
    BUDGET_OPTIONS,
    PROJECT_TYPE_OPTIONS,
    budgetFormClientSchema,
    maskBrPhone,
    type ApiResponse,
    type FormValues,
    type SubmissionState,
} from "@/lib/budget-lead";

export type BudgetFormProps = {
    whatsappHref: string;
    className?: string;
};

// Mapeia os campos que podem exibir mensagem de erro (exclui o honeypot).
type Errors = Partial<Record<Exclude<keyof FormValues, "website">, string>>;

const INITIAL_VALUES: FormValues = {
    name: "",
    whatsapp: "",
    businessType: "",
    projectType: "",
    budget: "",
    message: "",
    website: "",
};

// Frases exatas dos Requirements 4.4 e 4.5 (pt-BR com acentuacao).
const SUCCESS_MESSAGE =
    "Recebi seu pedido! Vou analisar e te chamar pelo WhatsApp.";
const ERROR_MESSAGE =
    "Não consegui enviar agora. Tente novamente ou me chame pelo WhatsApp.";

// Classes reutilizaveis para preservar os tokens do tema escuro.
const INPUT_CLASS =
    "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none transition-colors placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/30";
const LABEL_CLASS = "text-sm font-medium text-primary";
const ERROR_CLASS = "mt-1 text-xs text-red-400";

// Mensagens de erro client-side mapeadas por campo (Requirement 2).
const ERROR_BY_FIELD: Record<keyof Errors, string> = {
    name: "Informe seu nome.",
    whatsapp: "Telefone inválido.",
    businessType: "Informe o tipo de negócio.",
    projectType: "Selecione um tipo de projeto.",
    budget: "",
    message: "Mensagem muito longa (máx. 1000 caracteres).",
};

export function BudgetForm({ whatsappHref, className }: BudgetFormProps) {
    // IDs estaveis para associar <label>, <input> e mensagens de erro via aria.
    const nameId = useId();
    const whatsappId = useId();
    const businessTypeId = useId();
    const projectTypeId = useId();
    const budgetId = useId();
    const messageId = useId();
    const websiteId = useId();
    const globalMessageId = useId();

    const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<Errors>({});
    const [submissionState, setSubmissionState] =
        useState<SubmissionState>("idle");
    // Mensagem retornada pelo servidor em caso de erro; nao e exibida na UI
    // (usamos sempre a frase fixa de erro), mas fica disponivel para debug.
    const [, setGlobalMessage] = useState<string | null>(null);

    const isSubmitting = submissionState === "submitting";
    const isSuccess = submissionState === "success";
    const isError = submissionState === "error";

    function updateField<K extends keyof FormValues>(field: K, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function handleWhatsappChange(event: ChangeEvent<HTMLInputElement>) {
        // Aplica mascara visual BR a cada tecla (Requirement 3.1).
        setValues((prev) => ({
            ...prev,
            whatsapp: maskBrPhone(event.target.value),
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Ignora double-click enquanto o envio esta em andamento.
        if (submissionState === "submitting") return;

        const parsed = budgetFormClientSchema.safeParse(values);
        if (!parsed.success) {
            const next: Errors = {};
            for (const issue of parsed.error.issues) {
                const field = issue.path[0] as keyof Errors | undefined;
                if (!field || field === "budget" || field in next) continue;
                const message = ERROR_BY_FIELD[field];
                if (message) next[field] = message;
            }
            setErrors(next);
            return;
        }

        setErrors({});
        setSubmissionState("submitting");
        setGlobalMessage(null);

        try {
            const response = await fetch("/api/budget-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: parsed.data.name,
                    whatsapp: parsed.data.whatsapp,
                    businessType: parsed.data.businessType,
                    projectType: parsed.data.projectType,
                    budget: parsed.data.budget,
                    message: parsed.data.message,
                    pageUrl: window.location.href,
                    // Honeypot: enviamos o valor bruto para o servidor decidir.
                    website: values.website,
                }),
            });

            const data: ApiResponse = await response
                .json()
                .catch(
                    () => ({ ok: false, message: "" }) as ApiResponse,
                );

            if (response.ok && "ok" in data && data.ok) {
                setSubmissionState("success");
            } else {
                setSubmissionState("error");
                if ("ok" in data && !data.ok && data.message) {
                    setGlobalMessage(data.message);
                }
            }
        } catch {
            setSubmissionState("error");
        }
    }

    // Helpers de aria-describedby: so aponta para o paragrafo de erro quando
    // o erro existe, mantendo a referencia valida (Requirement 10.3).
    function describedBy(field: keyof Errors, errorId: string) {
        return errors[field] ? errorId : undefined;
    }

    const nameErrorId = `${nameId}-error`;
    const whatsappErrorId = `${whatsappId}-error`;
    const businessTypeErrorId = `${businessTypeId}-error`;
    const projectTypeErrorId = `${projectTypeId}-error`;
    const messageErrorId = `${messageId}-error`;

    const containerClass = cn(
        "rounded-2xl border border-border bg-surface/60 p-6 sm:p-8",
        className,
    );

    if (isSuccess) {
        // Em sucesso, escondemos o formulario e mantemos o CTA de WhatsApp
        // visivel ao lado (Requirements 1.2 e 4.4).
        return (
            <div className={containerClass}>
                <div className="grid gap-4">
                    <p
                        id={globalMessageId}
                        role="status"
                        aria-live="polite"
                        className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-primary"
                    >
                        {SUCCESS_MESSAGE}
                    </p>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={getButtonClasses(
                            "outline",
                            "lg",
                            "w-full font-semibold",
                        )}
                    >
                        Falar no WhatsApp
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClass}>
            <form
                noValidate
                onSubmit={handleSubmit}
                aria-describedby={isError ? globalMessageId : undefined}
                className="grid gap-5"
            >
                {/* Campo: Nome */}
                <div>
                    <label htmlFor={nameId} className={LABEL_CLASS}>
                        Nome
                    </label>
                    <input
                        id={nameId}
                        type="text"
                        required
                        maxLength={160}
                        autoComplete="name"
                        disabled={isSubmitting}
                        value={values.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={describedBy("name", nameErrorId)}
                        className={INPUT_CLASS}
                    />
                    {errors.name ? (
                        <p id={nameErrorId} className={ERROR_CLASS}>
                            {errors.name}
                        </p>
                    ) : null}
                </div>

                {/* Campo: WhatsApp */}
                <div>
                    <label htmlFor={whatsappId} className={LABEL_CLASS}>
                        WhatsApp
                    </label>
                    <input
                        id={whatsappId}
                        type="tel"
                        inputMode="tel"
                        required
                        maxLength={16}
                        autoComplete="tel"
                        disabled={isSubmitting}
                        value={values.whatsapp}
                        onChange={handleWhatsappChange}
                        aria-invalid={Boolean(errors.whatsapp)}
                        aria-describedby={describedBy(
                            "whatsapp",
                            whatsappErrorId,
                        )}
                        className={INPUT_CLASS}
                    />
                    {errors.whatsapp ? (
                        <p id={whatsappErrorId} className={ERROR_CLASS}>
                            {errors.whatsapp}
                        </p>
                    ) : null}
                </div>

                {/* Campo: Tipo de negocio */}
                <div>
                    <label
                        htmlFor={businessTypeId}
                        className={LABEL_CLASS}
                    >
                        Tipo de negócio
                    </label>
                    <input
                        id={businessTypeId}
                        type="text"
                        required
                        maxLength={160}
                        autoComplete="organization"
                        placeholder="Ex.: barbearia, restaurante, clínica..."
                        disabled={isSubmitting}
                        value={values.businessType}
                        onChange={(e) =>
                            updateField("businessType", e.target.value)
                        }
                        aria-invalid={Boolean(errors.businessType)}
                        aria-describedby={describedBy(
                            "businessType",
                            businessTypeErrorId,
                        )}
                        className={INPUT_CLASS}
                    />
                    {errors.businessType ? (
                        <p
                            id={businessTypeErrorId}
                            className={ERROR_CLASS}
                        >
                            {errors.businessType}
                        </p>
                    ) : null}
                </div>

                {/* Campo: Tipo de projeto desejado */}
                <div>
                    <label
                        htmlFor={projectTypeId}
                        className={LABEL_CLASS}
                    >
                        Tipo de projeto desejado
                    </label>
                    <select
                        id={projectTypeId}
                        required
                        disabled={isSubmitting}
                        value={values.projectType}
                        onChange={(e) =>
                            updateField("projectType", e.target.value)
                        }
                        aria-invalid={Boolean(errors.projectType)}
                        aria-describedby={describedBy(
                            "projectType",
                            projectTypeErrorId,
                        )}
                        className={INPUT_CLASS}
                    >
                        <option value="" disabled>
                            Selecione uma opção
                        </option>
                        {PROJECT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.projectType ? (
                        <p
                            id={projectTypeErrorId}
                            className={ERROR_CLASS}
                        >
                            {errors.projectType}
                        </p>
                    ) : null}
                </div>

                {/* Campo: Orcamento aproximado (opcional) */}
                <div>
                    <label htmlFor={budgetId} className={LABEL_CLASS}>
                        Orçamento aproximado (opcional)
                    </label>
                    <select
                        id={budgetId}
                        disabled={isSubmitting}
                        value={values.budget}
                        onChange={(e) =>
                            updateField("budget", e.target.value)
                        }
                        className={INPUT_CLASS}
                    >
                        <option value="">Ainda não decidi</option>
                        {BUDGET_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Campo: Mensagem (opcional) */}
                <div>
                    <label htmlFor={messageId} className={LABEL_CLASS}>
                        Mensagem (opcional)
                    </label>
                    <textarea
                        id={messageId}
                        rows={4}
                        maxLength={1000}
                        disabled={isSubmitting}
                        value={values.message}
                        onChange={(e) =>
                            updateField("message", e.target.value)
                        }
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={describedBy(
                            "message",
                            messageErrorId,
                        )}
                        className={INPUT_CLASS}
                    />
                    {errors.message ? (
                        <p id={messageErrorId} className={ERROR_CLASS}>
                            {errors.message}
                        </p>
                    ) : null}
                </div>

                {/* Honeypot: invisivel para humanos, visivel para bots. */}
                <div aria-hidden="true" className="hidden">
                    <label htmlFor={websiteId}>Website (não preencher)</label>
                    <input
                        id={websiteId}
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.website}
                        onChange={(e) =>
                            updateField("website", e.target.value)
                        }
                    />
                </div>

                {/* Botao de submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={getButtonClasses(
                        "primary",
                        "lg",
                        "w-full font-semibold",
                    )}
                >
                    {isSubmitting ? "Enviando..." : "Enviar pedido"}
                </button>

                {/* Fallback discreto para o WhatsApp, sempre visivel no form
                    (idle/submitting). Garante que o link do WhatsApp esta
                    presente em TODOS os Submission_States (Requirement 1.2). */}
                <p className="text-center text-xs text-secondary">
                    Prefere conversar direto?{" "}
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-accent hover:underline"
                    >
                        Chamar no WhatsApp
                    </a>
                </p>

                {/* Mensagem global de erro + CTA de WhatsApp (Requirement 4.5). */}
                {isError ? (
                    <div className="grid gap-3">
                        <p
                            id={globalMessageId}
                            role="alert"
                            aria-live="polite"
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        >
                            {ERROR_MESSAGE}
                        </p>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={getButtonClasses(
                                "outline",
                                "lg",
                                "w-full font-semibold",
                            )}
                        >
                            Falar no WhatsApp
                        </a>
                    </div>
                ) : null}
            </form>
        </div>
    );
}
