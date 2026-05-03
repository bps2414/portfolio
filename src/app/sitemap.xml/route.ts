import { SITE_URL } from "@/config/site";
import { projects } from "@/data/projects";

export const dynamic = "force-static";

const PUBLIC_ROUTES = [
  "/",
  ...projects
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((project) => `/projetos/${project.slug}`),
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function GET() {
  const urls = PUBLIC_ROUTES.map((path) => {
    return `  <url>
    <loc>${escapeXml(absoluteUrl(path))}</loc>
  </url>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
