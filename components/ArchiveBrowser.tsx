"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

export interface ArchivePost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
}

/**
 * 归档页的搜索与标签筛选。
 *
 * 标签之间是「或」：同时选中 #随笔 和 #工具，会显示带任一标签的文章。
 * 想做「同时包含」的话结果通常为空，浏览归档时反而不好用。
 */
export function ArchiveBrowser({ posts }: { posts: ArchivePost[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // 只把真正有文章的标签做成按钮，避免点进去一片空白
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (selected.length > 0 && !selected.some((tag) => post.tags.includes(tag))) {
        return false;
      }
      if (!q) return true;

      return (
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [posts, query, selected]);

  const years = useMemo(() => {
    const map = new Map<string, ArchivePost[]>();
    for (const post of filtered) {
      const year = post.date.slice(0, 4) || "未知";
      const list = map.get(year) ?? [];
      list.push(post);
      map.set(year, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const hasFilter = query.trim() !== "" || selected.length > 0;

  function toggleTag(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="glass rounded-2xl p-4">
        <label className="flex items-center gap-2 rounded-xl border border-[color:var(--glass-brd)] px-3 py-2">
          <Search className="size-4 shrink-0 text-fg-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜标题、摘要或标签"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-faint"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清空搜索"
              className="shrink-0 text-fg-faint hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        {tagCounts.length > 0 && (
          <>
            <p className="mt-3 text-xs font-medium tracking-wide text-fg-faint">
              标签
              {selected.length > 0 && (
                <span className="ml-1 font-normal">（选多个时显示带任一标签的）</span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tagCounts.map(([tag, count]) => {
                const active = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                      active
                        ? "bg-accent-text text-white"
                        : "bg-accent-soft text-accent-text hover:opacity-80"
                    }`}
                  >
                    #{tag}
                    <span className={`ml-1 ${active ? "opacity-70" : "text-fg-faint"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelected([]);
            }}
            className="mt-3 text-xs text-fg-faint underline"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 结果 */}
      {filtered.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          没有符合条件的文章。
        </p>
      ) : (
        <>
          {hasFilter && (
            <p className="px-1 text-xs text-fg-faint">
              找到 {filtered.length} 篇
            </p>
          )}

          {years.map(([year, list]) => (
            <section key={year} className="space-y-2">
              <h2 className="px-1 font-mono text-sm text-fg-faint">{year}</h2>
              <ul className="space-y-2">
                {list.map((post) => (
                  <li key={post.slug} className="reveal">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="glass lift block rounded-xl px-4 py-3"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm">{post.title}</span>
                        <time
                          dateTime={post.date}
                          className="shrink-0 font-mono text-xs text-fg-faint"
                        >
                          {post.date.slice(5)}
                        </time>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`rounded px-1.5 py-0.5 text-[0.7rem] ${
                                selected.includes(tag)
                                  ? "bg-accent-text text-white"
                                  : "text-fg-faint"
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}