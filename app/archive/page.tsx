import type { Metadata } from "next";
import { ArchiveBrowser } from "@/components/ArchiveBrowser";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "归档",
};

export default function ArchivePage() {
  const posts = getAllPosts();

  // 只把筛选和展示需要的字段交给客户端组件，
  // 正文没必要传过去，白占传输体积
  const items = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    summary: post.summary,
  }));

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">归档</h1>
        <p className="mt-1 text-sm text-fg-muted">
          一共 {posts.length} 篇。
        </p>
      </header>

      <ArchiveBrowser posts={items} />
    </div>
  );
}