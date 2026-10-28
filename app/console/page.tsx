import type { Metadata } from "next";
import { ConsoleApp } from "@/components/console/ConsoleApp";

/**
 * 个人空间 / 控制台。
 *
 * 纯前端：没有服务端，所有读写都走 GitHub API，由 GitHub 校验 Token。
 * 页面本身是公开的——但拿不到 Token 的人什么也做不了。
 */
export const metadata: Metadata = {
  title: "个人空间",
  // 别让搜索引擎收录后台入口
  robots: { index: false, follow: false },
};

export default function ConsolePage() {
  return <ConsoleApp />;
}