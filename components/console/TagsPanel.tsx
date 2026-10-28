"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import { getFile, getJson, listDir, putFile } from "@/lib/console/github";

/**
 * 标签管理。
 *
 * data/tags.json 只是「写文章时能勾选的选项」，不是标签的唯一真相——
 * 文章 front-matter 里的标签是自由的，删掉预设不会改动任何文章。
 *
 * 所以删除时要说清楚：这个标签还挂在 N 篇文章上，删它只是
 * 以后新文章不再提供这个选项。
 */

const TAGS_PATH = "data/tags.json";
const MAX_SCAN = 60;

export function TagsPanel() {
  const { token, repo } = useSession();

  const [tags, setTags] = useState<string[]>([]);
  const [sha, setSha] = useState<string | null>(null);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  /** 读标签清单 + 统计每篇文章里标签的使用次数 */
  const load = useCallback(async () => {
    try {
      const result = await getJson<{ tags: string[] }>(token, TAGS_PATH, { tags: [] }, repo);
      setTags(Array.isArray(result.data?.tags) ? result.data.tags : []);
      setSha(result.sha);
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取标签失败" });
    } finally {
      setLoading(false);
    }
  }, [token, repo]);

  const scanUsage = useCallback(async () => {
    setScanning(true);
    try {
      const items = await listDir(token, "posts", repo);
      const files = items.filter((i) => i.type === "file" && i.name.endsWith(".md")).slice(0, MAX_SCAN);

      const counts: Record<string, number> = {};

      for (const file of files) {
        const content = await getFile(token, `posts/${file.name}`, repo);
        if (!content) continue;

        // 只取 front-matter 那一段，正文里的 # 不算标签
        const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content.content);
        if (!match) continue;

        const block = match[1];

        // 块状写法
        for (const m of block.matchAll(/^\s+-\s+(.+)$/gm)) {
          const tag = m[1].trim().replace(/^["']|["']$/g, "");
          if (tag) counts[tag] = (counts[tag] ?? 0) + 1;
        }

        // 行内写法 tags: [a, b]
        const inline = /^tags\s*:\s*\[(.*)\]\s*$/m.exec(block);
        if (inline) {
          for (const raw of inline[1].split(",")) {
            const tag = raw.trim().replace(/^["']|["']$/g, "");
            if (tag) counts[tag] = (counts[tag] ?? 0) + 1;
          }
        }
      }

      setUsage(counts);
    } catch {
      // 统计失败不影响编辑，只是不显示次数
    } finally {
      setScanning(false);
    }
  }, [token, repo]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  useEffect(() => {
    void (async () => {
      await scanUsage();
    })();
  }, [scanUsage]);

  async function save(next: string[]) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await putFile(
        token,
        TAGS_PATH,
        JSON.stringify({ tags: next }, null, 2) + "\n",
        "content: 更新标签列表",
        sha ?? undefined,
        repo,
      );
      setTags(next);
      setSha(result.sha);
      setNotice({ tone: "ok", text: "标签列表已提交，约 1 分钟后生效。下次写文章就能用。" });
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  function add() {
    const value = input.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setNotice({ tone: "err", text: `已经有「${value}」了。` });
      return;
    }
    setInput("");
    void save([...tags, value]);
  }

  function remove(tag: string) {
    const count = usage[tag] ?? 0;
    const hint =
      count > 0
        ? `「${tag}」现在还挂在 ${count} 篇文章上。\n删掉只是以后新文章不再提供这个选项，已发布的文章不会变。`
        : `删除标签「${tag}」？`;
    if (!window.confirm(hint)) return;
    void save(tags.filter((t) => t !== tag));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= tags.length) return;
    const next = [...tags];
    [next[index], next[target]] = [next[target], next[index]];
    void save(next);
  }

  if (loading) return <p className="text-sm text-fg-muted">读取中…</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm leading-relaxed text-fg-muted">
        这里是写文章时能勾选的标签选项。删掉一个标签不会改动任何文章——
        文章里的标签是自由的，只是以后新文章不再给你这个选项。
      </p>

      {notice && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            notice.tone === "ok"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-200"
              : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="glass rounded-2xl p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="新标签名，回车添加"
            className="min-w-0 flex-1 rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent-text"
          />
          <button
            type="button"
            onClick={add}
            disabled={busy || !input.trim()}
            className="shrink-0 rounded-lg bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent-text disabled:opacity-50"
          >
            添加
          </button>
        </div>

        <p className="mt-2 text-xs text-fg-faint">
          {scanning ? "正在统计使用情况…" : "数字是当前有多少篇文章用了这个标签。"}
          「上/下」调整的是勾选时的排列顺序。
        </p>
      </div>

      {tags.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          还没有标签。在上面加一个。
        </p>
      ) : (
        <ul className="space-y-1.5">
          {tags.map((tag, index) => {
            const count = usage[tag] ?? 0;
            return (
              <li
                key={tag}
                className="glass flex items-center gap-2 rounded-xl px-3 py-2"
              >
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-text">
                  #{tag}
                </span>

                <span className="text-xs text-fg-faint">
                  {count > 0 ? `${count} 篇在用` : "还没用过"}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`把 ${tag} 上移`}
                    className="rounded px-1.5 py-0.5 text-xs text-fg-faint disabled:opacity-30"
                  >
                    上
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === tags.length - 1}
                    aria-label={`把 ${tag} 下移`}
                    className="rounded px-1.5 py-0.5 text-xs text-fg-faint disabled:opacity-30"
                  >
                    下
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(tag)}
                    disabled={busy}
                    className="ml-1 text-xs text-amber-700 disabled:opacity-40 dark:text-amber-400"
                  >
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}