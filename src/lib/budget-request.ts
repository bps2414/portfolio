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
  { value: "services_prices", label: "Servicos/precos" },
  { value: "testimonials", label: "Depoimentos" },
  { value: "form", label: "Formulario" },
  { value: "editable_menu_products", label: "Cardapio/produtos editaveis" },
  { value: "admin_panel", label: "Painel para editar depois" },
  { value: "not_sure", label: "Ainda nao sei" },
];

const budgetRequestKinds: BudgetRequestKind[] = [
  "package_landing",
  "package_editable",
  "custom",
];

const validClientFacingOptions = new Set<ClientFacingOption>(
  clientFacingOptions.map((option) => option.value),
);

const optionLabels = new Map<ClientFacingOption, string>(
  clientFacingOptions.map((option) => [option.value, option.label]),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
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

function formatField(label: string, value: string | undefined): string {
  return `**${label}:** ${value ?? "Nao informado"}`;
}

function formatOptionLabels(options: ClientFacingOption[]): string {
  if (options.length === 0) {
    return "Nao informado";
  }

  return options.map((option) => optionLabels.get(option) ?? option).join(", ");
}

export function validateBudgetRequest(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["Solicitacao invalida."] };
  }

  const contactInput = isRecord(input.contact) ? input.contact : {};
  const projectInput = isRecord(input.project) ? input.project : {};
  const metadataInput = isRecord(input.metadata) ? input.metadata : {};
  const selectedPackageInput = isRecord(input.selectedPackage)
    ? input.selectedPackage
    : undefined;

  const kind = normalizeKind(input.kind);
  const contact = {
    name: normalizeString(contactInput.name) ?? "",
    whatsapp: normalizeString(contactInput.whatsapp) ?? "",
    whatsappConsent: normalizeBoolean(contactInput.whatsappConsent),
  };
  const project = {
    businessName: normalizeString(projectInput.businessName),
    currentUrlOrSocial: normalizeString(projectInput.currentUrlOrSocial),
    projectType: normalizeString(projectInput.projectType),
    mainGoal: normalizeString(projectInput.mainGoal) ?? "",
    desiredDeadline: normalizeString(projectInput.desiredDeadline) ?? "",
    contentStatus: normalizeString(projectInput.contentStatus),
    budgetRange: normalizeString(projectInput.budgetRange),
    selectedOptions: normalizeSelectedOptions(projectInput.selectedOptions),
    specificNeeds: normalizeString(projectInput.specificNeeds),
    references: normalizeString(projectInput.references),
    approvalContact: normalizeString(projectInput.approvalContact),
    notes: normalizeString(projectInput.notes),
  };
  const metadata = {
    submittedAt:
      normalizeString(metadataInput.submittedAt) ?? new Date().toISOString(),
    sourcePage: normalizeString(metadataInput.sourcePage) ?? "unknown",
    userAgent: normalizeString(metadataInput.userAgent),
  };
  const selectedPackage = selectedPackageInput
    ? {
        title: normalizeString(selectedPackageInput.title) ?? "",
        priceLabel: normalizeString(selectedPackageInput.priceLabel) ?? "",
      }
    : undefined;

  if (!kind) {
    errors.push("Tipo de solicitacao obrigatorio.");
  }

  if (!contact.name) {
    errors.push("Nome obrigatorio.");
  }

  if (!contact.whatsapp) {
    errors.push("WhatsApp obrigatorio.");
  }

  if (!contact.whatsappConsent) {
    errors.push("Aceite de contato por WhatsApp obrigatorio.");
  }

  if (!project.mainGoal) {
    errors.push("Objetivo principal obrigatorio.");
  }

  if (!project.desiredDeadline) {
    errors.push("Prazo desejado obrigatorio.");
  }

  if (kind === "package_landing" || kind === "package_editable") {
    if (!selectedPackage?.title) {
      errors.push("Titulo do pacote obrigatorio.");
    }

    if (!selectedPackage?.priceLabel) {
      errors.push("Faixa do pacote obrigatoria.");
    }

    if (!project.contentStatus) {
      errors.push("Status do conteudo obrigatorio.");
    }
  }

  if (kind === "custom") {
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

export function formatDiscordMessage(payload: BudgetRequestPayload): string {
  const packageLines = payload.selectedPackage
    ? [
        formatField("Pacote", payload.selectedPackage.title),
        formatField("Referencia do pacote", payload.selectedPackage.priceLabel),
      ]
    : [];
  const missingUsefulFields = getMissingUsefulFields(payload);
  const internalNotes = getInternalNotes(payload);

  return [
    "## Nova solicitacao de orcamento",
    "",
    "**Cliente**",
    formatField("Nome", payload.contact.name),
    formatField("WhatsApp", payload.contact.whatsapp),
    `**Aceitou contato por WhatsApp:** ${
      payload.contact.whatsappConsent ? "Sim" : "Nao"
    }`,
    "",
    "**Projeto**",
    formatField("Tipo de solicitacao", payload.kind),
    ...packageLines,
    formatField("Negocio", payload.project.businessName),
    formatField("Site/rede atual", payload.project.currentUrlOrSocial),
    formatField("Tipo de projeto", payload.project.projectType),
    formatField("Objetivo principal", payload.project.mainGoal),
    formatField("Prazo desejado", payload.project.desiredDeadline),
    formatField("Status do conteudo", payload.project.contentStatus),
    formatField("Faixa informada", payload.project.budgetRange),
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
}
