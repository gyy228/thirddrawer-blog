/**
 * siteConfig.ts —— 全站配置中心
 *
 * 站点的文案与外观参数都集中在这里。想改站名、导航、个人名片，
 * 优先改这个文件，而不是翻各个组件。
 */

export const siteConfig = {
  // ── 站点标识 ────────────────────────────────────
  title: "第三层抽屉",
  subtitle: "拉开看看",
  description: "抽屉里全是说不清有什么用、却舍不得扔的东西。",
  author: "thirddrawer",

  // ── 导航 ────────────────────────────────────────
  nav: [
    { href: "/", label: "首页" },
    { href: "/notes", label: "说说" },
    { href: "/timeline", label: "时间线" },
    { href: "/archive", label: "归档" },
    { href: "/projects", label: "项目" },
    { href: "/photos", label: "照片" },
    { href: "/friends", label: "友链" },
    { href: "/about", label: "关于" },
  ],

  // ── 个人名片 ────────────────────────────────────
  profile: {
    name: "thirddrawer",
    bio: "在代码和生活之间来回徘徊的普通人。",
    avatar: "", // 留空则显示首字母头像
    links: {
      github: "https://github.com/gyy228",
      email: "2065738974@qq.com",
    },
  },

  // ── 首页引言 ────────────────────────────────────
  motto: "有些东西没什么用，但扔不掉。",

  // ── 站点元信息 ──────────────────────────────────
  /**
   * 部署后填成正式地址（例如 https://thirddrawer.vercel.app）。
   * 作为 metadataBase 使用，让元信息里的相对路径能被正确解析。
   */
  siteUrl: "",
  buildDate: "2026-10-27",
} as const;

export type SiteConfig = typeof siteConfig;