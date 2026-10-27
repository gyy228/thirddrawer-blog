/**
 * 项目清单。
 *
 * 和文章、说说不同，项目不是「按时间发布的内容」，而是一份需要人工维护的
 * 清单——它不会每天变，也不该躺在时间线里。所以直接写成结构化的 TS 数据，
 * 而不是 Markdown：改的时候改这里，类型检查会帮你发现写错字段。
 *
 * 加一个项目就往数组里加一项。
 */

export type ProjectStatus = "active" | "wip" | "archived";

export interface Project {
  /** 稳定标识，也用作渲染的 key */
  slug: string;
  name: string;
  /** 一句话说明 */
  description: string;
  /** 详细介绍，可选 */
  detail?: string;
  /** 线上地址，可选 */
  url?: string;
  /** 源码地址，可选 */
  repo?: string;
  /** 技术栈标签 */
  stack: string[];
  status: ProjectStatus;
  /** 开始年份，用于排序 */
  year: number;
}

export const PROJECTS: Project[] = [
  {
    slug: "thirddrawer-blog",
    name: "第三层抽屉",
    description: "你现在看的这个站。毛玻璃风格的个人博客，配一个本地写作控制台。",
    detail:
      "Next.js 静态导出部署在 GitHub Pages；控制台在本地跑，写完文章点一下就把改动推上 GitHub 并自动重新部署。",
    repo: "https://github.com/gyy228/thirddrawer-blog",
    stack: ["Next.js", "TypeScript", "Tailwind", "Tiptap"],
    status: "active",
    year: 2026,
  },
];

/** 状态的中文名与配色 */
export const STATUS_META: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  // 浅色下必须用 -800/-300 这一组：
  // -700（emerald #15803d）在半透明底上只有 4.30:1、amber #b45309 只有 4.41:1，
  // 都达不到 WCAG AA 的 4.5:1。-800 分别提升到 6.59:1 和 6.22:1。
  active: {
    label: "维护中",
    className: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
  },
  wip: {
    label: "开发中",
    className: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
  },
  archived: {
    label: "已归档",
    className: "bg-[color:var(--code-bg)] text-fg-muted",
  },
};

/** 按年份倒序，同年内保持原顺序 */
export function getProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => b.year - a.year);
}