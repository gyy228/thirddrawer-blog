/**
 * siteConfig.ts —— 全站配置中心
 *
 * 站点的文案与外观参数都集中在这里。想改站名、导航、个人名片，
 * 优先改这个文件，而不是翻各个组件。
 */

import { BASE_PATH } from "./lib/basePath";

export const siteConfig = {
  // ── 站点标识 ────────────────────────────────────
  title: "桃之夭夭",
  subtitle: "灼灼其华",
  description: "桃花开得正好，风过就落一肩。",
  author: "thirddrawer",

  // ── 导航 ────────────────────────────────────────
  nav: [
    { href: "/", label: "首页" },
    { href: "/digest", label: "选刊" },
    { href: "/notes", label: "说说" },
    { href: "/timeline", label: "时间线" },
    { href: "/archive", label: "归档" },
    { href: "/projects", label: "项目" },
    { href: "/photos", label: "照片" },
    { href: "/friends", label: "友链" },
    { href: "/about", label: "关于" },
    // 控制台入口。页面本身是公开的，但需要 GitHub 访问令牌才能做任何事。
    { href: "/console", label: "个人空间" },
  ],

  // ── 个人名片 ────────────────────────────────────
  profile: {
    /** 卡片上显示的名字 */
    name: "江离辟止",
    /** 名字下面的小字签名 */
    tagline: "桃之夭夭，灼灼其华",
    bio: "在代码和生活之间来回徘徊的普通人。",
    /** public/ 下的头像；留空则退回首字母头像 */
    avatar: `${BASE_PATH}/images/avatar.jpg`,
    /**
     * 社交链接。留空的项不会渲染图标——
     * 与其挂一个点了没反应的按钮，不如先不显示。
     */
    links: {
      /** 填 QQ 号即可，会自动拼成会话链接 */
      qq: "",
      /** 填 B 站 UID 数字即可 */
      bilibili: "",
      /** 抖音主页完整链接（带 /user/ 的那种） */
      douyin: "",
      github: "https://github.com/gyy228",
      email: "2065738974@qq.com",
    },
  },

  // ── 首页引言 ────────────────────────────────────
  motto: "桃之夭夭，灼灼其华。",

  // ── 首页侧栏 ────────────────────────────────────
  /** 公告。link 留空则只显示文字，不出现按钮 */
  announcement: {
    title: "公告",
    text: "站点刚换了名字，内容还在慢慢补。选刊每天自动更新，其余随缘。",
    link: "/about",
    linkLabel: "了解更多",
  },

  /**
   * 音乐。
   *
   * src 留空时只渲染界面、点了会提示「还没配置音乐文件」，
   * 不会假装在播放。以后把 mp3 放进 public/music/，
   * 这里填 `/thirddrawer-blog/music/xxx.mp3` 就能响。
   */
  music: {
    title: "音乐",
    song: "还没选好",
    artist: "",
    src: "",
  },

  /** 站点起始日期，用于算「已运行 N 天」 */
  launchDate: "2026-10-27",

  // ── AI 导览 ────────────────────────────────────
  ai: {
    /**
     * AI 导览的接口地址（Cloudflare Worker 部署后得到）。
     *
     * 留空则页面上完全不显示 AI 入口——这样在 Worker 还没部署时，
     * 站点不会出现一个点了就报错的按钮。
     *
     * 形如：https://thirddrawer-ai.<你的子域>.workers.dev/chat
     */
    endpoint: "https://thirddrawer-ai.2065738974.workers.dev/chat",
    /** 入口按钮上的文案 */
    label: "问问我",
  },

  // ── 站点元信息 ──────────────────────────────────
  /**
   * 站点正式地址，不含末尾斜杠。
   *
   * 用途：metadataBase（让元信息里的相对路径解析成绝对地址）、
   * sitemap.xml、robots.txt、RSS 里的绝对链接。
   *
   * 换成自定义域名时改这里，同时要删掉 next.config.ts 的 basePath。
   */
  siteUrl: "https://gyy228.github.io/thirddrawer-blog",
  buildDate: "2026-10-27",
} as const;

export type SiteConfig = typeof siteConfig;

/** 拼绝对地址，自动处理末尾斜杠 */
export function absoluteUrl(pathname = "/"): string {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}