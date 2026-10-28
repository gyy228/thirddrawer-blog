"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "./SessionProvider";
import { deleteFile, getFile, getJson, listDir, putFile } from "@/lib/console/github";
import type { FileEntry } from "@/lib/console/github";
import {
  buildFrontMatter,
  parseFrontMatter,
  slugifyTitle,
} from "@/lib/console/frontmatter";
import { markdownToHtml } from "@/lib/markdown";

interface Draft {
  slug: string;
  title: string;
  date: string;
  /** 标签改成数组：控制台里是勾选，不是手写 */
  tags: string[];
  summary: string;
  draft: boolean;
  body: string;
  /** 已存在文件的 sha；新建时为 null */
  sha: string | null;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function emptyDraft(): Draft {
  return {
    slug: "",
    title: "",
    date: today(),
    tags: [],
    summary: "",
    draft: true,
    body: "",
    sha: null,
  };
}

export function PostsPanel() {
  const { token, repo } = useSession();

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [presetTags, setPresetTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // 预设标签来自仓库里的 data/tags.json，和归档页筛选用的是同一份
  useEffect(() => {
    void (async () => {
      try {
        const result = await getJson<{ tags: string[] }>(
          token,
          "data/tags.json",
          { tags: [] },
          repo,
        );
        setPresetTags(Array.isArray(result.data?.tags) ? result.data.tags : []);
      } catch {
        // 读不到就不显示预设，手写输入仍然可用
        setPresetTags([]);
      }
    })();
  }, [token, repo]);

  const loadList = useCallback(async () => {
    // 刻意不在开头同步 setState：那会触发 react-hooks/set-state-in-effect，
    // 而且初始值本来就是 loading=true，第一次不需要再设一遍。
    try {
      const items = await listDir(token, "posts", repo);
      setFiles(
        items
          .filter((item) => item.type === "file" && item.name.endsWith(".md"))
          .sort((a, b) => (a.name < b.name ? 1 : -1)),
      );
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取列表失败" });
    } finally {
      setLoadingList(false);
    }
  }, [token, repo]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await loadList();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadList]);

  // 预览：跟站点用同一套渲染器，所见即所得
  useEffect(() => {
    if (!showPreview || !draft) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const html = await markdownToHtml(draft.body);
        if (!cancelled) setPreview(html);
      } catch {
        if (!cancelled) setPreview("<p>预览渲染失败</p>");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft, showPreview]);

  async function open(slug: string) {
    setBusy(true);
    setNotice(null);
    try {
      const file = await getFile(token, `posts/${slug}.md`, repo);
      if (!file) throw new Error("文件不存在");

      const { data, body } = parseFrontMatter(file.content);
      setDraft({
        slug,
        title: String(data.title ?? ""),
        date: String(data.date ?? "").slice(0, 10) || today(),
        tags: Array.isArray(data.tags)
          ? data.tags.map(String)
          : String(data.tags ?? "")
              .split(/[,，]/)
              .map((t) => t.trim())
              .filter(Boolean),
        summary: String(data.summary ?? ""),
        draft: Boolean(data.draft),
        body: body.replace(/^\n+/, ""),
        sha: file.sha,
      });
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取失败" });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft) return;

    const title = draft.title.trim();
    if (!title) {
      setNotice({ tone: "err", text: "标题不能为空" });
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      // slug 只在新建时从标题生成；已存在的文章不改地址，避免链接失效
      const slug = draft.slug || slugifyTitle(title);

      const content = buildFrontMatter(
        {
          title,
          date: draft.date,
          tags: draft.tags,
          summary: draft.summary.trim(),
          draft: draft.draft,
        },
        draft.body,
      );

      const result = await putFile(
        token,
        `posts/${slug}.md`,
        content,
        draft.sha ? `content: 更新《${title}》` : `content: 新增《${title}》`,
        draft.sha ?? undefined,
        repo,
      );

      setDraft({
        ...draft,
        slug,
        title,
        tags: draft.tags,
        sha: result.sha,
      });

      setNotice({
        tone: "ok",
        text: draft.draft
          ? `已提交（草稿，线上不会显示）。约 1 分钟后构建完成。`
          : `已提交。GitHub Actions 正在重新部署，约 1 分钟上线。`,
      });

      await loadList();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!draft?.sha || !draft.slug) return;
    if (!window.confirm(`删除《${draft.title || draft.slug}》？\n会直接从仓库删掉这个文件。`)) {
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      await deleteFile(
        token,
        `posts/${draft.slug}.md`,
        draft.sha,
        `content: 删除《${draft.title || draft.slug}》`,
        repo,
      );
      setDraft(null);
      setNotice({ tone: "ok", text: "已删除。约 1 分钟后线上消失。" });
      await loadList();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "删除失败" });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent-text";

  const noticeBox = useMemo(() => {
    if (!notice) return null;
    return (
      <p
        className={`rounded-lg border px-3 py-2 text-sm ${
          notice.tone === "ok"
            ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-200"
            : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200"
        }`}
      >
        {notice.text}
      </p>
    );
  }, [notice]);

  return (
    <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
      <aside className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft());
            setNotice(null);
          }}
          className="w-full rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent-text"
        >
          + 新文章
        </button>

        {loadingList ? (
          <p className="px-1 text-sm text-fg-muted">读取中…</p>
        ) : files.length === 0 ? (
          <p className="px-1 text-sm text-fg-muted">还没有文章。</p>
        ) : (
          <ul className="space-y-1">
            {files.map((file) => {
              const slug = file.name.replace(/\.md$/, "");
              const active = draft?.slug === slug;
              return (
                <li key={file.sha}>
                  <button
                    type="button"
                    onClick={() => void open(slug)}
                    className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left text-sm ${
                      active
                        ? "bg-accent-soft text-accent-text"
                        : "text-fg-muted hover:bg-[color:var(--code-bg)]"
                    }`}
                    title={slug}
                  >
                    {slug}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="min-w-0 space-y-3">
        {noticeBox}

        {!draft ? (
          <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
            左边选一篇，或者点「新文章」。
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-fg-muted">标题</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={field}
                />
              </label>
              <label className="block text-sm">
                <span className="text-fg-muted">日期</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-fg-muted">摘要（列表页显示的一句）</span>
              <input
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                className={field}
              />
            </label>

            <div className="text-sm">
              <span className="text-fg-muted">标签（点一下选中，可多选）</span>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {/* 预设 + 本文已有但预设里没有的，一起列出，避免历史标签丢失 */}
                {[...new Set([...presetTags, ...draft.tags])].map((tag) => {
                  const active = draft.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          tags: active
                            ? draft.tags.filter((t) => t !== tag)
                            : [...draft.tags, tag],
                        })
                      }
                      className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                        active
                          ? "bg-accent-text text-white"
                          : "bg-[color:var(--code-bg)] text-fg-muted hover:text-fg"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}

                {presetTags.length === 0 && (
                  <span className="text-xs text-fg-faint">
                    没读到 data/tags.json，可以手动加
                  </span>
                )}
              </div>

              {/* 预设不够用时才用这个，平时不用碰 */}
              <div className="mt-2 flex gap-1.5">
                <input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    const value = customTag.trim();
                    if (!value || draft.tags.includes(value)) {
                      setCustomTag("");
                      return;
                    }
                    setDraft({ ...draft, tags: [...draft.tags, value] });
                    setCustomTag("");
                  }}
                  placeholder="预设里没有？在这里加一个，回车确认"
                  className="min-w-0 flex-1 rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-2.5 py-1 text-xs outline-none focus:border-accent-text"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2 text-fg-muted">
                <input
                  type="checkbox"
                  checked={draft.draft}
                  onChange={(e) => setDraft({ ...draft, draft: e.target.checked })}
                  className="size-4"
                />
                存为草稿（不发布）
              </label>

              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="text-accent-text"
              >
                {showPreview ? "关闭预览" : "预览"}
              </button>

              {draft.slug && (
                <a
                  href={`/posts/${draft.slug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg-faint underline"
                >
                  看线上
                </a>
              )}
            </div>

            <div className={showPreview ? "grid gap-3 xl:grid-cols-2" : ""}>
              <label className="block text-sm">
                <span className="text-fg-muted">正文（Markdown）</span>
                <textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  rows={22}
                  spellCheck={false}
                  className="mt-1 w-full resize-y rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-accent-text"
                />
              </label>

              {showPreview && (
                <div className="rounded-lg border border-[color:var(--glass-brd)] p-4">
                  <p className="mb-2 text-xs text-fg-faint">预览（与线上同一套渲染）</p>
                  <article
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text disabled:opacity-50"
              >
                {busy ? "处理中…" : draft.sha ? "保存修改" : "创建文章"}
              </button>

              {draft.sha && (
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={busy}
                  className="rounded-lg border border-[color:var(--glass-brd)] px-4 py-2 text-sm text-fg-muted disabled:opacity-50"
                >
                  删除
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}