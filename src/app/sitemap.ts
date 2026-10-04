import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const publishedPosts = await getPublishedSlugs();

  return [
    {
      url: siteUrl.toString(),
      changeFrequency: "weekly",
    },
    ...publishedPosts.map(({ slug }) => ({
      url: new URL(`/blog/${encodeURIComponent(slug)}`, siteUrl).toString(),
      changeFrequency: "monthly" as const,
    })),
  ];
}
