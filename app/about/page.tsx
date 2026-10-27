import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { GithubMark } from "@/components/icons";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  const { profile, title, subtitle, motto } = siteConfig;

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
          <p className="text-sm leading-relaxed text-fg-muted">
            一个放零碎东西的地方。没有主题，没有更新频率，也没有非写不可的理由。
            想到什么就塞进来，想不起来就一直搁着——反正抽屉本来就是这样用的。
          </p>
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
            {profile.links.github && (
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className="glass lift inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted"
              >
                <GithubMark className="size-3.5" />
                GitHub
              </a>
            )}
            {profile.links.email && (
              <a
                href={`mailto:${profile.links.email}`}
                className="glass lift inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted"
              >
                <Mail className="size-3.5" />
                {profile.links.email}
              </a>
            )}
          </div>
        </section>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="text-xs font-medium tracking-wide text-fg-faint">本站由什么搭起来</p>
        <ul className="mt-2.5 grid grid-cols-2 gap-1.5 text-sm text-fg-muted sm:grid-cols-3">
          {[
            "Next.js 16",
            "React 19",
            "Tailwind 4",
            "TypeScript",
            "Markdown",
            "GitHub Pages",
          ].map((item) => (
            <li key={item} className="font-mono text-xs">
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}