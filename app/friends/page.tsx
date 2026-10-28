import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
import { ArrowUpRight } from "lucide-react";
import { APPLY_INFO, FRIEND_LINKS, SITE_INFO } from "@/lib/friends";
import type { FriendLink } from "@/lib/friends";
import { siteConfig } from "@/siteConfig";
import { CopyButton } from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "友链",
  description: `${siteConfig.title}的朋友们。`,
};

/** 申请格式的纯文本，供一键复制 */
const APPLY_TEMPLATE = `站名：${SITE_INFO.name}
地址：${SITE_INFO.url}
简介：${SITE_INFO.description}
头像：${SITE_INFO.avatar}`;

export default function FriendsPage() {
  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">友链</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {FRIEND_LINKS.length > 0
            ? `一共 ${FRIEND_LINKS.length} 位朋友。`
            : "这一格还空着。"}
        </p>
      </header>

      {FRIEND_LINKS.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          还没有友链。下面可以申请。
        </p>
      ) : (
        <ul className="grid auto-rows-min gap-3 sm:grid-cols-2">
          {FRIEND_LINKS.map((friend) => (
            <li key={friend.slug} className="reveal">
              <FriendCard friend={friend} />
            </li>
          ))}
        </ul>
      )}

      {/* ── 申请说明 ────────────────────────────── */}
      <section className="space-y-3 pt-2">
        <h2 className="px-1 text-lg font-semibold">想交换友链？</h2>

        <GlassCard className="p-5">
          <p className="text-sm text-fg-muted">
            把下面这几行抄过去放到你的站上，然后按格式发邮件给我就行。
          </p>

          <div className="mt-3 rounded-xl border border-[color:var(--glass-brd)] bg-[color:var(--code-bg)] p-3">
            <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-fg">
              {APPLY_TEMPLATE}
            </pre>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CopyButton text={APPLY_TEMPLATE} />
            <a
              href={`mailto:${APPLY_INFO.email}?subject=${encodeURIComponent("友链申请")}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              发邮件申请
              <ArrowUpRight className="size-3 opacity-60" />
            </a>
            <span className="text-xs text-fg-faint">{APPLY_INFO.note}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs font-medium tracking-wide text-fg-faint">几点说明</p>
          <ul className="mt-2 space-y-1.5 text-sm text-fg-muted">
            <li>· 内容原创为主，能正常访问（而不是一打开就要翻墙）。</li>
            <li>· 我这边先看，合适的会尽快加上，不合适就不另行回复了。</li>
            <li>· 友链挂了或长期不更新，我会撤下来，不提前通知。</li>
          </ul>
        </GlassCard>
      </section>
    </div>
  );
}

function FriendCard({ friend }: { friend: FriendLink }) {
  return (
    <a
      href={friend.url}
      target="_blank"
      rel="noreferrer"
      className="glass lift flex h-full items-start gap-3 rounded-2xl p-4"
    >
      <Avatar name={friend.name} src={friend.avatar} />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 font-medium">
          <span className="truncate">{friend.name}</span>
          <ArrowUpRight className="size-3.5 shrink-0 text-fg-faint" />
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">
          {friend.description}
        </p>
      </div>
    </a>
  );
}

/**
 * 头像。
 *
 * 用原生 img 而不是 next/image：友链头像是外部站点的地址，
 * 静态导出下 next/image 需要给每个外部域名配 loader，不值当。
 * 加载失败时退回首字，避免出现破图。
 */
function Avatar({ name, src }: { name: string; src?: string }) {
  const initial = Array.from(name)[0] ?? "?";

  if (!src) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
        {initial}
      </span>
    );
  }

  return (
    <span className="relative size-10 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="size-10 rounded-full object-cover"
      />
    </span>
  );
}