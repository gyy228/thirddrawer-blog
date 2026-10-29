/**
 * 首页专用的三栏骨架。
 *
 * 其余页面仍是居中单栏（max-w-3xl），只有首页需要更宽。
 * 用「突破父容器」的写法而不是改根布局——改根布局要动全部 11 个页面，
 * 回归风险远大于收益。
 *
 * 移动端顺序：中栏（文章）在最前，其次左栏、右栏。
 * 因为访客是来看文章的，不该先让他滑过三张卡片。
 */

import type { ReactNode } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import { MusicCard } from "./MusicCard";
import { CategoryCard } from "./CategoryCard";
import { StatsCard } from "./StatsCard";
import { CalendarCard } from "./CalendarCard";

export function HomeColumns({
  children,
  categories,
  stats,
}: {
  children: ReactNode;
  categories: { tag: string; count: number }[];
  stats: {
    posts: number;
    notes: number;
    tags: number;
    words: number;
    days: number;
    lastActive: string;
  };
}) {
  return (
    <div className="home-wide grid grid-cols-1 gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_15rem] lg:items-start">
      <aside className="order-2 space-y-4 lg:order-1">
        <AnnouncementCard />
        <MusicCard />
        <CategoryCard categories={categories} />
      </aside>

      <div className="order-1 min-w-0 space-y-4 lg:order-2">{children}</div>

      <aside className="order-3 space-y-4">
        <StatsCard {...stats} />
        <CalendarCard />
      </aside>
    </div>
  );
}