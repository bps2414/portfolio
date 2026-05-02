import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = "2026-05-02";

  return [
    {
      url: `${siteConfig.url}/`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/chamadafacil`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/prado-auto-pecas`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/food-templates-bps`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/ptbr-merger`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/barbearia-da-vila`,
      lastModified,
    },
    {
      url: `${siteConfig.url}/projetos/bps-fishing-macro`,
      lastModified,
    },
  ];
}
