import {
  formatDiscordMessage,
  validateBudgetRequest,
  withBudgetRequestMetadata,
} from "@/lib/budget-request";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Payload invalido." },
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
    return Response.json(
      { ok: false, message: "Canal de orcamento nao configurado." },
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
