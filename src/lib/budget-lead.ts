// Modulo puro com os tipos, constantes, helpers e schemas Zod do fluxo de
// solicitacao de orcamento. Nao le `process.env` nem depende de objetos
// globais do navegador; pode ser importado tanto pelo cliente quanto pelo
// servidor.

import { z } from "zod";

// -----------------------------------------------------------------------------
// Tipos de dominio
// -----------------------------------------------------------------------------

/**
 * Valores fechados do campo "Tipo de projeto desejado" (Requirement 2.3).
 */
export type ProjectTypeValue =
    | "landing_page"
    | "institutional_site"
    | "digital_menu"
    | "scheduling"
    | "simple_system"
    | "other";

/**
 * Valores fechados do campo "Orcamento aproximado" (Requirement 2.4).
 *
 * A string vazia representa "nao informado" (campo opcional) e so aparece no
 * tipo porque o formulario inicializa o select sem selecao.
 */
export type BudgetValue =
    | ""
    | "up_to_300"
    | "300_to_600"
    | "600_to_1000"
    | "unsure";

/**
 * Estado mantido em memoria pelo `Budget_Form` enquanto o visitante digita.
 */
export type FormValues = {
    name: string;
    /** Valor com mascara visual aplicada (cliente). */
    whatsapp: string;
    businessType: string;
    /** Vazio enquanto o visitante ainda nao escolheu uma opcao. */
    projectType: ProjectTypeValue | "";
    budget: BudgetValue;
    message: string;
    /** Honeypot: preenchido apenas por bots. */
    website: string;
};

/**
 * Entrada ja validada pelo schema server-side (truncada e sanitizada).
 */
export type ServerInput = {
    name: string;
    /** So digitos, 10..13 caracteres (Requirement 3.3). */
    phone: string;
    businessType: string;
    projectType: ProjectTypeValue;
    /** "" quando nao informado (Requirement 6.6). */
    budget: BudgetValue;
    /** "" quando nao informado (Requirement 6.7). */
    message: string;
    /** <= 500 caracteres (Requirement 6.8). */
    pageUrl: string;
    /** Honeypot, opcional. */
    website?: string;
};

/**
 * Payload canonico encaminhado ao webhook do n8n (Requirement 6.1).
 */
export type LeadPayload = {
    source: "portfolio";
    name: string;
    phone: string;
    businessType: string;
    projectType: ProjectTypeValue;
    budget: BudgetValue;
    message: string;
    pageUrl: string;
    /** ISO 8601 UTC gerada no servidor no momento do encaminhamento. */
    createdAt: string;
    /** <= 300 caracteres; "" quando o header esta ausente (Requirement 6.9). */
    userAgent: string;
    metadata: { site: "portfolio"; form: "lead-request" };
};

/**
 * Contrato de resposta da rota interna `POST /api/budget-request`.
 */
export type ApiResponse =
    | { ok: true }
    | { ok: false; message: string };

/**
 * Estado do ciclo de submissao do formulario.
 */
export type SubmissionState = "idle" | "submitting" | "success" | "error";

// -----------------------------------------------------------------------------
// Opcoes fechadas exibidas na UI
// -----------------------------------------------------------------------------

/**
 * Opcoes do select "Tipo de projeto desejado" (Requirement 2.3).
 *
 * A ordem aqui define a ordem exibida ao visitante.
 */
export const PROJECT_TYPE_OPTIONS = [
    { value: "landing_page", label: "Landing page" },
    { value: "institutional_site", label: "Site institucional" },
    { value: "digital_menu", label: "Cardápio digital" },
    { value: "scheduling", label: "Agendamento" },
    { value: "simple_system", label: "Sistema simples" },
    { value: "other", label: "Outro" },
] as const satisfies readonly { value: ProjectTypeValue; label: string }[];

/**
 * Opcoes do select "Orcamento aproximado" (Requirement 2.4).
 *
 * A string vazia NAO esta aqui: ela e representada pela ausencia de selecao
 * no componente e tratada como opcional nos schemas (Requirement 6.6).
 */
export const BUDGET_OPTIONS = [
    { value: "up_to_300", label: "Até R$300" },
    { value: "300_to_600", label: "R$300 a R$600" },
    { value: "600_to_1000", label: "R$600 a R$1000" },
    { value: "unsure", label: "Ainda não sei" },
] as const satisfies readonly {
    value: Exclude<BudgetValue, "">;
    label: string;
}[];

/**
 * Valores validos do campo projectType, derivados de `PROJECT_TYPE_OPTIONS`.
 */
export const PROJECT_TYPE_VALUES: readonly ProjectTypeValue[] =
    PROJECT_TYPE_OPTIONS.map((option) => option.value);

/**
 * Valores validos nao vazios do campo budget, derivados de `BUDGET_OPTIONS`.
 *
 * A string vazia nao faz parte desta constante; ela e aceita separadamente
 * pelos schemas como representacao de "nao informado".
 */
export const BUDGET_VALUES: readonly Exclude<BudgetValue, "">[] =
    BUDGET_OPTIONS.map((option) => option.value);

// -----------------------------------------------------------------------------
// Limites de tamanho
// -----------------------------------------------------------------------------

/**
 * Limites aplicados aos campos do `Lead_Payload` (Requirements 6.8, 6.9, 8.2,
 * 8.3) e ao tamanho total do corpo da requisicao (Requirement 7.3).
 *
 * `phoneDigitsMin` e `phoneDigitsMax` definem a faixa aceita apos normalizar
 * o WhatsApp para apenas digitos (Requirement 3.3).
 */
export const FIELD_LIMITS = {
    name: 160,
    businessType: 160,
    projectType: 160,
    phoneDigitsMin: 10,
    phoneDigitsMax: 13,
    message: 1000,
    pageUrl: 500,
    userAgent: 300,
    bodyBytes: 16_384,
} as const;
// -----------------------------------------------------------------------------
// Helpers puros de normalizacao e sanitizacao
// -----------------------------------------------------------------------------

/**
 * Normaliza um WhatsApp BR removendo todos os caracteres nao-digitos.
 *
 * Retorna a string apenas com digitos quando o comprimento resultante esta
 * dentro da faixa aceita (`FIELD_LIMITS.phoneDigitsMin..phoneDigitsMax`).
 * Fora dessa faixa, retorna `""` para sinalizar invalidade ao chamador; os
 * schemas Zod (task 2.3) fazem a rejeicao oficial com mensagem de erro.
 *
 * @param raw - Texto digitado pelo visitante, potencialmente com mascara.
 * @returns String apenas com digitos, ou `""` quando fora da faixa valida.
 *
 * Validates: Requirement 3.2
 */
export function normalizeBrPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (
        digits.length < FIELD_LIMITS.phoneDigitsMin ||
        digits.length > FIELD_LIMITS.phoneDigitsMax
    ) {
        return "";
    }
    return digits;
}

/**
 * Aplica mascara visual BR a um WhatsApp enquanto o visitante digita.
 *
 * Considera no maximo 11 digitos (DDD + celular de 9 digitos ou fixo de 8)
 * e cresce progressivamente conforme o usuario digita. O resultado contem
 * apenas caracteres do conjunto `{ '(', ')', ' ', '-', '0'..'9' }`.
 *
 * @param raw - Texto atual do input (pode conter mascara parcial).
 * @returns Texto formatado para exibicao.
 *
 * Validates: Requirement 3.1
 */
export function maskBrPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) {
        return "";
    }
    if (digits.length <= 2) {
        return `(${digits}`;
    }
    if (digits.length <= 6) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Corta uma string em `maxLength` caracteres sem adicionar reticencias.
 *
 * O corte e duro: quando o comprimento original ultrapassa `maxLength`, o
 * excedente e descartado silenciosamente. Valores dentro do limite sao
 * retornados inalterados.
 *
 * @param value - Texto a truncar.
 * @param maxLength - Comprimento maximo permitido (nao negativo).
 * @returns Texto com `length <= maxLength`.
 *
 * Validates: Requirement 8.7
 */
export function truncate(value: string, maxLength: number): string {
    if (value.length > maxLength) {
        return value.slice(0, maxLength);
    }
    return value;
}

/**
 * Remove caracteres de controle C0 exceto os separadores permitidos em texto.
 *
 * Tira todos os bytes em `U+0000..U+001F` salvo `\t` (`U+0009`), `\n`
 * (`U+000A`) e `\r` (`U+000D`), que sao preservados para manter quebras de
 * linha e tabulacoes digitadas pelo visitante.
 *
 * @param value - Texto potencialmente contendo caracteres de controle.
 * @returns Texto sem caracteres de controle banidos.
 *
 * Validates: Requirement 8.7
 */
export function stripControlChars(value: string): string {
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

// -----------------------------------------------------------------------------
// Schemas Zod (Zod v4)
// -----------------------------------------------------------------------------

/**
 * Schema client-side do `Budget_Form`.
 *
 * Valida somente o que o Requirement 2 exige para habilitar o submit: campos
 * obrigatorios preenchidos, telefone com 10 a 13 digitos apos normalizacao
 * e mensagem dentro do limite. Mensagens em pt-BR com acentuacao.
 *
 * O campo `whatsapp` aceita a string com mascara digitada pelo visitante e
 * extrai apenas os digitos via `.transform(...).pipe(...)`. O campo `budget`
 * aceita tambem a string vazia para representar "nao informado".
 *
 * Validates: Requirements 2.5, 2.6, 2.7, 2.8, 2.9, 3.3
 */
export const budgetFormClientSchema = z.object({
    name: z.string().trim().min(2, "Informe seu nome."),
    whatsapp: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .pipe(
            z
                .string()
                .min(FIELD_LIMITS.phoneDigitsMin, "Telefone inválido.")
                .max(FIELD_LIMITS.phoneDigitsMax, "Telefone inválido."),
        ),
    businessType: z.string().trim().min(1, "Informe o tipo de negócio."),
    projectType: z.enum(PROJECT_TYPE_VALUES, {
        message: "Selecione um tipo de projeto.",
    }),
    budget: z
        .union([z.literal(""), z.enum(BUDGET_VALUES)])
        .default(""),
    message: z
        .string()
        .max(
            FIELD_LIMITS.message,
            "Mensagem muito longa (máx. 1000 caracteres).",
        )
        .default(""),
    website: z.string().default(""),
});

/**
 * Schema server-side da rota `POST /api/budget-request`.
 *
 * Revalida o corpo da requisicao como defesa em profundidade (Requirement 8.1)
 * e normaliza os campos de texto antes da construcao do `Lead_Payload`: cada
 * `.transform` aplica `stripControlChars` ANTES de `truncate`, pois o corte
 * trabalha com o comprimento final em caracteres (Requirement 8.7, 8.2, 8.3).
 *
 * O campo `whatsapp` recebe o valor como o cliente enviou (possivelmente com
 * mascara) e e normalizado para apenas digitos; a rota fara o mapeamento de
 * `whatsapp` para `phone` ao construir o `Lead_Payload` (Requirement 6.5).
 *
 * Validates: Requirements 8.1, 8.4, 8.5
 */
export const budgetLeadServerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Nome obrigatório.")
        .transform((v) =>
            truncate(stripControlChars(v), FIELD_LIMITS.name),
        ),
    whatsapp: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .pipe(
            z
                .string()
                .min(FIELD_LIMITS.phoneDigitsMin, "Telefone inválido.")
                .max(FIELD_LIMITS.phoneDigitsMax, "Telefone inválido."),
        ),
    businessType: z
        .string()
        .trim()
        .min(1, "Tipo de negócio obrigatório.")
        .transform((v) =>
            truncate(stripControlChars(v), FIELD_LIMITS.businessType),
        ),
    projectType: z.enum(PROJECT_TYPE_VALUES, {
        message: "Tipo de projeto inválido.",
    }),
    budget: z
        .union([z.literal(""), z.enum(BUDGET_VALUES)])
        .default(""),
    message: z
        .string()
        .max(FIELD_LIMITS.message, "Mensagem muito longa.")
        .default("")
        .transform((v) =>
            truncate(stripControlChars(v), FIELD_LIMITS.message),
        ),
    pageUrl: z
        .string()
        .default("")
        .transform((v) =>
            truncate(stripControlChars(v), FIELD_LIMITS.pageUrl),
        ),
    website: z.string().default(""),
});

// -----------------------------------------------------------------------------
// Construcao do Lead_Payload
// -----------------------------------------------------------------------------

/**
 * Constroi o `Lead_Payload` canonico a ser encaminhado ao webhook do n8n.
 *
 * Funcao pura: nao le `process.env`, nao faz I/O, nao gera numeros aleatorios
 * e nao realiza chamadas de rede. A data corrente e injetada via `input.now`
 * para facilitar testes determinísticos.
 *
 * O objeto retornado preserva a ordem canonica das chaves definida no
 * Requirement 6.1 (`source`, `name`, `phone`, `businessType`, `projectType`,
 * `budget`, `message`, `pageUrl`, `createdAt`, `userAgent`, `metadata`). As
 * constantes `source` e `metadata` sao literais fixos (Requirements 6.2, 6.3).
 *
 * Os campos de texto sao reforcados via `truncate(stripControlChars(...))`
 * mesmo quando ja vieram normalizados do schema server-side, garantindo a
 * invariante dos limites (Property 5 do design) mesmo diante de chamadas
 * diretas da rota que porventura ignorem o schema.
 *
 * @param input.server - Entrada ja validada por `budgetLeadServerSchema`.
 * @param input.userAgent - Valor bruto do header `user-agent` (ou `null`).
 * @param input.pageUrl - URL da pagina onde o visitante submeteu o formulario.
 * @param input.now - Data corrente injetada pelo chamador.
 * @returns `Lead_Payload` pronto para ser serializado em JSON.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */
export function buildLeadPayload(input: {
    server: ServerInput;
    userAgent: string | null;
    pageUrl: string;
    now: Date;
}): LeadPayload {
    const { server, userAgent, pageUrl, now } = input;

    // `userAgent` ausente ou so-espacos vira string vazia (Requirement 6.9).
    const normalizedUserAgent =
        userAgent === null || userAgent.trim().length === 0
            ? ""
            : truncate(
                stripControlChars(userAgent),
                FIELD_LIMITS.userAgent,
            );

    return {
        source: "portfolio",
        name: truncate(stripControlChars(server.name), FIELD_LIMITS.name),
        phone: truncate(server.phone, FIELD_LIMITS.phoneDigitsMax),
        businessType: truncate(
            stripControlChars(server.businessType),
            FIELD_LIMITS.businessType,
        ),
        projectType: truncate(
            stripControlChars(server.projectType),
            FIELD_LIMITS.projectType,
        ) as ProjectTypeValue,
        budget: server.budget,
        message: truncate(
            stripControlChars(server.message),
            FIELD_LIMITS.message,
        ),
        pageUrl: truncate(
            stripControlChars(pageUrl),
            FIELD_LIMITS.pageUrl,
        ),
        createdAt: now.toISOString(),
        userAgent: normalizedUserAgent,
        metadata: { site: "portfolio", form: "lead-request" },
    };
}
