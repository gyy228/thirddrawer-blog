import { ProfileCard } from "@/components/ProfileCard";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-6">
      <ProfileCard />

      <section className="space-y-3">
        <h2 className="px-1 text-xs font-medium tracking-wide text-fg-faint">
          最近写的
        </h2>

        {posts.length === 0 ? (
          <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
            还没有文章。
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.slug} className="reveal">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}