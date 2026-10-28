import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/siteConfig";

/**
 * robots.txt
 *
 * 静态导出时在构建阶段生成为普通文件。
 *
 * 注意：`output: "export"` 下这类特殊 Route Handler 也必须显式声明
 * force-static，否则构建报 "export const dynamic ... not configured"。
 * 整站都允许抓取，只排除本地开发才会有的路径。
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}