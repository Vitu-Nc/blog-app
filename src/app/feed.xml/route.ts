import { getPublishedPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const postUrl = new URL(
        `/blog/${encodeURIComponent(post.slug)}`,
        siteUrl,
      ).toString();
      const urlXml = escapeXml(postUrl);

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${urlXml}</link>
  <guid isPermaLink="true">${urlXml}</guid>
  <description>${escapeXml(post.excerpt)}</description>
  <pubDate>${escapeXml(post.publishedAt.toUTCString())}</pubDate>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>A Personal Blog</title>
    <link>${escapeXml(siteUrl.toString())}</link>
    <description>Notes on the things worth noticing.</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
