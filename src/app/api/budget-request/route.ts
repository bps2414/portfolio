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

function isRateLimited(clientIp: string): boolean {
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

  const webhookUrl = process.env.DISCORD_BUDGET_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("DISCORD_BUDGET_WEBHOOK_URL ausente");
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
