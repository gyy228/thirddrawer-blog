import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

/**
 * 文章段的 404：slug 对不上任何一篇文章时展示。
 *
 * 放在 [slug] 目录下，比用全站 404 更贴合上下文（用户是在找某篇文章）。
 */
export default function PostNotFound() {
  return (
    <GlassCard className="p-10 text-center sm:p-14">
      <p className="font-mono text-5xl font-semibold text-accent">404</p>
      <p className="mt-4 text-sm text-fg-muted">
        这一格抽屉里没有东西——文章可能被删了，或者链接拼错了。
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="glass lift rounded-full px-4 py-2 text-sm text-fg-muted"
        >
          回到首页
        </Link>
        <Link
          href="/archive"
          className="glass lift rounded-full px-4 py-2 text-sm text-fg-muted"
        >
          翻翻归档
        </Link>
      </div>
    </GlassCard>
  );
}