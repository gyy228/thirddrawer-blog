import Link from "next/link";

/**
 * 分类卡片。
 *
 * 站里没有单独的「分类」概念，直接用标签——一篇文章可以有多个标签，
 * 强行造一套只能选一个的分类，等于多维护一份数据。
 */
export function CategoryCard({
  categories,
}: {
  categories: { tag: string; count: number }[];
}) {
  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <span className="text-accent-text">#</span>
        分类
      </h3>

      {categories.length === 0 ? (
        <p className="mt-2 text-xs text-fg-faint">还没有文章，暂时没有分类。</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {categories.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href="/archive"
                className="flex items-center justify-between rounded-lg px-1.5 py-1 text-xs text-fg-muted transition-colors hover:bg-accent-soft hover:text-accent-text"
              >
                <span className="truncate"># {tag}</span>
                <span className="ml-2 shrink-0 text-fg-faint">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}