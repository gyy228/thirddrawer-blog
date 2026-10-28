"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import {
  deleteFile,
  fileToBase64,
  getJson,
  listDir,
  putBinaryFile,
  putFile,
} from "@/lib/console/github";

interface Photo {
  name: string;
  sha: string;
  size: number;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const CAPTIONS_PATH = "public/photos/captions.json";
const MAX_BYTES = 20 * 1024 * 1024;

export function PhotosPanel() {
  const { token, repo } = useSession();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [captionsSha, setCaptionsSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const [items, cap] = await Promise.all([
        listDir(token, "public/photos", repo),
        getJson<Record<string, string>>(token, CAPTIONS_PATH, {}, repo),
      ]);

      setPhotos(
        items
          .filter((item) => item.type === "file" && IMAGE_EXT.test(item.name))
          .sort((a, b) => (a.name < b.name ? 1 : -1))
          .map((item) => ({ name: item.name, sha: item.sha, size: item.size })),
      );
      setCaptions(cap.data ?? {});
      setCaptionsSha(cap.sha);
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

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setNotice(null);

    let ok = 0;
    const failed: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        failed.push(`${file.name} 超过 20 MB`);
        continue;
      }
      if (!IMAGE_EXT.test(file.name) && !file.type.startsWith("image/")) {
        failed.push(`${file.name} 不是图片`);
        continue;
      }

      try {
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        await putBinaryFile(
          token,
          `public/photos/${name}`,
          await fileToBase64(file),
          `content: 上传照片 ${name}`,
          undefined,
          repo,
        );
        ok += 1;
      } catch (e) {
        failed.push(`${file.name}：${e instanceof Error ? e.message : "失败"}`);
      }
    }

    setUploading(false);
    setNotice({
      tone: failed.length > 0 ? "err" : "ok",
      text:
        (ok > 0 ? `已上传 ${ok} 张，约 1 分钟后出现在照片墙。` : "") +
        (failed.length > 0 ? ` 失败：${failed.join("；")}` : ""),
    });
    await load();
  }

  async function saveCaptions(next: Record<string, string>) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await putFile(
        token,
        CAPTIONS_PATH,
        JSON.stringify(next, null, 2) + "\n",
        "content: 更新照片说明",
        captionsSha ?? undefined,
        repo,
      );
      setCaptions(next);
      setCaptionsSha(result.sha);
      setNotice({ tone: "ok", text: "说明已提交。" });
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(photo: Photo) {
    if (!window.confirm(`删除 ${photo.name}？`)) return;

    setBusy(true);
    setNotice(null);
    try {
      await deleteFile(token, `public/photos/${photo.name}`, photo.sha, `content: 删除照片 ${photo.name}`, repo);

      // 说明文字也一起清掉
      if (captions[photo.name] !== undefined) {
        const next = { ...captions };
        delete next[photo.name];
        await saveCaptions(next);
      }

      setNotice({ tone: "ok", text: "已删除。" });
      await load();
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "删除失败" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-fg-muted">读取中…</p>;

  return (
    <div className="space-y-4">
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
        <label className="cursor-pointer text-sm text-accent-text">
          {uploading ? "上传中…" : "选择图片上传（可多选，单张 ≤ 20 MB）"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => void upload(e.target.files)}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">照片墙还是空的。</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const caption = captions[photo.name] ?? "";
            return (
              <li key={photo.name} className="glass overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/thirddrawer-blog/photos/${encodeURIComponent(photo.name)}`}
                  alt={caption || photo.name}
                  className="h-40 w-full object-cover"
                />

                <div className="space-y-2 p-3">
                  <p className="truncate font-mono text-xs text-fg-faint">
                    {photo.name} · {(photo.size / 1024).toFixed(0)} KB
                  </p>

                  <input
                    defaultValue={caption}
                    placeholder="写一句说明（可选）"
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value === caption) return;
                      const next = { ...captions };
                      if (value) next[photo.name] = value;
                      else delete next[photo.name];
                      void saveCaptions(next);
                    }}
                    className="w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-2 py-1 text-sm outline-none focus:border-accent-text"
                  />

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-fg-faint">改动离开输入框即保存</span>
                    <button
                      type="button"
                      onClick={() => void remove(photo)}
                      disabled={busy}
                      className="ml-auto text-xs text-amber-700 dark:text-amber-400"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}