import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { getAllPosts, getAllTags, groupByYear } from "@/lib/posts";

export const metadata: Metadata = {
  title: "归档",
};

export default function ArchivePage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const years = groupByYear(posts);

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">归档</h1>
        <p className="mt-1 text-sm text-fg-muted">
          抽屉里一共 {posts.length} 篇。
        </p>
      </header>

      {tags.length > 0 && (
        <GlassCard className="p-5">
          <p className="text-xs font-medium tracking-wide text-fg-faint">标签</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-text"
              >
                #{tag}
                <span className="ml-1 text-fg-faint">{count}</span>
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {years.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          还没有文章可以归档。
        </p>
      ) : (
        years.map(({ year, posts: list }) => (
          <section key={year} className="space-y-2">
            <h2 className="px-1 font-mono text-sm text-fg-faint">{year}</h2>
            <ul className="space-y-2">
              {list.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="glass lift flex items-baseline justify-between gap-4 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm">{post.title}</span>
                    <time
                      dateTime={post.date}
                      className="shrink-0 font-mono text-xs text-fg-faint"
                    >
                      {post.date.slice(5)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}