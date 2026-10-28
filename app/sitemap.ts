import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllNotes } from "@/lib/notes";
import { absoluteUrl } from "@/siteConfig";

/**
 * sitemap.xml
 *
 * 静态导出时在构建阶段生成为普通文件，不需要服务端。
 * 只列真正有独立地址的页面——说说没有详情页，所以不单独列。
 *
 * 注意：`output: "export"` 下也必须显式声明 force-static。
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const notes = getAllNotes();

  /** 全站最新内容日期，用来给固定页面一个像样的 lastModified */
  const latest = [posts[0]?.date, notes[0]?.date]
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const lastModified = latest ? new Date(latest) : new Date("2026-10-27");

  // 站点开了 trailingSlash，实际地址都带末尾斜杠，
  // 这里必须一致，否则爬虫拿到的是需要跳转的地址
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/notes/"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/timeline/"), lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/archive/"), lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/projects/"), lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/photos/"), lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/friends/"), lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about/"), lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/posts/${post.slug}/`),
    lastModified: post.date ? new Date(post.date) : lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}