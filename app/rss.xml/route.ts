import { getAllPosts } from "@/lib/posts";
import { siteConfig, absoluteUrl } from "@/siteConfig";

/**
 * RSS 2.0。
 *
 * 静态导出下 Route Handler 只支持 GET，且必须显式声明 force-static，
 * 构建时会被写成一个普通文件 out/rss.xml。
 */
export const dynamic = "force-static";

/** XML 特殊字符转义——不转义的话标题里一个 & 就能让整份 RSS 解析失败 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 的 pubDate 需要 RFC 822 格式 */
function toRfc822(date: string): string {
  const parsed = new Date(`${date}T00:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return new Date().toUTCString();
  return parsed.toUTCString();
}

export function GET() {
  const posts = getAllPosts();
  const now = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/posts/${post.slug}/`);
      const description = post.summary || "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${post.date ? `<pubDate>${toRfc822(post.date)}</pubDate>` : ""}
      <description>${escapeXml(description)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}