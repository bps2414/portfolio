import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const fakeWebhookUrl = "https://discord.com/api/webhooks/test-id/test-token";

function validBody() {
  return {
    kind: "package_landing",
    selectedPackage: {
      title: "Landing Page Local",
      priceLabel: "R$ 200 a R$ 300",
    },
    contact: {
      name: "Cliente Teste",
      whatsapp: "(21) 98778-3382",
      whatsappConsent: true,
    },
    project: {
      mainGoal: "Quero uma pagina clara para meu negocio.",
      contentStatus: "Tenho logo e textos iniciais.",
      selectedOptions: ["whatsapp"],
    },
  };
}

function makeRequest(body: unknown, headers: HeadersInit = {}) {
  const mergedHeaders = new Headers({
    "content-type": "application/json",
    origin: "https://bps2414.vercel.app",
    "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
    ...headers,
  });

  return new Request("https://bps2414.vercel.app/api/budget-request", {
    method: "POST",
    headers: mergedHeaders,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function getDiscordPayload() {
  const fetchMock = vi.mocked(fetch);
  const body = fetchMock.mock.calls[0]?.[1]?.body;
  expect(typeof body).toBe("string");

  return JSON.parse(body as string) as {
    content: string;
    allowed_mentions?: { parse?: string[] };
  };
}

describe("/api/budget-request", () => {
  beforeEach(() => {
    process.env.DISCORD_BUDGET_WEBHOOK_URL = fakeWebhookUrl;
    process.env.NEXT_PUBLIC_SITE_URL = "https://bps2414.vercel.app";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.DISCORD_BUDGET_WEBHOOK_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("bloqueia metodo HTTP errado", async () => {
    const response = GET();

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("POST");
  });

  it("rejeita payload invalido sem expor detalhes internos", async () => {
    const response = await POST(makeRequest({ kind: "custom" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      ok: false,
      message: "Confira os campos obrigatorios.",
    });
  });

  it("rejeita payload gigante antes de enviar webhook", async () => {
    const response = await POST(
      makeRequest("{}", {
        "content-length": "20000",
      }),
    );

    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("envia formulario valido para o Discord", async () => {
    const response = await POST(makeRequest(validBody()));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("neutraliza mentions e links no Discord", async () => {
    const body = validBody();
    body.project.mainGoal = "@everyone veja https://evil.example agora";

    const response = await POST(makeRequest(body));
    const discordPayload = getDiscordPayload();

    expect(response.status).toBe(200);
    expect(discordPayload.content).not.toContain("@everyone");
    expect(discordPayload.content).not.toContain("https://");
    expect(discordPayload.allowed_mentions).toEqual({ parse: [] });
  });

  it("ignora pacote e preco manipulados pelo frontend", async () => {
    const body = validBody();
    body.selectedPackage = {
      title: "Pacote falso",
      priceLabel: "R$ 1",
    };

    const response = await POST(makeRequest(body));
    const discordPayload = getDiscordPayload();

    expect(response.status).toBe(200);
    expect(discordPayload.content).toContain("Landing Page Local");
    expect(discordPayload.content).toContain("R$ 200 a R$ 300");
    expect(discordPayload.content).not.toContain("Pacote falso");
    expect(discordPayload.content).not.toContain("R$ 1");
  });
});
