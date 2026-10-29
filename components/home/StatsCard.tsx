/**
 * 站点统计。
 *
 * 数字在构建时算好——内容一提交就会重新部署，
 * 所以「运行天数」最多滞后到当天那次构建，可接受。
 * 放客户端算会引入 hydration 不一致，得不偿失。
 */
export function StatsCard({
  posts,
  notes,
  tags,
  words,
  days,
  lastActive,
}: {
  posts: number;
  notes: number;
  tags: number;
  words: number;
  days: number;
  lastActive: string;
}) {
  const rows: [string, string][] = [
    ["文章", String(posts)],
    ["说说", String(notes)],
    ["标签", String(tags)],
    ["总字数", words >= 1000 ? `${(words / 1000).toFixed(1)}k` : String(words)],
    ["运行", `${days} 天`],
    ["最后更新", lastActive || "—"],
  ];

  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <span className="text-accent-text">#</span>
        站点统计
      </h3>

      <dl className="mt-3 space-y-1.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between text-xs"
          >
            <dt className="text-fg-muted">{label}</dt>
            <dd className="font-mono text-fg tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}