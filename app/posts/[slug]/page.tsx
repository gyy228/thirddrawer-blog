import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { ReadingProgress } from "@/components/ReadingProgress";
import { extractHeadings, markdownToHtml } from "@/lib/markdown";
import {
  formatDate,
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
} from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/**
 * 关于未知 slug 的处理
 *
 * `dynamicParams: false` 与 cacheComponents 不兼容（构建直接报错），
 * 官方迁移文档要求改为在页面里调 notFound()。
 *
 * 注意：PPR 会先把静态外壳以 200 发出，因此 notFound() 触发时状态码
 * 已经是 200，无法再改成 404 —— 这是 Next 的文档化行为，Next 会同时
 * 注入 <meta name="robots" content="noindex">，所以不会被搜索引擎收录。
 * 若将来需要真正的 404 状态码，可在 proxy.ts 里做请求期校验。
 */

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: "文章不存在" };

  return {
    title: post.title,
    description: post.summary || undefined,
  };
}

export default async function PostPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const html = await markdownToHtml(post.content);
  const headings = extractHeadings(post.content);
  const { older, newer } = getAdjacentPosts(slug);

  return (
    <article className="space-y-5">
      <ReadingProgress />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-1 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        返回首页
      </Link>

      <header className="space-y-3 px-1">
        <h1 className="text-2xl leading-snug font-semibold sm:text-3xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-fg-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-accent-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {headings.length > 0 && (
        <GlassCard className="p-5">
          <p className="text-xs font-medium tracking-wide text-fg-faint">本页目录</p>
          <ul className="mt-2 space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className="text-sm text-fg-muted transition-colors hover:text-accent-text"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <GlassCard className="p-6 sm:p-8">
        <div
          className="article prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </GlassCard>

      {(older || newer) && (
        <nav className="grid gap-3 sm:grid-cols-2" aria-label="相邻文章">
          {older && (
            <Link
              href={`/posts/${older.slug}`}
              className="glass lift rounded-2xl p-4"
            >
              <span className="flex items-center gap-1 text-xs text-fg-faint">
                <ArrowLeft className="size-3" />
                上一篇
              </span>
              <span className="mt-1 block text-sm leading-snug">{older.title}</span>
            </Link>
          )}

          {newer && (
            <Link
              href={`/posts/${newer.slug}`}
              className="glass lift rounded-2xl p-4 sm:col-start-2 sm:text-right"
            >
              <span className="flex items-center gap-1 text-xs text-fg-faint sm:justify-end">
                下一篇
                <ArrowRight className="size-3" />
              </span>
              <span className="mt-1 block text-sm leading-snug">{newer.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}