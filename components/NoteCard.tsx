import type { Note } from "@/lib/notes";
import { noteToHtml } from "@/lib/markdown";

/** 把 YYYY-MM-DD 显示成更口语的样子 */
function formatNoteDate(date: string): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${Number(month)} 月 ${Number(day)} 日`;
}

/**
 * 一条说说。
 *
 * 服务端组件：正文在这里就渲染成 HTML，页面是纯静态的。
 * 图片用原生 img 而不是 next/image —— 静态导出下 next/image 需要额外配置
 * loader，而这里的图已经是站点本地的静态资源，没有优化空间。
 */
export async function NoteCard({ note }: { note: Note }) {
  const html = await noteToHtml(note.content);
  const hasImages = note.images.length > 0;

  return (
    <article className="glass rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div
          className="note-body min-w-0 flex-1 text-[0.95rem] leading-relaxed text-fg"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {note.date && (
          <time
            dateTime={note.date}
            className="shrink-0 pt-0.5 font-mono text-xs text-fg-faint"
            title={note.date}
          >
            {formatNoteDate(note.date)}
          </time>
        )}
      </div>

      {hasImages && (
        <div
          className={`mt-3 grid gap-2 ${
            note.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {note.images.map((src) => (
            <a
              key={src}
              href={src}
              className="block overflow-hidden rounded-xl border border-[color:var(--glass-brd)]"
              // 点开看原图，不依赖灯箱脚本
              target="_blank"
              rel="noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}