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