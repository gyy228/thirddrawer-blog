"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import { deleteFile, getFile, listDir, putFile } from "@/lib/console/github";

/**
 * 选刊审核。
 *
 * 草稿在 digests/drafts/，发布后写到 digests/。
 * 站点的构建只读 digests/ 下 status=published 的文件，
 * drafts 子目录会被忽略（而且它连 .json 后缀的目录项都算不上）。
 */

interface DigestItem {
  id: string;
  title: string;
  url: string;
  source: string;
  topic: string;
  summary: string;
  publishedAt: string | null;
}

interface Digest {
  date: string;
  status: "draft" | "published";
  generatedAt: string;
  itemCount: number;
  items: DigestItem[];
}

export function DigestPanel() {
  const { token, repo } = useSession();

  const [drafts, setDrafts] = useState<Digest[]>([]);
  const [published, setPublished] = useState<string[]>([]);
  const [selected, setSelected] = useState<Digest | null>(null);
  const [draftSha, setDraftSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [draftFiles, rootFiles] = await Promise.all([
        listDir(token, "digests/drafts", repo),
        listDir(token, "digests", repo),
      ]);

      const loaded: Digest[] = [];
      for (const file of draftFiles) {
        if (file.type !== "file" || !file.name.endsWith(".json")) continue;
        const content = await getFile(token, `digests/drafts/${file.name}`, repo);
        if (!content) continue;
        try {
          loaded.push(JSON.parse(content.content) as Digest);
        } catch {
          /* 坏文件跳过 */
        }
      }

      setDrafts(loaded.sort((a, b) => b.date.localeCompare(a.date)));
      setPublished(
        rootFiles
          .filter((f) => f.type === "file" && f.name.endsWith(".json"))
          .map((f) => f.name.replace(/\.json$/, ""))
          .sort()
          .reverse(),
      );
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取失败" });
    } finally {
      setLoading(false);
    }
  }, [token, repo]);

  useEffect(() => {
    // 放进异步 IIFE，避免 react-hooks/set-state-in-effect
    void (async () => {
      await load();
    })();
  }, [load]);

  async function open(date: string) {
    setBusy(true);
    setNotice(null);
    try {
      const file = await getFile(token, `digests/drafts/${date}.json`, repo);
      if (!file) throw new Error("草稿不存在");
      setSelected(JSON.parse(file.content) as Digest);
      setDraftSha(file.sha);
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取失败" });
    } finally {
      setBusy(false);
    }
  }

  function updateItem(id: string, patch: Partial<DigestItem>) {
    if (!selected) return;
    setSelected({
      ...selected,
      items: selected.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    });
  }

  function removeItem(id: string) {
    if (!selected) return;
    setSelected({ ...selected, items: selected.items.filter((it) => it.id !== id) });
  }

  async function saveDraft() {
    if (!selected) return null;
    const payload: Digest = {
      ...selected,
      status: "draft",
      itemCount: selected.items.length,
    };
    const result = await putFile(
      token,
      `digests/drafts/${selected.date}.json`,
      JSON.stringify(payload, null, 2) + "\n",
      `content: 保存 ${selected.date} 选刊草稿`,
      draftSha ?? undefined,
      repo,
    );
    setDraftSha(result.sha);
    return payload;
  }

  async function handleSave() {
    if (!selected) return;
    setBusy(true);
    setNotice(null);
    try {
      await saveDraft();
      setNotice({ tone: "ok", text: "草稿已保存。" });
      await load();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (!selected) return;
    if (selected.items.length === 0) {
      setNotice({ tone: "err", text: "一条都没有，不能发布。" });
      return;
    }
    for (const item of selected.items) {
      if (!/^https?:\/\//i.test(item.url)) {
        setNotice({ tone: "err", text: `「${item.title}」的链接不对。` });
        return;
      }
    }

    setBusy(true);
    setNotice(null);
    try {
      await saveDraft();

      const published: Digest = {
        ...selected,
        status: "published",
        itemCount: selected.items.length,
      };

      // 已发布文件可能已存在，先取 sha 再覆盖
      const existing = await getFile(token, `digests/${selected.date}.json`, repo);

      await putFile(
        token,
        `digests/${selected.date}.json`,
        JSON.stringify(published, null, 2) + "\n",
        `content: 发布 ${selected.date} 选刊`,
        existing?.sha,
        repo,
      );

      setNotice({ tone: "ok", text: "已发布，约 1 分钟后出现在 /digest 页面。" });
      await load();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "发布失败" });
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    if (!published.length) return;
    const date = window.prompt(`要下架哪一期？输入日期，例如 ${published[0]}`, published[0]);
    if (!date) return;

    setBusy(true);
    try {
      const file = await getFile(token, `digests/${date}.json`, repo);
      if (!file) throw new Error("没有这一期");
      await deleteFile(token, `digests/${date}.json`, file.sha, `content: 下架 ${date} 选刊`, repo);
      setNotice({ tone: "ok", text: `${date} 已下架。` });
      await load();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "下架失败" });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-2 py-1 text-sm outline-none focus:border-accent-text";

  if (loading) return <p className="text-sm text-fg-muted">读取中…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
      <aside className="space-y-2">
        <p className="px-1 text-xs text-fg-faint">待审核</p>
        {drafts.length === 0 ? (
          <p className="px-1 text-sm text-fg-muted">没有草稿。</p>
        ) : (
          <ul className="space-y-1">
            {drafts.map((d) => (
              <li key={d.date}>
                <button
                  type="button"
                  onClick={() => void open(d.date)}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-left font-mono text-sm ${
                    selected?.date === d.date
                      ? "bg-accent-soft text-accent-text"
                      : "text-fg-muted hover:bg-[color:var(--code-bg)]"
                  }`}
                >
                  {d.date}
                  <span className="ml-2 text-xs">{d.items.length} 条</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="px-1 pt-3 text-xs text-fg-faint">已发布</p>
        {published.length === 0 ? (
          <p className="px-1 text-sm text-fg-muted">还没有。</p>
        ) : (
          <>
            {published.map((date) => (
              <p key={date} className="px-2.5 font-mono text-xs text-fg-muted">
                {date}
              </p>
            ))}
            <button
              type="button"
              onClick={() => void handleUnpublish()}
              className="px-2.5 pt-1 text-xs text-amber-700 dark:text-amber-400"
            >
              下架某一期
            </button>
          </>
        )}
      </aside>

      <section className="min-w-0 space-y-3">
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

        {!selected ? (
          <div className="glass space-y-2 rounded-2xl p-6 text-sm text-fg-muted">
            <p>左边选一期待审核的选刊。</p>
            <p className="text-xs text-fg-faint">
              草稿由 digest-tool 或 GitHub Actions 每天生成，生成后出现在这里。
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-mono text-lg">{selected.date}</h2>
              <span className="text-sm text-fg-muted">{selected.items.length} 条</span>

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={busy}
                  className="rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted disabled:opacity-50"
                >
                  保存草稿
                </button>
                <button
                  type="button"
                  onClick={() => void handlePublish()}
                  disabled={busy || selected.items.length === 0}
                  className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-text disabled:opacity-50"
                >
                  {busy ? "处理中…" : "审核通过并发布"}
                </button>
              </div>
            </div>

            <ul className="space-y-3">
              {selected.items.map((item, index) => (
                <li key={item.id} className="glass space-y-2 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-[color:var(--code-bg)] px-1.5 py-0.5">{index + 1}</span>
                    <span className="text-accent-text">{item.topic}</span>
                    <span className="text-fg-faint">{item.source}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-accent-text underline"
                    >
                      看原文
                    </a>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-amber-700 dark:text-amber-400"
                    >
                      删除
                    </button>
                  </div>

                  <input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className={`${field} font-medium`}
                  />

                  <textarea
                    value={item.summary}
                    onChange={(e) => updateItem(item.id, { summary: e.target.value })}
                    rows={3}
                    className={`${field} resize-y leading-relaxed`}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}