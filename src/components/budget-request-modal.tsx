"use client";

import { type FormEvent, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  X,
} from "lucide-react";
import {
  clientFacingOptions,
  type BudgetRequestKind,
  type ClientFacingOption,
} from "@/lib/budget-request";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PackageInfo = {
  title: string;
  priceLabel: string;
};

type BudgetRequestModalProps = {
  kind: BudgetRequestKind;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  packageInfo?: PackageInfo;
  className?: string;
};

type FormState = {
  name: string;
  whatsapp: string;
  whatsappConsent: boolean;
  businessName: string;
  currentUrlOrSocial: string;
  projectType: string;
  mainGoal: string;
  desiredDeadline: string;
  contentStatus: string;
  budgetRange: string;
  selectedOptions: ClientFacingOption[];
  specificNeeds: string;
  references: string;
  approvalContact: string;
  notes: string;
  website: string;
};

const initialFormState: FormState = {
  name: "",
  whatsapp: "",
  whatsappConsent: false,
  businessName: "",
  currentUrlOrSocial: "",
  projectType: "",
  mainGoal: "",
  desiredDeadline: "",
  contentStatus: "",
  budgetRange: "",
  selectedOptions: [],
  specificNeeds: "",
  references: "",
  approvalContact: "",
  notes: "",
  website: "",
};

function getSteps(kind: BudgetRequestKind) {
  if (kind === "custom") {
    return ["Contato", "Projeto", "Escopo", "Contexto opcional"];
  }

  return ["Contato", "Projeto", "Extras opcionais"];
}

export function BudgetRequestModal({
  kind,
  label,
  variant = "primary",
  packageInfo,
  className,
}: BudgetRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const steps = useMemo(() => getSteps(kind), [kind]);
  const isCustom = kind === "custom";
  const portalRoot = typeof document === "undefined" ? null : document.body;

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleOption(option: ClientFacingOption) {
    setForm((current) => {
      const selected = new Set(current.selectedOptions);

      if (selected.has(option)) {
        selected.delete(option);
      } else {
        selected.add(option);
      }

      return { ...current, selectedOptions: Array.from(selected) };
    });
  }

  function canContinue() {
    if (step === 0) {
      return (
        form.name.trim().length > 0 &&
        form.whatsapp.trim().length > 0 &&
        form.whatsappConsent
      );
    }

    if (step === 1) {
      if (isCustom) {
        return (
          form.projectType.trim().length > 0 &&
          form.mainGoal.trim().length > 0 &&
          form.desiredDeadline.trim().length > 0
        );
      }

      return (
        form.mainGoal.trim().length > 0 &&
        form.desiredDeadline.trim().length > 0 &&
        form.contentStatus.trim().length > 0
      );
    }

    if (isCustom && step === 2) {
      return (
        form.budgetRange.trim().length > 0 && form.selectedOptions.length > 0
      );
    }

    return true;
  }

  function closeModal() {
    setOpen(false);
    setStep(0);
    setStatus("idle");
    setMessage("");
    setForm(initialFormState);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/budget-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind,
        selectedPackage: packageInfo,
        website: form.website,
        contact: {
          name: form.name,
          whatsapp: form.whatsapp,
          whatsappConsent: form.whatsappConsent,
        },
        project: {
          businessName: form.businessName,
          currentUrlOrSocial: form.currentUrlOrSocial,
          projectType: form.projectType,
          mainGoal: form.mainGoal,
          desiredDeadline: form.desiredDeadline,
          contentStatus: form.contentStatus,
          budgetRange: isCustom ? form.budgetRange : undefined,
          selectedOptions: form.selectedOptions,
          specificNeeds: form.specificNeeds,
          references: form.references,
          approvalContact: form.approvalContact,
          notes: form.notes,
        },
        metadata: {
          submittedAt: new Date().toISOString(),
          sourcePage: window.location.pathname,
          userAgent: window.navigator.userAgent,
        },
      }),
    });

    const data = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(data.message ?? "Nao consegui enviar sua solicitacao agora.");
      return;
    }

    setStatus("success");
    setMessage(data.message ?? "Solicitacao recebida.");
  }

  return (
    <>
      <Button
        variant={variant}
        size="lg"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Send className="mr-3 h-5 w-5" />
        {label}
      </Button>

      {open && portalRoot
        ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  {packageInfo?.title ?? "Orcamento personalizado"}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-primary">
                  Montar solicitacao
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  Preencha o essencial. Os campos opcionais ajudam a reduzir
                  perguntas depois.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-2 text-secondary transition-colors hover:bg-raised hover:text-primary"
                aria-label="Fechar formulario"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-border px-5 py-3 sm:px-6">
              <div className="flex gap-2">
                {steps.map((item, index) => (
                  <div
                    key={item}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      index <= step ? "bg-accent" : "bg-raised",
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-secondary">
                {steps[step]}
              </p>
            </div>

            <div className="max-h-[58dvh] overflow-y-auto px-5 py-5 sm:max-h-none sm:px-6">
              {status === "success" ? (
                <div className="flex min-h-60 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-5 h-12 w-12 text-accent" />
                  <h3 className="font-heading text-2xl font-bold text-primary">
                    Solicitacao recebida
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">
                    {message}
                  </p>
                </div>
              ) : (
                <div className="min-h-60">
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={(event) =>
                      updateField("website", event.target.value)
                    }
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {step === 0 ? (
                    <div className="grid gap-4">
                      <Field
                        label="Nome"
                        value={form.name}
                        onChange={(value) => updateField("name", value)}
                        required
                      />
                      <Field
                        label="WhatsApp"
                        value={form.whatsapp}
                        onChange={(value) => updateField("whatsapp", value)}
                        required
                      />
                      <label className="flex gap-3 rounded-lg border border-border bg-background/60 p-3 text-sm text-secondary">
                        <input
                          type="checkbox"
                          checked={form.whatsappConsent}
                          onChange={(event) =>
                            updateField("whatsappConsent", event.target.checked)
                          }
                          className="mt-1"
                        />
                        Aceito receber contato pelo WhatsApp informado.
                      </label>
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="grid gap-4">
                      {isCustom ? (
                        <Field
                          label="Tipo de projeto"
                          value={form.projectType}
                          onChange={(value) =>
                            updateField("projectType", value)
                          }
                          required
                        />
                      ) : null}
                      <Field
                        label="Objetivo principal"
                        value={form.mainGoal}
                        onChange={(value) => updateField("mainGoal", value)}
                        required
                        textarea
                      />
                      <Field
                        label="Prazo desejado"
                        value={form.desiredDeadline}
                        onChange={(value) =>
                          updateField("desiredDeadline", value)
                        }
                        required
                      />
                      {!isCustom ? (
                        <Field
                          label="Ja tem textos, imagens ou logo?"
                          value={form.contentStatus}
                          onChange={(value) =>
                            updateField("contentStatus", value)
                          }
                          required
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {isCustom && step === 2 ? (
                    <div className="grid gap-4">
                      <Field
                        label="Faixa de investimento"
                        value={form.budgetRange}
                        onChange={(value) => updateField("budgetRange", value)}
                        required
                      />
                      <OptionGrid
                        selectedOptions={form.selectedOptions}
                        onToggle={toggleOption}
                      />
                      <Field
                        label="Integracoes ou necessidades especificas"
                        value={form.specificNeeds}
                        onChange={(value) =>
                          updateField("specificNeeds", value)
                        }
                        textarea
                      />
                    </div>
                  ) : null}

                  {(!isCustom && step === 2) || (isCustom && step === 3) ? (
                    <div className="grid gap-4">
                      {!isCustom ? (
                        <OptionGrid
                          selectedOptions={form.selectedOptions}
                          onToggle={toggleOption}
                        />
                      ) : null}
                      <Field
                        label="Nome da marca ou empresa"
                        value={form.businessName}
                        onChange={(value) => updateField("businessName", value)}
                      />
                      <Field
                        label="Site ou Instagram atual"
                        value={form.currentUrlOrSocial}
                        onChange={(value) =>
                          updateField("currentUrlOrSocial", value)
                        }
                      />
                      {isCustom ? (
                        <>
                          <Field
                            label="Ja tem textos, imagens ou logo?"
                            value={form.contentStatus}
                            onChange={(value) =>
                              updateField("contentStatus", value)
                            }
                          />
                          <Field
                            label="Quem vai aprovar o projeto?"
                            value={form.approvalContact}
                            onChange={(value) =>
                              updateField("approvalContact", value)
                            }
                          />
                        </>
                      ) : null}
                      <Field
                        label="Referencias"
                        value={form.references}
                        onChange={(value) => updateField("references", value)}
                      />
                      <Field
                        label="Observacoes finais"
                        value={form.notes}
                        onChange={(value) => updateField("notes", value)}
                        textarea
                      />
                    </div>
                  ) : null}

                  {status === "error" ? (
                    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {message} Voce pode tentar novamente ou me chamar pelo
                      WhatsApp.
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {status !== "success" ? (
              <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                  disabled={step === 0 || status === "submitting"}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>

                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={!canContinue() || status === "submitting"}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="sm" disabled={status === "submitting"}>
                    {status === "submitting" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar
                  </Button>
                )}
              </div>
            ) : null}
          </form>
        </div>,
        portalRoot,
      )
        : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  const inputClassName =
    "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none transition-colors placeholder:text-secondary focus:border-accent";

  return (
    <label className="block text-sm font-medium text-primary">
      {label}
      {required ? <span className="text-accent"> *</span> : null}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClassName, "min-h-20 resize-none")}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      )}
    </label>
  );
}

function OptionGrid({
  selectedOptions,
  onToggle,
}: {
  selectedOptions: ClientFacingOption[];
  onToggle: (option: ClientFacingOption) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-primary">
        Itens desejados <span className="text-accent">*</span>
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {clientFacingOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-secondary"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
