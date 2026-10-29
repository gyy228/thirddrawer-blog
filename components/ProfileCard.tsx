import { Mail } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { GlassCard } from "./GlassCard";
import { QQContact } from "./QQContact";
import { BilibiliMark, DouyinMark, GithubMark } from "./icons";

/**
 * 首页个人名片。
 *
 * 竖排居中：头像 → 名字 → 签名 → 一排社交图标。
 */

/** 有的字段填 ID、有的填整条链接，这里统一成可点的地址 */
function resolveHref(key: string, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (key === "qq" && /^\d+$/.test(value)) {
    return `https://wpa.qq.com/msgrd?v=3&uin=${value}&site=qq&menu=yes`;
  }
  if (key === "bilibili" && /^\d+$/.test(value)) {
    return `https://space.bilibili.com/${value}`;
  }
  return value;
}

export function ProfileCard() {
  const { profile } = siteConfig;
  const initial = profile.name.slice(0, 1).toUpperCase();

  const socials = [
    { key: "bilibili", label: "哔哩哔哩", Icon: BilibiliMark },
    { key: "github", label: "GitHub", Icon: GithubMark },
    { key: "douyin", label: "抖音", Icon: DouyinMark },
  ] as const;

  // 图标底座固定用白片 + 深色图标：
  // QQ 企鹅和抖音音符本身含黑白色，底座一旦跟着主题变暗就看不见了
  const badge =
    "grid size-9 place-items-center rounded-full bg-white/92 text-[#1c2434] ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-0.5 hover:ring-black/10";

  return (
    <GlassCard className="p-6 text-center">
      {profile.avatar ? (
        // 本地图片，用原生 img 就够，不必为一个文件引入 next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar}
          alt={profile.name}
          width={112}
          height={112}
          className="mx-auto size-28 rounded-2xl object-cover"
        />
      ) : (
        <div className="mx-auto grid size-28 place-items-center rounded-2xl bg-accent-soft text-3xl font-semibold text-accent-text">
          {initial}
        </div>
      )}

      <h1 className="mt-4 text-lg font-semibold text-fg">{profile.name}</h1>
      <p className="mt-1 text-xs text-fg-faint">{profile.tagline}</p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {/* QQ 不是普通外链：临时会话要对方开权限，没开就跳到 QQ 的错误页，
            所以点开就地显示号码 */}
        {profile.links.qq.trim() && (
          <QQContact number={profile.links.qq.trim()} />
        )}

        {socials.map(({ key, label, Icon }) => {
          const href = resolveHref(key, profile.links[key]);
          if (!href) return null;

          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
              title={label}
              aria-label={label}
              className={badge}
            >
              <Icon className="size-[18px]" />
            </a>
          );
        })}

        {profile.links.email && (
          <a
            href={`mailto:${profile.links.email}`}
            title="邮箱"
            aria-label="邮箱"
            className={badge}
          >
            <Mail className="size-[18px]" />
          </a>
        )}
      </div>
    </GlassCard>
  );
}