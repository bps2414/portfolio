const BASE_URL = normalizeBaseUrl(process.env.BASE_URL || "http://localhost:3000");
const FORBIDDEN_HOSTS = new Set(
  (process.env.SEO_FORBIDDEN_HOSTS || "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
);
const CHECK_SITEMAP_URLS = process.env.CHECK_SITEMAP_URLS === "1";

const failures = [];

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function endpointUrl(pathname) {
  return `${BASE_URL}${pathname}`;
}

async function fetchEndpoint(pathname) {
  return fetch(endpointUrl(pathname), {
    redirect: "manual",
    headers: {
      "User-Agent": "SEOValidator/1.0",
    },
  });
}

async function readEndpoint(pathname) {
  const response = await fetchEndpoint(pathname);
  const body = await response.text();
  const location = response.headers.get("location");

  assert(response.status === 200, `${pathname} retornou status ${response.status}.`);
  assert(!location, `${pathname} retornou redirect para ${location}.`);
  assert(
    response.status < 300 || response.status >= 400,
    `${pathname} nao deve redirecionar.`,
  );

  return { response, body };
}

function getContentType(response) {
  return response.headers.get("content-type")?.toLowerCase() || "";
}

function decodeXmlEntity(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) =>
    decodeXmlEntity(match[1].trim()),
  );
}

function extractRobotsSitemaps(robots) {
  return robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^sitemap:/i.test(line))
    .map((line) => line.replace(/^sitemap:\s*/i, "").trim())
    .filter(Boolean);
}

function isForbiddenHost(hostname) {
  const host = hostname.toLowerCase();
  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host === "::1";
  const isVercelPreview =
    host.endsWith(".vercel.app") &&
    (host.includes("--") || host.includes("-git-") || host.includes("-preview-"));

  return isLocalhost || isVercelPreview || FORBIDDEN_HOSTS.has(host);
}

async function checkSitemapUrls(locs) {
  for (const loc of locs) {
    const response = await fetch(loc, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": "SEOValidator/1.0",
      },
    }).catch(() => null);

    if (!response) {
      fail(`${loc} nao respondeu ao HEAD.`);
      continue;
    }

    if (response.status === 405) {
      const getResponse = await fetch(loc, {
        redirect: "manual",
        headers: {
          "User-Agent": "SEOValidator/1.0",
        },
      }).catch(() => null);

      assert(getResponse?.status === 200, `${loc} retornou status ${getResponse?.status ?? "erro"}.`);
      continue;
    }

    assert(response.status === 200, `${loc} retornou status ${response.status}.`);
    assert(!response.headers.get("location"), `${loc} redireciona.`);
  }
}

const sitemap = await readEndpoint("/sitemap.xml");
const robots = await readEndpoint("/robots.txt");

const sitemapContentType = getContentType(sitemap.response);
const robotsContentType = getContentType(robots.response);

assert(
  sitemapContentType.includes("application/xml") ||
    sitemapContentType.includes("text/xml"),
  `/sitemap.xml retornou Content-Type inesperado: ${sitemapContentType || "(vazio)"}.`,
);
assert(
  robotsContentType.includes("text/plain"),
  `/robots.txt retornou Content-Type inesperado: ${robotsContentType || "(vazio)"}.`,
);
assert(
  !sitemap.response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex"),
  "/sitemap.xml nao pode retornar X-Robots-Tag: noindex.",
);
assert(
  !robots.response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex"),
  "/robots.txt nao pode retornar X-Robots-Tag: noindex.",
);
assert(!/<\/?html[\s>]/i.test(sitemap.body), "/sitemap.xml parece conter HTML.");
assert(
  sitemap.body.trimStart().startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
  "/sitemap.xml deve comecar com declaracao XML UTF-8.",
);
assert(
  sitemap.body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
  "/sitemap.xml nao contem o namespace padrao de sitemap.",
);

const locs = extractLocs(sitemap.body);
assert(locs.length > 0, "/sitemap.xml nao contem URLs em <loc>.");

const robotsSitemaps = extractRobotsSitemaps(robots.body);
assert(robotsSitemaps.length > 0, "/robots.txt nao aponta para nenhum Sitemap.");

let canonicalSitemapUrl;
if (robotsSitemaps.length > 0) {
  try {
    canonicalSitemapUrl = new URL(robotsSitemaps[0]);
    assert(
      canonicalSitemapUrl.pathname === "/sitemap.xml",
      "Sitemap no robots.txt deve apontar para /sitemap.xml.",
    );
    assert(!isForbiddenHost(canonicalSitemapUrl.hostname), "robots.txt aponta para host proibido.");
  } catch {
    fail("Sitemap no robots.txt nao e uma URL absoluta valida.");
  }
}

let expectedOrigin = canonicalSitemapUrl?.origin;

if (!expectedOrigin && locs[0]) {
  expectedOrigin = new URL(locs[0]).origin;
}

for (const loc of locs) {
  let url;

  try {
    url = new URL(loc);
  } catch {
    fail(`${loc} nao e URL absoluta valida.`);
    continue;
  }

  if (expectedOrigin) {
    assert(url.origin === expectedOrigin, `${loc} nao usa o mesmo origin canonico.`);
  }
  assert(!isForbiddenHost(url.hostname), `${loc} usa host proibido.`);
  assert(!url.pathname.startsWith("/api/"), `${loc} aponta para rota de API.`);
  assert(!/\/(admin|dashboard|login|auth|preview|test|404)(\/|$)/i.test(url.pathname), `${loc} parece rota privada ou tecnica.`);
  assert(!/\.(png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname), `${loc} aponta para arquivo de imagem.`);
}

if (canonicalSitemapUrl && expectedOrigin) {
  assert(
    robotsSitemaps[0] === `${expectedOrigin}/sitemap.xml`,
    "robots.txt deve apontar para o sitemap canonico exato.",
  );
}

if (CHECK_SITEMAP_URLS && locs.length > 0) {
  await checkSitemapUrls(locs);
}

if (failures.length > 0) {
  console.error("SEO check falhou:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`SEO check OK em ${BASE_URL}`);
  console.log(`Sitemap canonico: ${expectedOrigin}/sitemap.xml`);
  console.log(`URLs no sitemap: ${locs.length}`);
}
