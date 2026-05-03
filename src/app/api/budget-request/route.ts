import {
  formatDiscordMessage,
  validateBudgetRequest,
  withBudgetRequestMetadata,
} from "@/lib/budget-request";
import { SITE_URL } from "@/config/site";
import { readServerEnv } from "@/lib/server-env";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};
type JsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; status: number; message: string };

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 3;
const maxPayloadBytes = 16_384;
const rateLimitStore = new Map<string, RateLimitEntry>();
const honeypotFields = ["website", "companyWebsite", "company_site"];

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return forwardedIp || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function cleanupExpiredEntries() {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function methodNotAllowed() {
  return Response.json(
    { ok: false, message: "Metodo nao permitido." },
    { status: 405, headers: { Allow: "POST" } },
  );
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

async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );

  if (Number.isFinite(contentLength) && contentLength > maxPayloadBytes) {
    return { ok: false, status: 413, message: "Payload muito grande." };
  }

  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).byteLength > maxPayloadBytes) {
    return { ok: false, status: 413, message: "Payload muito grande." };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) };
  } catch {
    return { ok: false, status: 400, message: "Payload invalido." };
  }
}

function isRateLimited(clientIp: string): boolean {
  if (rateLimitStore.size > 1000) {
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const current = rateLimitStore.get(clientIp);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return false;
  }

  if (current.count >= rateLimitMaxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFilledHoneypot(body: unknown): boolean {
  if (!isRecord(body)) {
    return false;
  }

  // Campo invisivel anti-bot: visitante real nao deve preencher.
  return honeypotFields.some((field) => {
    const value = body[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export async function POST(request: Request) {
  // Exige JSON para reduzir abuso via forms HTML simples.
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return Response.json(
      { ok: false, message: "Content-Type invalido." },
      { status: 415 },
    );
  }

  // Confere Origin quando o navegador envia o header.
  const origin = request.headers.get("origin");

  if (origin && !isAllowedOrigin(origin)) {
    return Response.json(
      { ok: false, message: "Origem nao permitida." },
      { status: 403 },
    );
  }

  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp)) {
    return Response.json(
      { ok: false, message: "Tente novamente em instantes." },
      { status: 429 },
    );
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.ok) {
    return Response.json(
      { ok: false, message: bodyResult.message },
      { status: bodyResult.status },
    );
  }

  const body = bodyResult.body;

  if (hasFilledHoneypot(body)) {
    return Response.json(
      { ok: false, message: "Nao foi possivel validar a solicitacao." },
      { status: 400 },
    );
  }

  const validation = validateBudgetRequest(body);

  if (!validation.ok) {
    return Response.json(
      { ok: false, message: "Confira os campos obrigatorios." },
      { status: 400 },
    );
  }

  const env = readServerEnv();

  if (!env.ok) {
    console.error("DISCORD_BUDGET_WEBHOOK_URL invalida ou ausente");
    return Response.json(
      { ok: false, message: "Nao consegui processar a solicitacao agora." },
      { status: 500 },
    );
  }

  const payload = withBudgetRequestMetadata(validation.payload, {
    submittedAt: new Date().toISOString(),
    sourcePage: new URL(request.url).pathname,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  let discordResponse: Response;

  try {
    discordResponse = await fetch(env.data.DISCORD_BUDGET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: formatDiscordMessage(payload),
        allowed_mentions: { parse: [] },
      }),
    });
  } catch {
    return Response.json(
      { ok: false, message: "Nao consegui enviar a solicitacao agora." },
      { status: 502 },
    );
  }

  if (!discordResponse.ok) {
    return Response.json(
      { ok: false, message: "Nao consegui enviar a solicitacao agora." },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    message:
      "Solicitacao recebida. Vou analisar com calma e entro em contato pelo WhatsApp informado.",
  });
}

export function GET() {
  return methodNotAllowed();
}
