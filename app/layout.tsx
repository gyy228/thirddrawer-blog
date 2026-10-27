import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/siteConfig";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.title} · ${siteConfig.subtitle}`,
    template: `%s · ${siteConfig.title}`,
  },
  description: siteConfig.description,
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
        </ThemeProvider>
      </body>
    </html>
  );
}