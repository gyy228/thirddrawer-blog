import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ContactPopover } from "@/components/ContactPopover";
import { BilibiliMark, DouyinMark, GithubMark, QQMark } from "@/components/icons";
import { ABOUT } from "@/lib/about";
import { resolveSocialHref, qzoneHref, webMailerFor } from "@/lib/social";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  const { profile, title, subtitle, motto } = siteConfig;

  const pill =
    "glass lift inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted";

  const bilibili = resolveSocialHref("bilibili", profile.links.bilibili);
  const douyin = resolveSocialHref("douyin", profile.links.douyin);
  const qzone = qzoneHref(profile.links.qq, profile.links.qzone);

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">关于</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {title} · {subtitle}
        </p>
      </header>

      <GlassCard className="space-y-4 p-6 sm:p-7">
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-fg-faint">这是什么</h2>
          <p className="text-sm leading-relaxed text-fg-muted">{ABOUT.intro}</p>
        </section>

        {motto && (
          <p className="border-l-2 border-accent pl-3 text-sm text-fg-faint italic">
            {motto}
          </p>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-fg-faint">关于我</h2>
          <p className="text-sm leading-relaxed text-fg-muted">{profile.bio}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-fg-faint">找到我</h2>
          <div className="flex flex-wrap gap-2">
            {/* QQ 直接跳 QQ 空间；邮箱仍走弹层——
                mailto 在没装客户端的机器上点了没反应 */}
            {qzone && (
              <a
                href={qzone}
                target="_blank"
                rel="noreferrer"
                className={pill}
              >
                <QQMark className="size-3.5" />
                QQ 空间
              </a>
            )}

            {bilibili && (
              <a
                href={bilibili}
                target="_blank"
                rel="noreferrer"
                className={pill}
              >
                <BilibiliMark className="size-3.5" />
                哔哩哔哩
              </a>
            )}

            {profile.links.github && (
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className={pill}
              >
                <GithubMark className="size-3.5" />
                GitHub
              </a>
            )}

            {douyin && (
              <a href={douyin} target="_blank" rel="noreferrer" className={pill}>
                <DouyinMark className="size-3.5" />
                抖音
              </a>
            )}

            {profile.links.email && (
              <ContactPopover
                label="邮箱"
                value={profile.links.email}
                hint="复制地址后去邮箱发信。"
                copyLabel="复制地址"
                variant="pill"
                icon={<Mail className="size-3.5" />}
                extra={webMailerFor(profile.links.email)}
              />
            )}
          </div>
        </section>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="text-xs font-medium tracking-wide text-fg-faint">本站由什么搭起来</p>
        <ul className="mt-2.5 grid grid-cols-2 gap-1.5 text-sm text-fg-muted sm:grid-cols-3">
          {ABOUT.stack.map((item) => (
            <li key={item} className="font-mono text-xs">
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}