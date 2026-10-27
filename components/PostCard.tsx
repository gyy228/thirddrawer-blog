import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

/** 首页/归档页的文章条目 */
export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="glass lift block rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-semibold sm:text-lg">{post.title}</h3>
        <time dateTime={post.date} className="shrink-0 font-mono text-xs text-fg-faint">
          {post.date}
        </time>
      </div>

      {post.summary && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">
          {post.summary}
        </p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}