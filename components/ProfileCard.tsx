import { Mail } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { GlassCard } from "./GlassCard";
import { GithubMark } from "./icons";

/** 首页顶部的个人名片 */
export function ProfileCard() {
  const { profile, title, subtitle, motto } = siteConfig;
  const initial = profile.name.slice(0, 1).toUpperCase();

  const linkClass =
    "glass lift inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted";

  return (
    <GlassCard className="p-6 sm:p-7">
      <div className="flex items-center gap-4">
        {profile.avatar ? (
          // 头像为外部图床地址，用原生 img 避免额外配置 remotePatterns
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar}
            alt={profile.name}
            className="size-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft text-xl font-semibold text-accent-text">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="truncate text-sm text-fg-muted">{subtitle}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-fg-muted">{profile.bio}</p>

      {motto && (
        <p className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-fg-faint">
          {motto}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {profile.links.github && (
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            <GithubMark className="size-3.5" />
            GitHub
          </a>
        )}
        {profile.links.email && (
          <a href={`mailto:${profile.links.email}`} className={linkClass}>
            <Mail className="size-3.5" />
            {profile.links.email}
          </a>
        )}
      </div>
    </GlassCard>
  );
}