import { ProfileCard } from "@/components/ProfileCard";
import { PostCard } from "@/components/PostCard";
import { HomeColumns } from "@/components/home/HomeColumns";
import { getAllPosts, getAllTags, getTotalWordCount } from "@/lib/posts";
import { getAllNotes } from "@/lib/notes";
import { siteConfig } from "@/siteConfig";

/** 主题配色由 CSS 变量控制，这里只算内容，不碰样式 */
function daysSince(date: string): number {
  const start = new Date(`${date}T00:00:00+08:00`).getTime();
  if (Number.isNaN(start)) return 0;
  const diff = Date.now() - start;
  return Math.max(0, Math.floor(diff / 86_400_000) + 1);
}

export default function HomePage() {
  const posts = getAllPosts();
  const notes = getAllNotes();

  const pinned = posts.filter((post) => post.pinned);
  const rest = posts.filter((post) => !post.pinned);

  const categories = getAllTags();
  const lastActive = [
    ...posts.map((p) => p.date),
    ...notes.map((n) => n.date),
  ]
    .filter(Boolean)
    .sort()
    .at(-1) ?? "";

  return (
    <HomeColumns
      categories={categories}
      stats={{
        posts: posts.length,
        notes: notes.length,
        tags: categories.length,
        words: getTotalWordCount(),
        days: daysSince(siteConfig.launchDate),
        lastActive,
      }}
    >
      <ProfileCard />

      {pinned.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 px-1 text-xs font-medium tracking-wide text-fg-faint">
            <span className="text-accent-text">📌</span>
            置顶
          </h2>
          <ul className="space-y-3">
            {pinned.map((post) => (
              <li key={post.slug} className="reveal">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 一篇都没有才说「还没有文章」。
          全部置顶时 rest 为空，这时不该说没有文章——
          上面明明列着三篇。 */}
      {posts.length === 0 && (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          还没有文章。
        </p>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-xs font-medium tracking-wide text-fg-faint">
            最近写的
          </h2>
          <ul className="space-y-3">
            {rest.map((post) => (
              <li key={post.slug} className="reveal">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </HomeColumns>
  );
}