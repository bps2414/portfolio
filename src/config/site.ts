const FALLBACK_SITE_URL = "https://bps2414.vercel.app";

function normalizeSiteUrl(value: string | undefined): string {
  const candidate = value?.trim() || FALLBACK_SITE_URL;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase();
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]";
    const isVercelPreview =
      hostname.endsWith(".vercel.app") && hostname.includes("-");

    if (isLocalhost || isVercelPreview) {
      return FALLBACK_SITE_URL;
    }

    url.protocol = "https:";
    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: "Bryan Souza",
  title: "Bryan Souza | Desenvolvedor Web e Landing Pages",
  description:
    "Portfólio de Bryan Souza, desenvolvedor web focado em landing pages, sites responsivos e projetos digitais para pequenos negócios.",
  url: SITE_URL,
  locale: "pt_BR",
  language: "pt-BR",
  links: {
    github: "https://github.com/bps2414",
    whatsapp: "https://wa.me/5521987783382",
  },
  keywords: [
    "Bryan Souza",
    "desenvolvedor web",
    "criação de sites",
    "landing pages",
    "sites responsivos",
    "pequenos negócios",
    "portfólio de desenvolvedor",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "SEO local",
    "WhatsApp",
  ],
};
