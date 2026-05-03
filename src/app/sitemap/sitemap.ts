import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", ...projects.map((project) => `/projetos/${project.slug}`)];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
