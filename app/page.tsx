import { HeroBanner } from "@/components/home/HeroBanner";
import { ProfileCard } from "@/components/ProfileCard";
import { PostCard } from "@/components/PostCard";
import { AnnouncementCard } from "@/components/home/AnnouncementCard";
import { CategoryCard } from "@/components/home/CategoryCard";
import { StatsCard } from "@/components/home/StatsCard";
import { CalendarCard } from "@/components/home/CalendarCard";
import { getAllPosts, getAllTags, getTotalWordCount } from "@/lib/posts";
import { getAllNotes } from "@/lib/notes";
import { siteConfig } from "@/siteConfig";

/**
 * 首页。
 *
 * 顶部是整幅动图横幅（站名 + 副标题压在上面），下面是三栏：
 * 左栏个人名片 / 公告 / 分类，中栏文章，右栏统计与日历。
 *
 * 横幅和内容都用全宽（.hero-bleed / .home-wide 会冲出 main 的 max-w-3xl），
 * 所以这个页面比内页宽。
 */

/** 主题配色由 CSS 变量控制，这里只算内容，不碰样式 */
function daysSince(date: string): number {
  const start = new Date(`${date}T00:00:00+08:00`).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000) + 1);
}

export default function HomePage() {
  const posts = getAllPosts();
  const notes = getAllNotes();

  const pinned = posts.filter((post) => post.pinned);
  const rest = posts.filter((post) => !post.pinned);

  const categories = getAllTags();
  const lastActive =
    [...posts.map((p) => p.date), ...notes.map((n) => n.date)]
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";

  return (
    <div className="home-hero">
      <HeroBanner />

      <div className="home-wide mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_16rem] lg:items-start">
        {/* 左栏：个人名片在最前 */}
        <aside className="order-2 space-y-4 lg:order-1">
          <ProfileCard />
          <AnnouncementCard />
          <CategoryCard categories={categories} />
        </aside>

        {/* 中栏：文章 */}
        <div className="order-1 min-w-0 space-y-4 lg:order-2">
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

          {/* 全部置顶时 rest 为空，这时不该说「还没有文章」——上面明明列着 */}
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
        </div>

        {/* 右栏 */}
        <aside className="order-3 space-y-4">
          <StatsCard
            posts={posts.length}
            notes={notes.length}
            tags={categories.length}
            words={getTotalWordCount()}
            days={daysSince(siteConfig.launchDate)}
            lastActive={lastActive}
          />
          <CalendarCard />
        </aside>
      </div>
    </div>
  );
}