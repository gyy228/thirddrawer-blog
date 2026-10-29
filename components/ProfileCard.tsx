import { Mail } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { resolveSocialHref, webMailerFor } from "@/lib/social";
import { GlassCard } from "./GlassCard";
import { ContactPopover } from "./ContactPopover";
import { BilibiliMark, DouyinMark, GithubMark, QQMark } from "./icons";

/**
 * 首页个人名片。
 *
 * 竖排居中：头像 → 名字 → 签名 → 一排社交图标。
 */

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
    /* relative z-20 是必需的：名片用了毛玻璃（backdrop-filter 会创建层叠上下文），
       QQ 弹层的 z-index 冲不出这张卡。后面那几张文章卡片在 DOM 里更靠后，
       会把弹层和其中的按钮盖住——表现为「按钮点不了」。
       把卡片本身抬到后续兄弟节点之上，弹层才真的在最上层。 */
    <GlassCard className="relative z-20 p-6 text-center">
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
          <ContactPopover
            label="QQ"
            value={profile.links.qq.trim()}
            hint="在 QQ 里搜索这个号码加好友就能聊。"
            copyLabel="复制号码"
            icon={<QQMark className="size-5" />}
          />
        )}

        {socials.map(({ key, label, Icon }) => {
          const href = resolveSocialHref(key, profile.links[key]);
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
              <Icon className="size-5" />
            </a>
          );
        })}

        {/* 邮箱也不再走 mailto：没装邮件客户端的机器点了毫无反应，
            改成弹层显示地址 + 复制 + 网页版入口 */}
        {profile.links.email && (
          <ContactPopover
            label="邮箱"
            value={profile.links.email}
            hint="复制地址后去邮箱发信。"
            copyLabel="复制地址"
            icon={<Mail className="size-5" />}
            extra={webMailerFor(profile.links.email)}
          />
        )}
      </div>
    </GlassCard>
  );
}