# Solicitação Leve de Orçamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um fluxo leve onde o cliente solicita pacote ou orçamento personalizado, o pedido chega organizado no Discord privado, e a continuação acontece pelo WhatsApp.

**Architecture:** Manter a home como Server Component e isolar a interatividade em um Client Component pequeno. Usar um Route Handler `POST` no App Router para receber o payload, validar no servidor, formatar a mensagem privada e enviar para um webhook do Discord via variável de ambiente server-only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, lucide-react, Discord Incoming Webhook.

---

## Referências consultadas

- Spec: `docs/superpowers/specs/2026-05-02-solicitacao-orcamento-design.md`
- Regra local: `AGENTS.md`
- Next local docs:
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - `node_modules/next/dist/docs/01-app/02-guides/forms.md`
  - `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

## File Structure

- Create: `src/lib/budget-request.ts`
  - Tipos do formulário, opções em linguagem de cliente, validação server-side, normalização e mensagem do Discord.
- Create: `src/app/api/budget-request/route.ts`
  - Endpoint `POST` server-only. Lê JSON, valida payload, envia para `DISCORD_BUDGET_WEBHOOK_URL`, responde com status simples.
- Create: `src/components/budget-request-modal.tsx`
  - Client Component com modal em etapas. Fluxo curto para pacotes e fluxo completo para personalizado.
- Modify: `src/app/page.tsx`
  - Adiciona `kind` nos planos, troca CTA principal dos cards para solicitação estruturada e preserva WhatsApp direto.
- Modify: `.env.example` or create: `.env.example`
  - Documenta `DISCORD_BUDGET_WEBHOOK_URL` sem expor segredo.
- Optional Modify: `README.md`
  - Adiciona nota curta de configuração se o projeto já usa README como guia de execução.

---

### Task 1: Shared Request Model and Discord Formatter

**Files:**
- Create: `src/lib/budget-request.ts`

- [ ] **Step 1: Create shared types and client-facing options**

Create `src/lib/budget-request.ts` with this content:

```ts
export type BudgetRequestKind = "package_landing" | "package_editable" | "custom";

export type ClientFacingOption =
  | "whatsapp"
  | "map"
  | "gallery"
  | "services_prices"
  | "testimonials"
  | "form"
  | "editable_menu_products"
  | "admin_panel"
  | "not_sure";

export type BudgetRequestPayload = {
  kind: BudgetRequestKind;
  selectedPackage?: {
    title: string;
    priceLabel: string;
  };
  contact: {
    name: string;
    whatsapp: string;
    whatsappConsent: boolean;
  };
  project: {
    businessName?: string;
    currentUrlOrSocial?: string;
    projectType?: string;
    mainGoal: string;
    desiredDeadline: string;
    contentStatus?: string;
    budgetRange?: string;
    selectedOptions: ClientFacingOption[];
    specificNeeds?: string;
    references?: string;
    approvalContact?: string;
    notes?: string;
  };
  metadata: {
    submittedAt: string;
    sourcePage: string;
    userAgent?: string;
  };
};

export type ValidationResult =
  | { ok: true; payload: BudgetRequestPayload }
  | { ok: false; errors: string[] };

export const clientFacingOptions: Array<{
  value: ClientFacingOption;
  label: string;
}> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "map", label: "Mapa" },
  { value: "gallery", label: "Galeria" },
  { value: "services_prices", label: "Serviços/preços" },
  { value: "testimonials", label: "Depoimentos" },
  { value: "form", label: "Formulário" },
  { value: "editable_menu_products", label: "Cardápio/produtos editáveis" },
  { value: "admin_panel", label: "Painel para editar depois" },
  { value: "not_sure", label: "Ainda não sei" },
];

const packageKinds = new Set<BudgetRequestKind>(["package_landing", "package_editable"]);
const validKinds = new Set<BudgetRequestKind>(["package_landing", "package_editable", "custom"]);
const validOptions = new Set<ClientFacingOption>(clientFacingOptions.map((option) => option.value));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown): string | undefined {
  const text = readString(value);
  return text.length > 0 ? text : undefined;
}

function hasValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateBudgetRequest(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["Payload inválido."] };
  }

  const kind = readString(input.kind) as BudgetRequestKind;
  if (!validKinds.has(kind)) {
    errors.push("Tipo de solicitação inválido.");
  }

  const contactInput = isRecord(input.contact) ? input.contact : {};
  const projectInput = isRecord(input.project) ? input.project : {};
  const metadataInput = isRecord(input.metadata) ? input.metadata : {};

  const selectedPackageInput = isRecord(input.selectedPackage) ? input.selectedPackage : undefined;
  const selectedOptionsInput = Array.isArray(projectInput.selectedOptions)
    ? projectInput.selectedOptions
    : [];

  const selectedOptions = selectedOptionsInput
    .map((option) => readString(option) as ClientFacingOption)
    .filter((option) => validOptions.has(option));

  const payload: BudgetRequestPayload = {
    kind,
    selectedPackage: selectedPackageInput
      ? {
          title: readString(selectedPackageInput.title),
          priceLabel: readString(selectedPackageInput.priceLabel),
        }
      : undefined,
    contact: {
      name: readString(contactInput.name),
      whatsapp: readString(contactInput.whatsapp),
      whatsappConsent: contactInput.whatsappConsent === true,
    },
    project: {
      businessName: readOptionalString(projectInput.businessName),
      currentUrlOrSocial: readOptionalString(projectInput.currentUrlOrSocial),
      projectType: readOptionalString(projectInput.projectType),
      mainGoal: readString(projectInput.mainGoal),
      desiredDeadline: readString(projectInput.desiredDeadline),
      contentStatus: readOptionalString(projectInput.contentStatus),
      budgetRange: readOptionalString(projectInput.budgetRange),
      selectedOptions,
      specificNeeds: readOptionalString(projectInput.specificNeeds),
      references: readOptionalString(projectInput.references),
      approvalContact: readOptionalString(projectInput.approvalContact),
      notes: readOptionalString(projectInput.notes),
    },
    metadata: {
      submittedAt: readString(metadataInput.submittedAt) || new Date().toISOString(),
      sourcePage: readString(metadataInput.sourcePage) || "/",
      userAgent: readOptionalString(metadataInput.userAgent),
    },
  };

  if (!payload.contact.name) errors.push("Informe o nome.");
  if (!payload.contact.whatsapp) errors.push("Informe o WhatsApp.");
  if (!payload.contact.whatsappConsent) errors.push("Confirme o contato pelo WhatsApp.");
  if (!payload.project.mainGoal) errors.push("Informe o objetivo principal.");
  if (!payload.project.desiredDeadline) errors.push("Informe o prazo desejado.");

  if (packageKinds.has(kind)) {
    if (!payload.selectedPackage?.title || !payload.selectedPackage.priceLabel) {
      errors.push("Pacote selecionado inválido.");
    }
    if (!payload.project.contentStatus) {
      errors.push("Informe se já tem textos, imagens ou logo.");
    }
  }

  if (kind === "custom") {
    if (!payload.project.projectType) errors.push("Informe o tipo de projeto.");
    if (!payload.project.budgetRange) errors.push("Informe a faixa de investimento.");
    if (payload.project.selectedOptions.length === 0) {
      errors.push("Selecione pelo menos um item desejado.");
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, payload };
}

export function getMissingUsefulFields(payload: BudgetRequestPayload): string[] {
  const missing: string[] = [];

  if (!hasValue(payload.project.businessName)) missing.push("Nome da marca ou empresa");
  if (!hasValue(payload.project.currentUrlOrSocial)) missing.push("Site ou Instagram atual");
  if (!hasValue(payload.project.references)) missing.push("Referências");
  if (!hasValue(payload.project.notes)) missing.push("Observações finais");

  if (payload.kind === "custom") {
    if (!hasValue(payload.project.specificNeeds)) missing.push("Integrações ou necessidades específicas");
    if (!hasValue(payload.project.contentStatus)) missing.push("Textos, imagens ou logo");
    if (!hasValue(payload.project.approvalContact)) missing.push("Quem vai aprovar o projeto");
  }

  return missing;
}

export function getInternalNotes(payload: BudgetRequestPayload): string[] {
  const notes: string[] = [];
  const selected = new Set(payload.project.selectedOptions);

  if (payload.kind === "package_landing" && (selected.has("admin_panel") || selected.has("editable_menu_products"))) {
    notes.push("Pedido de landing tem sinal de escopo maior; pode virar personalizado.");
  }

  if (payload.kind === "package_editable" && selected.size > 0 && selected.has("not_sure")) {
    notes.push("Cliente escolheu pacote com painel, mas ainda não sabe itens; vale começar pelo objetivo.");
  }

  if (selected.has("not_sure")) {
    notes.push("Cliente marcou 'ainda não sei'; primeira resposta deve ser mais guiada.");
  }

  if (payload.project.desiredDeadline.toLowerCase().includes("urgente")) {
    notes.push("Prazo parece urgente; confirmar viabilidade antes de prometer data.");
  }

  if (!payload.project.contentStatus || payload.project.contentStatus.toLowerCase().includes("não")) {
    notes.push("Conteúdo pode não estar pronto; confirmar textos, imagens e logo.");
  }

  if (payload.kind === "custom" && payload.project.budgetRange) {
    notes.push(`Faixa informada para personalizado: ${payload.project.budgetRange}.`);
  }

  if (notes.length === 0) {
    notes.push("Pedido parece direto; chamar pelo WhatsApp com base no resumo.");
  }

  return notes;
}

export function formatDiscordMessage(payload: BudgetRequestPayload): string {
  const optionLabels = payload.project.selectedOptions
    .map((value) => clientFacingOptions.find((option) => option.value === value)?.label ?? value)
    .join(", ");
  const missingFields = getMissingUsefulFields(payload);
  const internalNotes = getInternalNotes(payload);

  return [
    "Novo pedido de orçamento",
    "",
    `Tipo: ${payload.kind === "custom" ? "Orçamento personalizado" : "Pedido de pacote"}`,
    `Pacote: ${payload.selectedPackage ? `${payload.selectedPackage.title} (${payload.selectedPackage.priceLabel})` : "-"}`,
    "",
    "Cliente:",
    `- Nome: ${payload.contact.name}`,
    `- WhatsApp: ${payload.contact.whatsapp}`,
    "",
    "Projeto:",
    `- Tipo de projeto: ${payload.project.projectType ?? "-"}`,
    `- Objetivo: ${payload.project.mainGoal}`,
    `- Prazo: ${payload.project.desiredDeadline}`,
    `- Itens desejados: ${optionLabels || "-"}`,
    `- Conteúdo: ${payload.project.contentStatus ?? "-"}`,
    `- Faixa informada: ${payload.kind === "custom" ? payload.project.budgetRange ?? "-" : "Não perguntada nos pacotes"}`,
    `- Marca/empresa: ${payload.project.businessName ?? "-"}`,
    `- Site/Instagram: ${payload.project.currentUrlOrSocial ?? "-"}`,
    `- Referências: ${payload.project.references ?? "-"}`,
    `- Necessidades específicas: ${payload.project.specificNeeds ?? "-"}`,
    `- Quem aprova: ${payload.project.approvalContact ?? "-"}`,
    `- Observações: ${payload.project.notes ?? "-"}`,
    "",
    "Análise privada:",
    `- Pontos para perguntar: ${missingFields.length > 0 ? missingFields.join(", ") : "Nenhum ponto óbvio ausente"}`,
    ...internalNotes.map((note) => `- Atenção: ${note}`),
    "- Próximo passo sugerido: chamar pelo WhatsApp",
  ].join("\n");
}
```

- [ ] **Step 2: Verify TypeScript accepts the new module**

Run:

```powershell
npm run lint
```

Expected: command exits `0`. If ESLint reports formatting or type-aware issues in `src/lib/budget-request.ts`, fix only this file.

- [ ] **Step 3: Commit shared model**

Run:

```powershell
git add -- src/lib/budget-request.ts
git commit -m "feat: add budget request model"
```

Expected: commit succeeds with only `src/lib/budget-request.ts`.

---

### Task 2: Discord Route Handler

**Files:**
- Create: `src/app/api/budget-request/route.ts`
- Create or Modify: `.env.example`

- [ ] **Step 1: Create the POST route**

Create `src/app/api/budget-request/route.ts` with this content:

```ts
import { formatDiscordMessage, validateBudgetRequest } from "@/lib/budget-request";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Payload inválido." },
      { status: 400 }
    );
  }

  const validation = validateBudgetRequest(body);

  if (!validation.ok) {
    return Response.json(
      { ok: false, message: "Confira os campos obrigatórios.", errors: validation.errors },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.DISCORD_BUDGET_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json(
      { ok: false, message: "Canal de orçamento não configurado." },
      { status: 500 }
    );
  }

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: formatDiscordMessage(validation.payload),
      allowed_mentions: { parse: [] },
    }),
  });

  if (!discordResponse.ok) {
    return Response.json(
      { ok: false, message: "Não consegui enviar a solicitação agora." },
      { status: 502 }
    );
  }

  return Response.json({
    ok: true,
    message: "Solicitação recebida. Vou analisar com calma e entro em contato pelo WhatsApp informado.",
  });
}
```

- [ ] **Step 2: Document the server-only environment variable**

If `.env.example` does not exist, create it with:

```txt
DISCORD_BUDGET_WEBHOOK_URL=
```

If `.env.example` already exists, add this line:

```txt
DISCORD_BUDGET_WEBHOOK_URL=
```

Do not use `NEXT_PUBLIC_` for this value.

- [ ] **Step 3: Verify build-time typing**

Run:

```powershell
npm run build
```

Expected: `next build` exits `0`. If it fails because `DISCORD_BUDGET_WEBHOOK_URL` is not set locally, change the route so the variable is read only inside `POST`, not at module scope.

- [ ] **Step 4: Commit route handler**

Run:

```powershell
git add -- src/app/api/budget-request/route.ts .env.example
git commit -m "feat: add budget request endpoint"
```

Expected: commit succeeds with endpoint and env example only.

---

### Task 3: Budget Request Modal

**Files:**
- Create: `src/components/budget-request-modal.tsx`

- [ ] **Step 1: Create the Client Component**

Create `src/components/budget-request-modal.tsx` with this content:

```tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send, X } from "lucide-react";
import { clientFacingOptions, type BudgetRequestKind, type ClientFacingOption } from "@/lib/budget-request";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PackageInfo = {
  title: string;
  priceLabel: string;
};

type BudgetRequestModalProps = {
  kind: BudgetRequestKind;
  label: string;
  variant?: "primary" | "outline" | "secondary" | "ghost";
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
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const steps = useMemo(() => getSteps(kind), [kind]);
  const isCustom = kind === "custom";

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
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
      return form.name.trim() && form.whatsapp.trim() && form.whatsappConsent;
    }

    if (step === 1) {
      if (isCustom) {
        return form.projectType.trim() && form.mainGoal.trim() && form.desiredDeadline.trim();
      }

      return form.mainGoal.trim() && form.desiredDeadline.trim() && form.contentStatus.trim();
    }

    if (isCustom && step === 2) {
      return form.budgetRange.trim() && form.selectedOptions.length > 0;
    }

    return true;
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
      setMessage(data.message ?? "Não consegui enviar sua solicitação agora.");
      return;
    }

    setStatus("success");
    setMessage(data.message ?? "Solicitação recebida.");
  }

  return (
    <>
      <Button variant={variant} size="lg" className={className} onClick={() => setOpen(true)}>
        <Send className="mr-3 h-5 w-5" />
        {label}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  {packageInfo?.title ?? "Orçamento personalizado"}
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-primary">
                  Montar solicitação
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  Preencha o essencial. Os campos opcionais ajudam a reduzir perguntas depois.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-secondary transition-colors hover:bg-raised hover:text-primary"
                aria-label="Fechar formulário"
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
                      index <= step ? "bg-accent" : "bg-raised"
                    )}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-secondary">
                {steps[step]}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              {status === "success" ? (
                <div className="flex min-h-60 flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-5 h-12 w-12 text-accent" />
                  <h3 className="font-heading text-2xl font-bold text-primary">Solicitação recebida</h3>
                  <p className="mt-3 text-sm leading-relaxed text-secondary">{message}</p>
                </div>
              ) : (
                <div className="min-h-60">
                  {step === 0 ? (
                    <div className="grid gap-4">
                      <Field label="Nome" value={form.name} onChange={(value) => updateField("name", value)} required />
                      <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => updateField("whatsapp", value)} required />
                      <label className="flex gap-3 rounded-lg border border-border bg-background/60 p-3 text-sm text-secondary">
                        <input
                          type="checkbox"
                          checked={form.whatsappConsent}
                          onChange={(event) => updateField("whatsappConsent", event.target.checked)}
                          className="mt-1"
                        />
                        Aceito receber contato pelo WhatsApp informado.
                      </label>
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="grid gap-4">
                      {isCustom ? (
                        <Field label="Tipo de projeto" value={form.projectType} onChange={(value) => updateField("projectType", value)} required />
                      ) : null}
                      <Field label="Objetivo principal" value={form.mainGoal} onChange={(value) => updateField("mainGoal", value)} required textarea />
                      <Field label="Prazo desejado" value={form.desiredDeadline} onChange={(value) => updateField("desiredDeadline", value)} required />
                      {!isCustom ? (
                        <Field label="Já tem textos, imagens ou logo?" value={form.contentStatus} onChange={(value) => updateField("contentStatus", value)} required />
                      ) : null}
                    </div>
                  ) : null}

                  {isCustom && step === 2 ? (
                    <div className="grid gap-4">
                      <Field label="Faixa de investimento" value={form.budgetRange} onChange={(value) => updateField("budgetRange", value)} required />
                      <OptionGrid selectedOptions={form.selectedOptions} onToggle={toggleOption} />
                      <Field label="Integrações ou necessidades específicas" value={form.specificNeeds} onChange={(value) => updateField("specificNeeds", value)} textarea />
                    </div>
                  ) : null}

                  {((!isCustom && step === 2) || (isCustom && step === 3)) ? (
                    <div className="grid gap-4">
                      {!isCustom ? <OptionGrid selectedOptions={form.selectedOptions} onToggle={toggleOption} /> : null}
                      <Field label="Nome da marca ou empresa" value={form.businessName} onChange={(value) => updateField("businessName", value)} />
                      <Field label="Site ou Instagram atual" value={form.currentUrlOrSocial} onChange={(value) => updateField("currentUrlOrSocial", value)} />
                      {isCustom ? (
                        <>
                          <Field label="Já tem textos, imagens ou logo?" value={form.contentStatus} onChange={(value) => updateField("contentStatus", value)} />
                          <Field label="Quem vai aprovar o projeto?" value={form.approvalContact} onChange={(value) => updateField("approvalContact", value)} />
                        </>
                      ) : null}
                      <Field label="Referências" value={form.references} onChange={(value) => updateField("references", value)} />
                      <Field label="Observações finais" value={form.notes} onChange={(value) => updateField("notes", value)} textarea />
                    </div>
                  ) : null}

                  {status === "error" ? (
                    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {message} Você pode tentar novamente ou me chamar pelo WhatsApp.
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
                    {status === "submitting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Enviar
                  </Button>
                )}
              </div>
            ) : null}
          </form>
        </div>
      ) : null}
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
  const inputClassName = "mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none transition-colors placeholder:text-secondary focus:border-accent";

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
        <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName} />
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
```

- [ ] **Step 2: Run lint**

Run:

```powershell
npm run lint
```

Expected: command exits `0`. If lint complains about JSX line length or ordering, fix only `src/components/budget-request-modal.tsx`.

- [ ] **Step 3: Commit modal**

Run:

```powershell
git add -- src/components/budget-request-modal.tsx
git commit -m "feat: add budget request modal"
```

Expected: commit succeeds with only the modal component.

---

### Task 4: Home Integration

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import the modal component**

In `src/app/page.tsx`, add this import near the existing component imports:

```tsx
import { BudgetRequestModal } from "@/components/budget-request-modal";
```

- [ ] **Step 2: Add request kind metadata to service plans**

Update `servicePlans` entries so each plan has a stable `kind`.

Landing plan:

```tsx
{
  kind: "package_landing" as const,
  title: "Landing Page Local",
  price: "R$ 200 a R$ 300",
  description: "Para negócios que precisam de uma página simples, bonita e publicada online.",
  idealFor: "Ideal para quem quer aparecer melhor online e não precisa alterar conteúdo com frequência.",
  deadline: "Prazo estimado: 3 a 7 dias",
  features: [
    "Página única profissional",
    "WhatsApp, Instagram e mapa",
    "Serviços, fotos e texto de apresentação",
    "Publicação online",
    "1 rodada de ajustes antes da publicação final",
  ],
}
```

Editable plan:

```tsx
{
  kind: "package_editable" as const,
  title: "Site com Painel / Cardápio Editável",
  price: "A partir de R$ 500",
  description: "Para negócios que precisam editar produtos, cardápio, informações ou conteúdos sem depender de alterar código.",
  idealFor: "Ideal para quem muda cardápio, produtos, preços ou informações com frequência.",
  deadline: "Prazo estimado: a partir de 7 dias",
  featured: true,
  features: [
    "Painel administrativo",
    "Login e área de edição",
    "Estrutura de produtos, cardápio ou conteúdos",
    "Publicação online",
    "Funcionalidades combinadas por escopo",
  ],
}
```

- [ ] **Step 3: Replace each plan card WhatsApp-only CTA with structured request plus WhatsApp fallback**

Find the `<a href={whatsappBudgetLink}` inside the plan card and replace that CTA block with:

```tsx
<div className="grid gap-3">
  <BudgetRequestModal
    kind={plan.kind}
    label="Solicitar este pacote"
    variant={plan.featured ? "primary" : "outline"}
    packageInfo={{ title: plan.title, priceLabel: plan.price }}
    className="w-full font-semibold"
  />
  <a
    href={whatsappBudgetLink}
    target="_blank"
    rel="noopener noreferrer"
    className={getButtonClasses("ghost", "lg", "w-full font-semibold")}
  >
    <Whatsapp className="mr-3 h-5 w-5" />
    Prefiro conversar no WhatsApp
  </a>
</div>
```

- [ ] **Step 4: Add a discreet custom request CTA after the plan grid**

Immediately after the closing `</div>` for the `servicePlans.map` grid, add:

```tsx
<FadeIn delay={250}>
  <div className="mt-8 rounded-xl border border-border bg-background/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
    <div>
      <h3 className="font-heading text-xl font-bold tracking-tight text-primary">
        Precisa de algo fora dos pacotes?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-secondary">
        Envie uma solicitação personalizada com o que você já sabe. Se preferir conversar primeiro, o WhatsApp continua aberto.
      </p>
    </div>
    <div className="mt-5 grid gap-3 sm:mt-0 sm:min-w-64">
      <BudgetRequestModal
        kind="custom"
        label="Solicitar orçamento personalizado"
        variant="primary"
        className="w-full font-semibold"
      />
      <a
        href={whatsappBudgetLink}
        target="_blank"
        rel="noopener noreferrer"
        className={getButtonClasses("outline", "lg", "w-full font-semibold")}
      >
        <Whatsapp className="mr-3 h-5 w-5" />
        Chamar no WhatsApp
      </a>
    </div>
  </div>
</FadeIn>
```

- [ ] **Step 5: Adjust final contact copy to avoid duplicated pressure**

In the final WhatsApp section, replace the paragraph text with:

```tsx
Se preferir conversar direto, me chame no WhatsApp. Se quiser organizar o pedido antes, use a solicitação nos planos acima.
```

Keep the existing final WhatsApp button and GitHub button.

- [ ] **Step 6: Run lint and build**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit `0`.

- [ ] **Step 7: Commit home integration**

Run:

```powershell
git add -- src/app/page.tsx
git commit -m "feat: add budget request CTAs"
```

Expected: commit succeeds with only `src/app/page.tsx`.

---

### Task 5: Local Smoke Verification

**Files:**
- No source changes unless verification reveals a bug.

- [ ] **Step 1: Start the local server without opening a floating terminal**

Run:

```powershell
$env:DISCORD_BUDGET_WEBHOOK_URL='https://discord.com/api/webhooks/test/test'
Start-Process -WindowStyle Hidden -FilePath "npm" -ArgumentList "run","dev","--","--port","3000" -WorkingDirectory "F:\Projetinhos\Portfolio" -RedirectStandardOutput ".next-budget-dev-3000.log" -RedirectStandardError ".next-budget-dev-3000.err.log"
```

Expected: server starts in the background. If port `3000` is busy, use `3001`.

- [ ] **Step 2: Smoke test validation error**

Run:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/budget-request" -ContentType "application/json" -Body "{}"
```

Expected: HTTP `400` with `ok: false` and validation errors.

- [ ] **Step 3: Smoke test configured endpoint behavior**

Run with a fake webhook:

```powershell
$body = @{
  kind = "package_landing"
  selectedPackage = @{ title = "Landing Page Local"; priceLabel = "R$ 200 a R$ 300" }
  contact = @{ name = "Cliente Teste"; whatsapp = "21999999999"; whatsappConsent = $true }
  project = @{
    mainGoal = "Criar uma página simples para apresentar serviços"
    desiredDeadline = "Sem urgência"
    contentStatus = "Tenho textos e algumas imagens"
    selectedOptions = @("whatsapp", "map")
  }
  metadata = @{ submittedAt = (Get-Date).ToUniversalTime().ToString("o"); sourcePage = "/" }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/budget-request" -ContentType "application/json" -Body $body
```

Expected with fake webhook: HTTP `502` and user-safe message `Não consegui enviar a solicitação agora.` This proves validation passed and outbound webhook failed safely.

- [ ] **Step 4: Browser UI smoke**

Open the site in the in-app browser at:

```txt
http://localhost:3000
```

Check:

- Plan cards still look like portfolio cards, not dashboard cards.
- Each plan has `Solicitar este pacote`.
- WhatsApp fallback remains visible.
- Custom CTA is discreet after the plans.
- Modal opens and advances without normal desktop scroll.
- Pacotes do not ask for faixa de investimento.
- Personalizado asks for faixa de investimento.
- Checkboxes use client language.
- Success/error copy does not show score, complexity, calculation or automatic price.

- [ ] **Step 5: Commit verification fixes if needed**

If verification required source changes, commit only those files:

```powershell
git add -- src/app/page.tsx src/components/budget-request-modal.tsx src/app/api/budget-request/route.ts src/lib/budget-request.ts
git commit -m "fix: polish budget request flow"
```

Expected: commit only if fixes were necessary. If no fixes were necessary, do not create an empty commit.

---

### Task 6: Production Setup Notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a short configuration note**

Add this section near the setup/development instructions in `README.md`:

````md
## Solicitações de orçamento

O formulário de orçamento envia pedidos para um webhook privado do Discord.

Variável necessária:

```txt
DISCORD_BUDGET_WEBHOOK_URL=
```

Essa variável é server-only e não deve usar o prefixo `NEXT_PUBLIC_`.
````

- [ ] **Step 2: Verify docs-only change**

Run:

```powershell
git diff -- README.md
```

Expected: diff shows only the new budget request configuration note.

- [ ] **Step 3: Commit README note**

Run:

```powershell
git add -- README.md
git commit -m "docs: document budget webhook setup"
```

Expected: commit succeeds with only `README.md`.

---

## Final Verification

- [ ] Run:

```powershell
npm run lint
npm run build
```

Expected: both pass.

- [ ] Confirm `git status --short` shows no unexpected source changes. Existing unrelated untracked files, such as `protocolo_vlaeg.md`, must remain untouched unless the user explicitly asks.

- [ ] Confirm the final client-facing flow:
  - Cliente vê portfolio limpo.
  - WhatsApp direto permanece visível.
  - Pacotes usam `Contato → Projeto → Extras opcionais`.
  - Personalizado usa `Contato → Projeto → Escopo → Contexto opcional`.
  - Pacotes não pedem faixa de investimento.
  - Cliente não vê cálculo, pontuação, complexidade ou preço automático.
  - Discord recebe pedido organizado e análise privada.

## Self-Review

Spec coverage:

- Portfolio limpo: Task 4 keeps CTAs inside plans and a discreet custom CTA.
- CTA para modal ou `/contratar`: this plan chooses modal as the first implementation because the user preferred modal without scroll.
- Pacotes short flow: Task 3 implements 3 steps.
- Personalizado full light flow: Task 3 implements 4 steps.
- Checkboxes in client language: Task 1 and Task 3 use the exact labels from the spec.
- No budget range in packages: Task 1 validation and Task 3 UI only require `budgetRange` for `custom`.
- Discord private analysis only: Task 1 formatter and Task 2 route keep analysis server-side.
- WhatsApp visible: Task 4 preserves fallback in plan cards and final contact section.

Placeholder scan:

- No unresolved placeholder markers are present.

Type consistency:

- `BudgetRequestKind`, `ClientFacingOption`, `BudgetRequestPayload`, `validateBudgetRequest`, and `formatDiscordMessage` are defined in Task 1 and consumed consistently in Tasks 2 and 3.
