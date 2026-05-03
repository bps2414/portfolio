import { z } from "zod";

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
    desiredDeadline?: string;
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

export type BudgetRequestMetadataInput = {
  submittedAt?: unknown;
  sourcePage?: unknown;
  userAgent?: unknown;
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

const budgetRequestKinds = [
  "package_landing",
  "package_editable",
  "custom",
] as const satisfies readonly BudgetRequestKind[];

export const budgetRequestPackages = {
  package_landing: {
    title: "Landing Page Local",
    priceLabel: "R$ 200 a R$ 300",
  },
  package_editable: {
    title: "Site com Painel / Cardapio Editavel",
    priceLabel: "A partir de R$ 500",
  },
} as const satisfies Record<
  Exclude<BudgetRequestKind, "custom">,
  { title: string; priceLabel: string }
>;

const validClientFacingOptions = new Set<ClientFacingOption>(
  clientFacingOptions.map((option) => option.value),
);

const optionLabels = new Map<ClientFacingOption, string>(
  clientFacingOptions.map((option) => [option.value, option.label]),
);

const clientFacingOptionValues = clientFacingOptions.map(
  (option) => option.value,
) as [ClientFacingOption, ...ClientFacingOption[]];

const optionalStringSchema = z.string().optional();

const budgetRequestInputSchema = z.object({
  kind: z.enum(budgetRequestKinds),
  selectedPackage: z
    .object({
      title: optionalStringSchema,
      priceLabel: optionalStringSchema,
    })
    .optional(),
  contact: z.object({
    name: z.string(),
    whatsapp: z.string(),
    whatsappConsent: z.boolean(),
  }),
  project: z.object({
    businessName: optionalStringSchema,
    currentUrlOrSocial: optionalStringSchema,
    projectType: optionalStringSchema,
    mainGoal: z.string(),
    desiredDeadline: optionalStringSchema,
    contentStatus: optionalStringSchema,
    budgetRange: optionalStringSchema,
    selectedOptions: z.array(z.enum(clientFacingOptionValues)).optional(),
    specificNeeds: optionalStringSchema,
    references: optionalStringSchema,
    approvalContact: optionalStringSchema,
    notes: optionalStringSchema,
  }),
  metadata: z
    .object({
      submittedAt: optionalStringSchema,
      sourcePage: optionalStringSchema,
      userAgent: optionalStringSchema,
    })
    .optional(),
  website: optionalStringSchema,
});

const fieldLimits = {
  short: 160,
  whatsapp: 40,
  urlOrSocial: 200,
  long: 800,
  metadataUserAgent: 300,
  discordField: 240,
  discordLongField: 480,
  discordMessage: 1900,
} as const;

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function normalizeOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined {
  const normalized = normalizeString(value);

  return normalized ? truncateText(normalized, maxLength) : undefined;
}

function normalizeRequiredString(
  value: unknown,
  maxLength: number,
  fieldName: string,
  errors: string[],
): string {
  const normalized = normalizeString(value);

  if (!normalized) {
    return "";
  }

  if (normalized.length > maxLength) {
    errors.push(`${fieldName} deve ter no maximo ${maxLength} caracteres.`);
  }

  return normalized;
}

function normalizeStringByRequirement(
  value: unknown,
  maxLength: number,
  fieldName: string,
  isRequired: boolean,
  errors: string[],
): string | undefined {
  return isRequired
    ? normalizeRequiredString(value, maxLength, fieldName, errors)
    : normalizeOptionalString(value, maxLength);
}

function normalizeBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeKind(value: unknown): BudgetRequestKind | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return budgetRequestKinds.includes(value as BudgetRequestKind)
    ? (value as BudgetRequestKind)
    : undefined;
}

function getCanonicalPackage(kind: BudgetRequestKind) {
  if (kind === "custom") {
    return undefined;
  }

  return budgetRequestPackages[kind];
}

function normalizeSelectedOptions(value: unknown): ClientFacingOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (option): option is ClientFacingOption =>
      typeof option === "string" &&
      validClientFacingOptions.has(option as ClientFacingOption),
  );
}

export function escapeDiscordMarkdown(value: string): string {
  return value.replace(/[\\`*_{}\[\]()#+\-.!|>]/g, "\\$&");
}

export function sanitizeDiscordText(value: string | undefined): string {
  if (!value) {
    return "Não informado";
  }

  const withoutLineBreaks = value.replace(/\s+/g, " ").trim();
  const withoutAutoLinks = withoutLineBreaks.replace(/\bhttps?:\/\//gi, (match) =>
    match.toLowerCase().startsWith("https") ? "hxxps://" : "hxxp://",
  );
  const withoutMentions = withoutAutoLinks
    .replace(/@everyone/gi, "[everyone]")
    .replace(/@here/gi, "[here]")
    .replace(/<@&?\d+>/g, "[mention]")
    .replace(/<#\d+>/g, "[channel]")
    .replace(/@/g, "[at]");

  return escapeDiscordMarkdown(withoutMentions);
}

function formatField(label: string, value: string | undefined): string {
  const maxLength =
    value && value.length > fieldLimits.discordField
      ? fieldLimits.discordLongField
      : fieldLimits.discordField;

  return `**${label}:** ${sanitizeDiscordText(
    value ? truncateText(value, maxLength) : value,
  )}`;
}

function formatOptionLabels(options: ClientFacingOption[]): string {
  if (options.length === 0) {
    return "Não informado";
  }

  return options.map((option) => optionLabels.get(option) ?? option).join(", ");
}

export function validateBudgetRequest(input: unknown): ValidationResult {
  const errors: string[] = [];
  const parsedInput = budgetRequestInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, errors: ["Solicitacao invalida."] };
  }

  const parsed = parsedInput.data;
  const contactInput = parsed.contact;
  const projectInput = parsed.project;
  const metadataInput = parsed.metadata;

  const kind = normalizeKind(parsed.kind);
  const isPackageKind = kind === "package_landing" || kind === "package_editable";
  const isCustomKind = kind === "custom";
  const contact = {
    name: normalizeRequiredString(
      contactInput.name,
      fieldLimits.short,
      "Nome",
      errors,
    ),
    whatsapp: normalizeRequiredString(
      contactInput.whatsapp,
      fieldLimits.whatsapp,
      "WhatsApp",
      errors,
    ),
    whatsappConsent: normalizeBoolean(contactInput.whatsappConsent),
  };
  const project = {
    businessName: normalizeOptionalString(projectInput.businessName, 160),
    currentUrlOrSocial: normalizeOptionalString(
      projectInput.currentUrlOrSocial,
      fieldLimits.urlOrSocial,
    ),
    projectType: normalizeStringByRequirement(
      projectInput.projectType,
      fieldLimits.short,
      "Tipo de projeto",
      isCustomKind,
      errors,
    ),
    mainGoal: normalizeRequiredString(
      projectInput.mainGoal,
      fieldLimits.long,
      "Objetivo principal",
      errors,
    ),
    desiredDeadline: normalizeStringByRequirement(
      projectInput.desiredDeadline,
      fieldLimits.short,
      "Prazo desejado",
      isCustomKind,
      errors,
    ),
    contentStatus: normalizeStringByRequirement(
      projectInput.contentStatus,
      fieldLimits.short,
      "Status do conteudo",
      isPackageKind,
      errors,
    ),
    budgetRange: normalizeStringByRequirement(
      projectInput.budgetRange,
      fieldLimits.short,
      "Faixa de investimento",
      isCustomKind,
      errors,
    ),
    selectedOptions: normalizeSelectedOptions(projectInput.selectedOptions),
    specificNeeds: normalizeOptionalString(
      projectInput.specificNeeds,
      fieldLimits.long,
    ),
    references: normalizeOptionalString(projectInput.references, 800),
    approvalContact: normalizeOptionalString(
      projectInput.approvalContact,
      fieldLimits.short,
    ),
    notes: normalizeOptionalString(projectInput.notes, fieldLimits.long),
  };
  const metadata = normalizeBudgetRequestMetadata(metadataInput);
  const selectedPackage = kind ? getCanonicalPackage(kind) : undefined;

  if (!kind) {
    errors.push("Tipo de solicitacao obrigatorio.");
  }

  if (!contact.name) {
    errors.push("Nome obrigatorio.");
  }

  if (!contact.whatsapp) {
    errors.push("WhatsApp obrigatorio.");
  } else {
    const whatsappDigits = contact.whatsapp.replace(/\D/g, "");

    if (whatsappDigits.length < 10 || whatsappDigits.length > 13) {
      errors.push("WhatsApp deve conter entre 10 e 13 digitos.");
    }
  }

  if (!contact.whatsappConsent) {
    errors.push("Aceite de contato por WhatsApp obrigatorio.");
  }

  if (!project.mainGoal) {
    errors.push("Objetivo principal obrigatorio.");
  }

  if (isCustomKind && !project.desiredDeadline) {
    errors.push("Prazo desejado obrigatório para orçamento personalizado.");
  }

  if (isPackageKind) {
    if (!project.contentStatus) {
      errors.push("Status do conteudo obrigatorio.");
    }
  }

  if (isCustomKind) {
    if (!project.projectType) {
      errors.push("Tipo de projeto obrigatorio.");
    }

    if (!project.budgetRange) {
      errors.push("Faixa de investimento obrigatoria.");
    }

    if (project.selectedOptions.length === 0) {
      errors.push("Selecione pelo menos uma funcionalidade.");
    }
  }

  if (errors.length > 0 || !kind) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    payload: {
      kind,
      selectedPackage,
      contact,
      project,
      metadata,
    },
  };
}

export function getMissingUsefulFields(payload: BudgetRequestPayload): string[] {
  const missingFields: string[] = [];

  if (!payload.project.businessName) {
    missingFields.push("Nome do negocio");
  }

  if (!payload.project.currentUrlOrSocial) {
    missingFields.push("Site ou rede social atual");
  }

  if (!payload.project.specificNeeds) {
    missingFields.push("Necessidades especificas");
  }

  if (!payload.project.references) {
    missingFields.push("Referencias");
  }

  if (!payload.project.approvalContact) {
    missingFields.push("Contato decisor/aprovacao");
  }

  if (!payload.project.notes) {
    missingFields.push("Observacoes adicionais");
  }

  return missingFields;
}

export function getInternalNotes(payload: BudgetRequestPayload): string[] {
  const notes: string[] = [];

  if (payload.kind === "custom") {
    notes.push("Solicitacao personalizada: avaliar escopo antes de responder.");
  } else {
    notes.push("Solicitacao baseada em pacote: confirmar aderencia ao pacote.");
  }

  if (payload.project.selectedOptions.includes("admin_panel")) {
    notes.push("Cliente citou painel de edicao; alinhar rotinas e limites.");
  }

  if (payload.project.selectedOptions.includes("editable_menu_products")) {
    notes.push("Cliente citou cardapio/produtos editaveis; validar volume.");
  }

  if (!payload.project.references) {
    notes.push("Pedir referencias visuais para reduzir retrabalho.");
  }

  if (!payload.project.approvalContact) {
    notes.push("Confirmar quem aprova o projeto antes de fechar proposta.");
  }

  return notes;
}

export function normalizeBudgetRequestMetadata(
  metadata?: BudgetRequestMetadataInput,
): BudgetRequestPayload["metadata"] {
  return {
    submittedAt:
      normalizeOptionalString(metadata?.submittedAt, fieldLimits.short) ??
      new Date().toISOString(),
    sourcePage:
      normalizeOptionalString(metadata?.sourcePage, fieldLimits.urlOrSocial) ??
      "server",
    userAgent: normalizeOptionalString(
      metadata?.userAgent,
      fieldLimits.metadataUserAgent,
    ),
  };
}

export function withBudgetRequestMetadata(
  payload: BudgetRequestPayload,
  metadata?: BudgetRequestMetadataInput,
): BudgetRequestPayload {
  return {
    ...payload,
    metadata: normalizeBudgetRequestMetadata({
      ...payload.metadata,
      ...metadata,
    }),
  };
}

function limitDiscordMessage(message: string): string {
  if (message.length <= fieldLimits.discordMessage) {
    return message;
  }

  const suffix = "\n\n[Mensagem truncada para envio ao Discord]";
  return `${message.slice(0, fieldLimits.discordMessage - suffix.length)}${suffix}`;
}

export function formatDiscordMessage(payload: BudgetRequestPayload): string {
  const isPackageKind =
    payload.kind === "package_landing" || payload.kind === "package_editable";
  const packageLines = isPackageKind && payload.selectedPackage
    ? [
        formatField("Pacote", payload.selectedPackage.title),
        formatField("Referencia do pacote", payload.selectedPackage.priceLabel),
      ]
    : [];
  const budgetRangeLabel =
    payload.kind === "custom"
      ? payload.project.budgetRange
      : "Não perguntada nos pacotes";
  const deadlineLabel =
    payload.kind === "custom"
      ? payload.project.desiredDeadline
      : "Definido pelo pacote";
  const missingUsefulFields = getMissingUsefulFields(payload);
  const internalNotes = getInternalNotes(payload);

  const message = [
    "## Nova solicitacao de orcamento",
    "",
    "**Cliente**",
    formatField("Nome", payload.contact.name),
    formatField("WhatsApp", payload.contact.whatsapp),
    `**Aceitou contato por WhatsApp:** ${
      payload.contact.whatsappConsent ? "Sim" : "Nao"
    }`,
    formatField("Consentimento registrado em", payload.metadata.submittedAt),
    "",
    "**Projeto**",
    formatField("Tipo de solicitacao", payload.kind),
    ...packageLines,
    formatField("Negocio", payload.project.businessName),
    formatField("Site/rede atual", payload.project.currentUrlOrSocial),
    formatField("Tipo de projeto", payload.project.projectType),
    formatField("Objetivo principal", payload.project.mainGoal),
    formatField("Prazo desejado", deadlineLabel),
    formatField("Status do conteúdo", payload.project.contentStatus),
    formatField("Faixa informada", budgetRangeLabel),
    `**Funcionalidades desejadas:** ${formatOptionLabels(
      payload.project.selectedOptions,
    )}`,
    formatField("Necessidades especificas", payload.project.specificNeeds),
    formatField("Referencias", payload.project.references),
    formatField("Contato de aprovacao", payload.project.approvalContact),
    formatField("Observacoes", payload.project.notes),
    "",
    "**Analise privada**",
    `**Campos uteis faltando:** ${
      missingUsefulFields.length > 0
        ? missingUsefulFields.join(", ")
        : "Nenhum campo importante faltando"
    }`,
    ...internalNotes.map((note) => `- ${note}`),
    "",
    "**Origem**",
    formatField("Pagina", payload.metadata.sourcePage),
    formatField("Enviado em", payload.metadata.submittedAt),
    formatField("User agent", payload.metadata.userAgent),
  ].join("\n");

  return limitDiscordMessage(message);
}
