import raw from "@/data/projects.json";

/**
 * 项目清单。
 *
 * 数据在 data/projects.json，控制台直接读写它——
 * 这样加项目不用碰源码，也就不会被改坏。
 *
 * 之前这里是写死的 TS 数组。迁到 JSON 的原因是控制台需要增删改，
 * 而让程序去改写源码文件既危险又难看。
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

/** JSON 导入的类型是宽泛的，这里收窄一次 */
export const PROJECTS = raw as Project[];

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