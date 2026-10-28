import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AiChat } from "@/components/AiChat";
import { siteConfig } from "@/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  // 填了正式地址后作为 metadataBase，相对资源路径才能正确解析
  ...(siteConfig.siteUrl ? { metadataBase: new URL(siteConfig.siteUrl) } : {}),
  title: {
    default: `${siteConfig.title} · ${siteConfig.subtitle}`,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  // RSS 自动发现：阅读器和浏览器靠这个找到订阅地址
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: `${siteConfig.title} 的 RSS` }],
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.title,
    title: `${siteConfig.title} · ${siteConfig.subtitle}`,
    description: siteConfig.description,
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.title} · ${siteConfig.subtitle}`,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior 让 Next 在路由跳转时接管平滑滚动，避免「慢慢滚回顶部」
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <BackgroundLayer />
          <Navbar />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
          <Footer />
          {/* 接口地址没配置时 AiChat 自己不渲染，这里不用额外判断 */}
          <AiChat endpoint={siteConfig.ai.endpoint} label={siteConfig.ai.label} />
        </ThemeProvider>
      </body>
    </html>
  );
}