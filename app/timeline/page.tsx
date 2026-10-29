import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { groupTimelineByMonth, getTimeline, getTimelineStats } from "@/lib/timeline";
import type { TimelineItem } from "@/lib/timeline";
import { formatDate } from "@/lib/posts";
import { noteToHtml } from "@/lib/markdown";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "时间线",
  description: `${siteConfig.title}的全部内容，按时间倒序排成一条线。`,
};

export default async function TimelinePage() {
  const items = getTimeline();
  const groups = groupTimelineByMonth(items);
  const stats = getTimelineStats(items);

  // 说说正文要渲染成 HTML 再放进卡片，否则 **加粗** 会原样显示星号
  const noteHtml = new Map(
    await Promise.all(
      items
        .filter((item) => item.kind === "note")
        .map(async (item) => [item.note.id, await noteToHtml(item.note.content)] as const),
    ),
  );

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">时间线</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {stats.total > 0
            ? `一共 ${stats.total} 条：${stats.posts} 篇文章、${stats.notes} 条说说。`
            : "还没有内容。"}
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">还没有内容。</p>
      ) : (
        groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-3 px-1 font-mono text-sm text-fg-faint">{group.label}</h2>

            {/* 竖线由容器伪元素画出，最后一个节点不延伸到组外 */}
            <ol className="timeline">
              {group.items.map((item) => (
                <li key={itemKey(item)} className="timeline-item">
                  <TimelineEntry item={item} noteHtml={noteHtml} />
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}

function itemKey(item: TimelineItem): string {
  return item.kind === "post" ? `post-${item.post.slug}` : `note-${item.note.id}`;
}

/** 单条：文章是可点开的卡片，说说直接展示正文 */
function TimelineEntry({
  item,
  noteHtml,
}: {
  item: TimelineItem;
  noteHtml: Map<string, string>;
}) {
  if (item.kind === "post") {
    const { post } = item;

    return (
      <Link href={`/posts/${post.slug}`} className="block">
        <GlassCard hover className="p-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[0.7rem] font-medium text-accent-text">
              文章
            </span>
            <time dateTime={post.date} className="font-mono text-xs text-fg-faint">
              {formatDate(post.date)}
            </time>
          </div>

          <p className="mt-1.5 font-medium">{post.title}</p>

          {post.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{post.summary}</p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent-text"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </GlassCard>
      </Link>
    );
  }

  const { note } = item;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-[color:var(--code-bg)] px-1.5 py-0.5 text-[0.7rem] font-medium text-fg-muted">
          说说
        </span>
        <time dateTime={note.date} className="font-mono text-xs text-fg-faint">
          {formatDate(note.date)}
        </time>
      </div>

      <div
        className="note-body mt-1.5 line-clamp-3 text-sm text-fg"
        dangerouslySetInnerHTML={{ __html: noteHtml.get(note.id) ?? "" }}
      />

      {note.images.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {note.images.slice(0, 4).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="size-14 rounded-lg object-cover"
            />
          ))}
          {note.images.length > 4 && (
            <span className="flex size-14 items-center justify-center rounded-lg bg-[color:var(--code-bg)] text-xs text-fg-faint">
              +{note.images.length - 4}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}