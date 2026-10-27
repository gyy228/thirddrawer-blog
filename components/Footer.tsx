import { siteConfig } from "@/siteConfig";

export function Footer() {
  // 用建站年份，而不是 new Date()。
  // 静态站点里「当前时间」属于不稳定值，Next 16 的 Cache Components
  // 会在预渲染阶段直接报错（blocking-prerender-current-time）。
  const since = siteConfig.buildDate.slice(0, 4);

  return (
    <footer className="mx-auto w-full max-w-3xl px-4 pb-8 sm:px-6">
      <div className="glass rounded-2xl px-4 py-3 text-center text-xs leading-relaxed text-fg-faint">
        <p>
          © {since} {siteConfig.author} · {siteConfig.title}
        </p>
        <p className="mt-0.5">本站建于 {siteConfig.buildDate}</p>
      </div>
    </footer>
  );
}