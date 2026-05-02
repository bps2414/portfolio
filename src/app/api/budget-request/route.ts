import {
  formatDiscordMessage,
  validateBudgetRequest,
  withBudgetRequestMetadata,
} from "@/lib/budget-request";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 3;
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
  // SEC-005: reject oversized payloads early
  const contentLength = parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );

  if (contentLength > 16_384) {
    return Response.json(
      { ok: false, message: "Payload muito grande." },
      { status: 413 },
    );
  }

  // SEC-001: require application/json to block CSRF via HTML forms
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return Response.json(
      { ok: false, message: "Content-Type invalido." },
      { status: 415 },
    );
  }

  // SEC-012: verify origin to prevent cross-site request forgery
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set(
    [
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://bps2414.vercel.app",
    ].filter(Boolean),
  );

  if (origin && !allowedOrigins.has(origin)) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Payload invalido." },
      { status: 400 },
    );
  }

  if (hasFilledHoneypot(body)) {
    return Response.json(
      { ok: false, message: "Nao foi possivel validar a solicitacao." },
      { status: 400 },
    );
  }

  const validation = validateBudgetRequest(body);

  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        message: "Confira os campos obrigatorios.",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  // SEC-006: validate webhook URL points to Discord
  const webhookUrl = process.env.DISCORD_BUDGET_WEBHOOK_URL;

  if (
    !webhookUrl ||
    (!webhookUrl.startsWith("https://discord.com/api/webhooks/") &&
      !webhookUrl.startsWith("https://discordapp.com/api/webhooks/"))
  ) {
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
    discordResponse = await fetch(webhookUrl, {
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
