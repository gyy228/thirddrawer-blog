"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import {
  deleteFile,
  fileToBase64,
  getFile,
  listDir,
  putBinaryFile,
  putFile,
} from "@/lib/console/github";
import type { FileEntry } from "@/lib/console/github";
import { buildFrontMatter, parseFrontMatter } from "@/lib/console/frontmatter";

interface NoteDraft {
  id: string;
  date: string;
  content: string;
  images: string[];
  draft: boolean;
  sha: string | null;
}

const BASE_PATH = "/thirddrawer-blog";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function emptyNote(existing: string[]): NoteDraft {
  const date = today();
  let index = 1;
  while (existing.includes(`${date}-${String(index).padStart(2, "0")}`)) index += 1;

  return {
    id: `${date}-${String(index).padStart(2, "0")}`,
    date,
    content: "",
    images: [],
    draft: true,
    sha: null,
  };
}

export function NotesPanel() {
  const { token, repo } = useSession();

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<NoteDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const loadList = useCallback(async () => {
    try {
      const items = await listDir(token, "posts/notes", repo);
      setFiles(
        items
          .filter((item) => item.type === "file" && item.name.endsWith(".md"))
          .sort((a, b) => (a.name < b.name ? 1 : -1)),
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
      await loadList();
    })();
  }, [loadList]);

  async function open(id: string) {
    setBusy(true);
    setNotice(null);
    try {
      const file = await getFile(token, `posts/notes/${id}.md`, repo);
      if (!file) throw new Error("说说文件不存在");

      const { data, body } = parseFrontMatter(file.content);
      setNote({
        id,
        date: String(data.date ?? "").slice(0, 10) || today(),
        content: body.replace(/^\n+/, ""),
        images: Array.isArray(data.images) ? data.images.map(String) : [],
        draft: Boolean(data.draft),
        sha: file.sha,
      });
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取失败" });
    } finally {
      setBusy(false);
    }
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0 || !note) return;

    setUploading(true);
    setNotice(null);

    const added: string[] = [];
    const failed: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        failed.push(`${file.name} 超过 20 MB`);
        continue;
      }
      try {
        const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
        const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const base64 = await fileToBase64(file);

        await putBinaryFile(
          token,
          `public/images/${name}`,
          base64,
          `content: 上传说说配图 ${name}`,
          undefined,
          repo,
        );
        added.push(`${BASE_PATH}/images/${name}`);
      } catch (e) {
        failed.push(`${file.name}：${e instanceof Error ? e.message : "失败"}`);
      }
    }

    setNote({ ...note, images: [...note.images, ...added] });
    setUploading(false);

    setNotice({
      tone: failed.length > 0 ? "err" : "ok",
      text:
        (added.length > 0 ? `已上传 ${added.length} 张（记得点保存把地址写进说说）。` : "") +
        (failed.length > 0 ? ` 失败：${failed.join("；")}` : ""),
    });
  }

  async function save() {
    if (!note) return;
    if (!note.id.trim()) {
      setNotice({ tone: "err", text: "文件名不能为空" });
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      const content = buildFrontMatter(
        {
          date: note.date,
          images: note.images,
          draft: note.draft,
        },
        `\n${note.content.trim()}\n`,
      );

      const result = await putFile(
        token,
        `posts/notes/${note.id}.md`,
        content,
        note.sha ? "content: 更新说说" : "content: 新增说说",
        note.sha ?? undefined,
        repo,
      );

      setNote({ ...note, sha: result.sha });
      setNotice({
        tone: "ok",
        text: note.draft
          ? "已保存为草稿（线上不显示，配图也不会进照片墙）"
          : "已保存，约 1 分钟后上线。配图会自动出现在照片墙。",
      });
      await loadList();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!note?.sha) return;
    if (!window.confirm(`删除说说 ${note.id}？`)) return;

    setBusy(true);
    try {
      await deleteFile(token, `posts/notes/${note.id}.md`, note.sha, "content: 删除说说", repo);
      setNote(null);
      setNotice({ tone: "ok", text: "已删除。" });
      await loadList();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "删除失败" });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent-text";

  return (
    <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
      <aside className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setNote(emptyNote(files.map((f) => f.name.replace(/\.md$/, ""))));
            setNotice(null);
          }}
          className="w-full rounded-lg bg-accent-soft px-3 py-2 text-sm font-medium text-accent-text"
        >
          + 新说说
        </button>

        {loading ? (
          <p className="px-1 text-sm text-fg-muted">读取中…</p>
        ) : (
          <ul className="space-y-1">
            {files.map((file) => {
              const id = file.name.replace(/\.md$/, "");
              return (
                <li key={file.sha}>
                  <button
                    type="button"
                    onClick={() => void open(id)}
                    className={`w-full truncate rounded-lg px-2.5 py-1.5 text-left font-mono text-sm ${
                      note?.id === id
                        ? "bg-accent-soft text-accent-text"
                        : "text-fg-muted hover:bg-[color:var(--code-bg)]"
                    }`}
                  >
                    {id}
                  </button>
                </li>
              );
            })}
          </ul>
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

        {!note ? (
          <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
            左边选一条，或者点「新说说」。
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-fg-muted">文件名（也是排序依据）</span>
                <input
                  value={note.id}
                  onChange={(e) => setNote({ ...note, id: e.target.value.trim() })}
                  className={`${field} font-mono`}
                  disabled={Boolean(note.sha)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-fg-muted">日期</span>
                <input
                  type="date"
                  value={note.date}
                  onChange={(e) => setNote({ ...note, date: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-fg-muted">正文</span>
              <textarea
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
                rows={5}
                className="mt-1 w-full resize-y rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent-text"
              />
            </label>

            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-fg-muted">
                  <input
                    type="checkbox"
                    checked={note.draft}
                    onChange={(e) => setNote({ ...note, draft: e.target.checked })}
                    className="size-4"
                  />
                  存为草稿
                </label>

                <label className="cursor-pointer text-accent-text">
                  {uploading ? "上传中…" : "添加图片"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => void uploadImages(e.target.files)}
                  />
                </label>
              </div>

              {note.images.length > 0 && (
                <ul className="space-y-1">
                  {note.images.map((url, index) => (
                    <li key={url} className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="size-12 rounded object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg-faint">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNote({
                            ...note,
                            images: note.images.filter((_, i) => i !== index),
                          })
                        }
                        className="text-xs text-amber-700 dark:text-amber-400"
                      >
                        移除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-fg-faint">
                图片先传到仓库的 public/images/，保存说说时才把地址写进去。
                已发布的说说，配图会自动复制一份进照片墙。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={busy}
                className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text disabled:opacity-50"
              >
                {busy ? "处理中…" : note.sha ? "保存修改" : "创建说说"}
              </button>
              {note.sha && (
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