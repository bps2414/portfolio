import {
  FIELD_LIMITS,
  budgetLeadServerSchema,
  buildLeadPayload,
  type ServerInput,
} from "@/lib/budget-lead";
import { SITE_URL } from "@/config/site";
import { readServerEnv } from "@/lib/server-env";

// -----------------------------------------------------------------------------
// Configuração do rate limit in-memory (Requirement 7.5)
// -----------------------------------------------------------------------------
//
// Limite: 5 requisições por IP em uma janela de 10 minutos. Em deploy
// serverless o contador é por instância — trade-off aceito e documentado em
// SECURITY.md. Para o volume esperado do portfólio é suficiente.

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, RateLimitEntry>();

// Campos aceitos como honeypot no corpo (Requirement 7.4).
// O campo canônico é `website`; `companyWebsite` e `company_site` permanecem
// aceitos por compatibilidade com submissões antigas.
const HONEYPOT_FIELDS = ["website", "companyWebsite", "company_site"] as const;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function jsonResponse(
  body: unknown,
  init?: ResponseInit,
): Response {
  return Response.json(body, init);
}

function methodNotAllowed(): Response {
  return jsonResponse(
    { ok: false, message: "Método não permitido." },
    { status: 405, headers: { Allow: "POST" } },
  );
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return forwardedIp || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();

  // Limpeza preguiçosa para evitar crescimento sem limite do Map.
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries(now);
  }

  const current = rateLimitStore.get(clientIp);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
}

function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = new Set(
    [SITE_URL, process.env.NEXT_PUBLIC_SITE_URL?.trim()]
      .filter((value): value is string => Boolean(value))
      .map((value) => {
        try {
          return new URL(value).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );

  if (process.env.VERCEL_URL) {
    allowedOrigins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const url = new URL(origin);
      const isLocalhost =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]";

      if (isLocalhost && url.protocol === "http:") {
        return true;
      }
    } catch {
      return false;
    }
  }

  return allowedOrigins.has(origin);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFilledHoneypot(body: unknown): boolean {
  if (!isRecord(body)) {
    return false;
  }

  return HONEYPOT_FIELDS.some((field) => {
    const value = body[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

// -----------------------------------------------------------------------------
// Handler principal
// -----------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // 1. Método != POST (tratado pelo runtime via export dedicado; aqui só POST).

  // 2. Content-Type precisa incluir application/json (Requirement 7.2).
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return jsonResponse(
      { ok: false, message: "Content-Type inválido." },
      { status: 415 },
    );
  }

  // 3. Origin presente e não permitida → 403 (Requirement 7.6).
  const origin = request.headers.get("origin");

  if (origin && !isAllowedOrigin(origin)) {
    console.warn("blocked origin", { origin });
    return jsonResponse(
      { ok: false, message: "Origem não permitida." },
      { status: 403 },
    );
  }

  // 4. Rate limit (Requirement 7.5).
  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp)) {
    console.warn("rate limit hit");
    return jsonResponse(
      { ok: false, message: "Tente novamente em instantes." },
      { status: 429 },
    );
  }

  // 5. Content-Length declarado > limite (Requirement 7.3).
  const contentLengthHeader = request.headers.get("content-length");
  const declaredLength = contentLengthHeader
    ? Number.parseInt(contentLengthHeader, 10)
    : NaN;

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > FIELD_LIMITS.bodyBytes
  ) {
    console.warn("payload too large", { size: declaredLength });
    return jsonResponse(
      { ok: false, message: "Payload muito grande." },
      { status: 413 },
    );
  }

  // 6. Ler corpo cru e conferir bytes reais (evita mentiras no header).
  const rawBody = await request.text();
  const actualBytes = new TextEncoder().encode(rawBody).byteLength;

  if (actualBytes > FIELD_LIMITS.bodyBytes) {
    console.warn("payload too large", { size: actualBytes });
    return jsonResponse(
      { ok: false, message: "Payload muito grande." },
      { status: 413 },
    );
  }

  // 7. JSON.parse (Requirement 8.6 — erro genérico de campos obrigatórios).
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.warn("json parse failed");
    return jsonResponse(
      { ok: false, message: "Confira os campos obrigatórios." },
      { status: 400 },
    );
  }

  // 8. Honeypot preenchido → fake-success sem encaminhar (Requirement 7.4).
  if (hasFilledHoneypot(body)) {
    console.info("honeypot triggered");
    return jsonResponse({ ok: true }, { status: 200 });
  }

  // 9. Validação server-side via Zod (Requirements 8.1, 8.4, 8.5).
  const parsed = budgetLeadServerSchema.safeParse(body);

  if (!parsed.success) {
    console.warn("schema validation failed", {
      issues: parsed.error.issues.map((issue) => issue.code),
    });
    return jsonResponse(
      { ok: false, message: "Confira os campos obrigatórios." },
      { status: 400 },
    );
  }

  // 10. Leitura e validação da env (Requirement 5.5).
  const env = readServerEnv();

  if (!env.ok) {
    console.error("env missing", { issues: env.issues });
    return jsonResponse(
      { ok: false, message: "Não consegui processar agora." },
      { status: 500 },
    );
  }

  // 11. Construção do Lead_Payload (Requirement 6.*).
  const server: ServerInput = {
    name: parsed.data.name,
    // whatsapp já foi normalizado para dígitos pelo schema.
    phone: parsed.data.whatsapp,
    businessType: parsed.data.businessType,
    projectType: parsed.data.projectType,
    budget: parsed.data.budget,
    message: parsed.data.message,
    pageUrl: parsed.data.pageUrl,
  };

  const payload = buildLeadPayload({
    server,
    userAgent: request.headers.get("user-agent"),
    pageUrl: server.pageUrl,
    now: new Date(),
  });

  // 12. Fetch ao webhook do n8n com timeout de 8s (Requirement 5.6).
  let webhookResponse: Response;

  try {
    webhookResponse = await fetch(env.data.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Rede, timeout, abort, DNS etc. (Requirement 9.3).
    console.error("n8n network error", {
      projectType: server.projectType,
      budget: server.budget,
      source: "portfolio",
    });
    return jsonResponse(
      { ok: false, message: "Não consegui enviar agora." },
      { status: 502 },
    );
  }

  // Status fora da faixa 200..299 — inclui redirects 3xx (Requirement 9.4).
  if (webhookResponse.status < 200 || webhookResponse.status >= 300) {
    console.error("n8n bad status", {
      status: webhookResponse.status,
      projectType: server.projectType,
      budget: server.budget,
      source: "portfolio",
    });
    return jsonResponse(
      { ok: false, message: "Não consegui enviar agora." },
      { status: 502 },
    );
  }

  // Sucesso (Requirement 9.5).
  console.info("lead forwarded", {
    status: webhookResponse.status,
    projectType: server.projectType,
    budget: server.budget,
    source: "portfolio",
  });
  return jsonResponse({ ok: true }, { status: 200 });
}

export function GET(): Response {
  return methodNotAllowed();
}
