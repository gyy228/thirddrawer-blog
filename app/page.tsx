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
            抽屉还是空的。往 <code className="font-mono">posts/</code>{" "}
            里放一个 Markdown 文件，它就会出现在这里。
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}