import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { sanityClient } from "@/lib/sanity/client";
import {
  categorySlugsQuery,
  productSkuTuplesQuery,
  projectSlugsQuery,
  articleSlugsQuery,
} from "@/lib/sanity/queries";
import { SITE_URL } from "@/lib/site";

type SkuTuple = {
  sku: string;
  category: string;
  brand: string;
  parentSlug?: string;
};

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  priority = 0.5,
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, projects, articles] = await Promise.all([
    sanityClient.fetch<{ slug: string }[]>(categorySlugsQuery),
    sanityClient.fetch<SkuTuple[]>(productSkuTuplesQuery),
    sanityClient.fetch<{ slug: string }[]>(projectSlugsQuery),
    sanityClient.fetch<{ slug: string }[]>(articleSlugsQuery),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    ...entry("/", "weekly", 1.0),
    ...entry("/safety", "monthly", 0.8),
    ...entry("/safety/rapid-shutdown", "monthly", 0.8),
    ...entry("/safety/firefighter-safety-switches", "monthly", 0.7),
    ...entry("/safety/why-solar-safety-matters", "monthly", 0.6),
    ...entry("/products", "weekly", 0.9),
    ...entry("/solutions/commercial-industrial", "monthly", 0.7),
    ...entry("/solutions/residential", "monthly", 0.7),
    ...entry("/solutions/solar-farm", "monthly", 0.7),
    ...entry("/solutions/scada-monitoring", "monthly", 0.7),
    ...entry("/projects", "weekly", 0.7),
    ...entry("/resources", "weekly", 0.7),
    ...entry("/resources/datasheets", "weekly", 0.6),
    ...entry("/resources/wiring-diagrams", "weekly", 0.6),
    ...entry("/resources/standards-compliance", "monthly", 0.6),
    ...entry("/resources/workshop-training", "monthly", 0.5),
    ...entry("/resources/articles", "weekly", 0.6),
    ...entry("/about/projoy-partnership", "monthly", 0.6),
    ...entry("/about/team", "monthly", 0.5),
    ...entry("/contact", "monthly", 0.7),
    ...entry("/quote", "monthly", 0.8),
  ];

  const categoryRoutes = categories.flatMap((c) =>
    entry(`/products/${c.slug}`, "weekly", 0.7),
  );

  const productRoutes = products.flatMap((p) => {
    const catPath = p.parentSlug
      ? `${p.parentSlug}/${p.category}`
      : p.category;
    return entry(
      `/products/${catPath}/${p.brand}/${p.sku}`,
      "monthly",
      0.6,
    );
  });

  const projectRoutes = projects.flatMap((p) =>
    entry(`/projects/${p.slug}`, "monthly", 0.5),
  );

  const articleRoutes = articles.flatMap((a) =>
    entry(`/resources/articles/${a.slug}`, "monthly", 0.5),
  );

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...projectRoutes,
    ...articleRoutes,
  ];
}
