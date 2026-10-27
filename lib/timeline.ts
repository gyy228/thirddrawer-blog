import { getAllPosts } from "./posts";
import type { PostMeta } from "./posts";
import { getAllNotes } from "./notes";
import type { Note } from "./notes";

/**
 * 时间线：把文章和说说按时间聚合成一条流。
 *
 * 不引入新的数据源——已有的 posts/ 和 posts/notes/ 直接汇在一起，
 * 所以加了内容时间线自动就有，不需要额外维护。
 */

export type TimelineItem =
  | { kind: "post"; date: string; post: PostMeta }
  | { kind: "note"; date: string; note: Note };

/**
 * 合并并按日期倒序。
 *
 * 同一天的多条要有个稳定顺序，否则每次构建的产物可能不同：
 * 文章排在说说前面（文章通常更「正式」），同类之间再按各自 id 倒序。
 */
export function getTimeline(): TimelineItem[] {
  const items: TimelineItem[] = [
    ...getAllPosts().map<TimelineItem>((post) => ({
      kind: "post",
      date: post.date,
      post,
    })),
    ...getAllNotes().map<TimelineItem>((note) => ({
      kind: "note",
      date: note.date,
      note,
    })),
  ];

  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;

    // 文章优先于说说
    if (a.kind !== b.kind) return a.kind === "post" ? -1 : 1;

    // 同类按 id / slug 倒序
    const aKey = a.kind === "post" ? a.post.slug : a.note.id;
    const bKey = b.kind === "post" ? b.post.slug : b.note.id;
    return aKey < bKey ? 1 : -1;
  });
}

/** 按年月分组，供页面分节展示 */
export function groupTimelineByMonth(
  items: TimelineItem[],
): { key: string; label: string; items: TimelineItem[] }[] {
  const groups = new Map<string, TimelineItem[]>();

  for (const item of items) {
    const key = item.date ? item.date.slice(0, 7) : "unknown";
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([key, list]) => ({
    key,
    label: key === "unknown" ? "未标注日期" : `${key.slice(0, 4)} 年 ${Number(key.slice(5, 7))} 月`,
    items: list,
  }));
}

/** 统计各类内容数量，用于页面头部说明 */
export function getTimelineStats(items: TimelineItem[]) {
  return {
    total: items.length,
    posts: items.filter((item) => item.kind === "post").length,
    notes: items.filter((item) => item.kind === "note").length,
  };
}