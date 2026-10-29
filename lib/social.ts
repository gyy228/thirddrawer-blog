/**
 * 社交链接的地址拼装。
 *
 * 配置里有的填 ID（QQ 号、B 站 UID），有的填完整链接（抖音），
 * 这里统一成可以直接用的地址。首页名片和关于页共用一份，
 * 免得两处各写一遍、以后改一处漏一处。
 */

export type SocialKey = "qq" | "bilibili" | "douyin" | "github";

/** 返回可点的地址；没配置或为空时返回 null，调用方据此决定要不要渲染 */
export function resolveSocialHref(key: SocialKey, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (key === "qq" && /^\d+$/.test(value)) {
    return `https://wpa.qq.com/msgrd?v=3&uin=${value}&site=qq&menu=yes`;
  }
  if (key === "bilibili" && /^\d+$/.test(value)) {
    return `https://space.bilibili.com/${value}`;
  }

  // 其余原样使用（GitHub、抖音，或用户直接填的完整链接）
  return value;
}

/**
 * 邮箱对应的网页版入口。
 *
 * `mailto:` 依赖本机装了默认邮件客户端——没装的话点了什么都不发生，
 * 而现在很多人根本不用客户端。所以给一个网页版兜底。
 * 认不出的域名就返回 undefined，界面上不显示这个入口，
 * 免得把人带到别家的登录页。
 */
export function webMailerFor(
  email: string,
): { href: string; label: string } | undefined {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return undefined;

  const table: Record<string, { href: string; label: string }> = {
    "qq.com": { href: "https://mail.qq.com", label: "打开 QQ 邮箱" },
    "foxmail.com": { href: "https://mail.qq.com", label: "打开 QQ 邮箱" },
    "163.com": { href: "https://mail.163.com", label: "打开网易邮箱" },
    "126.com": { href: "https://mail.126.com", label: "打开网易邮箱" },
    "gmail.com": { href: "https://mail.google.com", label: "打开 Gmail" },
    "outlook.com": { href: "https://outlook.live.com", label: "打开 Outlook" },
    "hotmail.com": { href: "https://outlook.live.com", label: "打开 Outlook" },
  };

  return table[domain];
}