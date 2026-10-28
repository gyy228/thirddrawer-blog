"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./SessionProvider";
import { getJson, putFile } from "@/lib/console/github";

/**
 * 项目 / 友链 / 关于页的编辑面板。
 *
 * 这三份数据都在 data/*.json，结构不同但操作相同：
 * 整份读出来 → 改 → 整份写回。写回前做一次校验，不合格不提交。
 */

type Kind = "projects" | "friends" | "about";

interface Project {
  slug: string;
  name: string;
  description: string;
  detail?: string;
  url?: string;
  repo?: string;
  stack: string[];
  status: "active" | "wip" | "archived";
  year: number;
}

interface FriendLink {
  slug: string;
  name: string;
  url: string;
  avatar?: string;
  description: string;
}

interface FriendsData {
  links: FriendLink[];
  siteInfo: { name: string; url: string; description: string; avatar?: string };
  applyInfo: { email: string; note: string };
}

interface AboutData {
  intro: string;
  stack: string[];
}

const field =
  "mt-1 w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent-text";

export function DataPanel({ kind }: { kind: Kind }) {
  const { token, repo } = useSession();

  const [raw, setRaw] = useState<unknown>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const fallback =
        kind === "projects"
          ? []
          : kind === "friends"
            ? { links: [], siteInfo: { name: "", url: "", description: "" }, applyInfo: { email: "", note: "" } }
            : { intro: "", stack: [] };

      const result = await getJson<unknown>(token, `data/${kind}.json`, fallback, repo);
      setRaw(result.data);
      setSha(result.sha);
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "读取失败" });
    } finally {
      setLoading(false);
    }
  }, [kind, token, repo]);

  useEffect(() => {
    // 放进异步 IIFE 再调用：直接写 void load() 会被
    // react-hooks/set-state-in-effect 判成「effect 内同步 setState」。
    void (async () => {
      await load();
    })();
  }, [load]);

  async function save(data: unknown) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await putFile(
        token,
        `data/${kind}.json`,
        JSON.stringify(data, null, 2) + "\n",
        `content: 更新 ${kind}.json`,
        sha ?? undefined,
        repo,
      );
      setSha(result.sha);
      setRaw(data);
      setNotice({ tone: "ok", text: "已提交，约 1 分钟后上线。" });
    } catch (e) {
      setNotice({ tone: "err", text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  }

  const noticeBox = notice && (
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

  if (loading) return <p className="text-sm text-fg-muted">读取中…</p>;

  if (kind === "projects") {
    return (
      <ProjectsEditor
        projects={(raw as Project[]) ?? []}
        busy={busy}
        notice={noticeBox}
        onSave={(list) => void save(list)}
        onChange={(list) => setRaw(list)}
      />
    );
  }

  if (kind === "friends") {
    return (
      <FriendsEditor
        data={(raw as FriendsData) ?? { links: [], siteInfo: { name: "", url: "", description: "" }, applyInfo: { email: "", note: "" } }}
        busy={busy}
        notice={noticeBox}
        onSave={(d) => void save(d)}
        onChange={(d) => setRaw(d)}
      />
    );
  }

  return (
    <AboutEditor
      data={(raw as AboutData) ?? { intro: "", stack: [] }}
      busy={busy}
      notice={noticeBox}
      onSave={(d) => void save(d)}
      onChange={(d) => setRaw(d)}
    />
  );
}

/* ── 项目 ─────────────────────────────────────── */

function ProjectsEditor({
  projects,
  busy,
  notice,
  onSave,
  onChange,
}: {
  projects: Project[];
  busy: boolean;
  notice: React.ReactNode;
  onSave: (list: Project[]) => void;
  onChange: (list: Project[]) => void;
}) {
  function update(index: number, patch: Partial<Project>) {
    onChange(projects.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function validate(): string | null {
    const seen = new Set<string>();
    for (const p of projects) {
      if (!/^[a-z0-9][a-z0-9-]*$/i.test(p.slug)) return `slug 只能用字母数字和连字符：${p.slug}`;
      if (seen.has(p.slug)) return `slug 重复：${p.slug}`;
      seen.add(p.slug);
      if (!p.name.trim()) return "有项目缺少名称";
      if (!p.description.trim()) return `「${p.name}」缺少一句话说明`;
    }
    return null;
  }

  const error = validate();

  return (
    <div className="space-y-3">
      {notice}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...projects,
            {
              slug: `project-${Date.now().toString(36)}`,
              name: "",
              description: "",
              stack: [],
              status: "active",
              year: new Date().getFullYear(),
            },
          ])
        }
        className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm text-accent-text"
      >
        + 新增项目
      </button>

      <ul className="space-y-3">
        {projects.map((p, index) => (
          <li key={index} className="glass space-y-2 rounded-2xl p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-fg-muted">名称</span>
                <input value={p.name} onChange={(e) => update(index, { name: e.target.value })} className={field} />
              </label>
              <label className="text-sm">
                <span className="text-fg-muted">slug</span>
                <input value={p.slug} onChange={(e) => update(index, { slug: e.target.value })} className={`${field} font-mono`} />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-fg-muted">一句话说明</span>
              <input value={p.description} onChange={(e) => update(index, { description: e.target.value })} className={field} />
            </label>

            <label className="block text-sm">
              <span className="text-fg-muted">详细介绍（可选）</span>
              <textarea value={p.detail ?? ""} onChange={(e) => update(index, { detail: e.target.value })} rows={2} className={field} />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-fg-muted">线上地址</span>
                <input value={p.url ?? ""} onChange={(e) => update(index, { url: e.target.value })} className={field} />
              </label>
              <label className="text-sm">
                <span className="text-fg-muted">源码地址</span>
                <input value={p.repo ?? ""} onChange={(e) => update(index, { repo: e.target.value })} className={field} />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-sm">
                <span className="text-fg-muted">技术栈（逗号分隔）</span>
                <input
                  value={p.stack.join(", ")}
                  onChange={(e) =>
                    update(index, {
                      stack: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className={field}
                />
              </label>
              <label className="text-sm">
                <span className="text-fg-muted">状态</span>
                <select
                  value={p.status}
                  onChange={(e) => update(index, { status: e.target.value as Project["status"] })}
                  className={field}
                >
                  <option value="active">维护中</option>
                  <option value="wip">开发中</option>
                  <option value="archived">已归档</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="text-fg-muted">年份</span>
                <input
                  type="number"
                  value={p.year}
                  onChange={(e) => update(index, { year: Number(e.target.value) })}
                  className={field}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => onChange(projects.filter((_, i) => i !== index))}
              className="text-xs text-amber-700 dark:text-amber-400"
            >
              删除这个项目
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>}

      <button
        type="button"
        onClick={() => onSave(projects)}
        disabled={busy || Boolean(error)}
        className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text disabled:opacity-50"
      >
        {busy ? "提交中…" : "保存并发布"}
      </button>
    </div>
  );
}

/* ── 友链 ─────────────────────────────────────── */

function FriendsEditor({
  data,
  busy,
  notice,
  onSave,
  onChange,
}: {
  data: FriendsData;
  busy: boolean;
  notice: React.ReactNode;
  onSave: (d: FriendsData) => void;
  onChange: (d: FriendsData) => void;
}) {
  function updateLink(index: number, patch: Partial<FriendLink>) {
    onChange({
      ...data,
      links: data.links.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });
  }

  const badUrl = data.links.find((l) => !/^https?:\/\//i.test(l.url));

  return (
    <div className="space-y-4">
      {notice}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...data,
            links: [
              ...data.links,
              { slug: `friend-${Date.now().toString(36)}`, name: "", url: "", description: "" },
            ],
          })
        }
        className="rounded-lg bg-accent-soft px-3 py-1.5 text-sm text-accent-text"
      >
        + 新增友链
      </button>

      <ul className="space-y-3">
        {data.links.map((l, index) => (
          <li key={index} className="glass space-y-2 rounded-2xl p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-fg-muted">站名</span>
                <input value={l.name} onChange={(e) => updateLink(index, { name: e.target.value })} className={field} />
              </label>
              <label className="text-sm">
                <span className="text-fg-muted">slug</span>
                <input value={l.slug} onChange={(e) => updateLink(index, { slug: e.target.value })} className={`${field} font-mono`} />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-fg-muted">站点地址（必须带 https://）</span>
              <input value={l.url} onChange={(e) => updateLink(index, { url: e.target.value })} className={field} />
            </label>

            <label className="block text-sm">
              <span className="text-fg-muted">头像地址（可选）</span>
              <input value={l.avatar ?? ""} onChange={(e) => updateLink(index, { avatar: e.target.value })} className={field} />
            </label>

            <label className="block text-sm">
              <span className="text-fg-muted">一句话介绍</span>
              <input value={l.description} onChange={(e) => updateLink(index, { description: e.target.value })} className={field} />
            </label>

            <button
              type="button"
              onClick={() => onChange({ ...data, links: data.links.filter((_, i) => i !== index) })}
              className="text-xs text-amber-700 dark:text-amber-400"
            >
              删除这条友链
            </button>
          </li>
        ))}
      </ul>

      <section className="glass space-y-2 rounded-2xl p-4">
        <h3 className="text-sm font-medium">本站信息</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-fg-muted">站名</span>
            <input
              value={data.siteInfo.name}
              onChange={(e) => onChange({ ...data, siteInfo: { ...data.siteInfo, name: e.target.value } })}
              className={field}
            />
          </label>
          <label className="text-sm">
            <span className="text-fg-muted">站点地址</span>
            <input
              value={data.siteInfo.url}
              onChange={(e) => onChange({ ...data, siteInfo: { ...data.siteInfo, url: e.target.value } })}
              className={field}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-fg-muted">站点简介</span>
          <input
            value={data.siteInfo.description}
            onChange={(e) => onChange({ ...data, siteInfo: { ...data.siteInfo, description: e.target.value } })}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">头像地址</span>
          <input
            value={data.siteInfo.avatar ?? ""}
            onChange={(e) => onChange({ ...data, siteInfo: { ...data.siteInfo, avatar: e.target.value } })}
            className={field}
          />
        </label>
      </section>

      <section className="glass space-y-2 rounded-2xl p-4">
        <h3 className="text-sm font-medium">申请方式</h3>
        <label className="block text-sm">
          <span className="text-fg-muted">接收邮箱</span>
          <input
            value={data.applyInfo.email}
            onChange={(e) => onChange({ ...data, applyInfo: { ...data.applyInfo, email: e.target.value } })}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="text-fg-muted">附加说明</span>
          <textarea
            value={data.applyInfo.note}
            onChange={(e) => onChange({ ...data, applyInfo: { ...data.applyInfo, note: e.target.value } })}
            rows={2}
            className={field}
          />
        </label>
      </section>

      {badUrl && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          「{badUrl.name || badUrl.slug}」的地址必须以 http:// 或 https:// 开头。
        </p>
      )}

      <button
        type="button"
        onClick={() => onSave(data)}
        disabled={busy || Boolean(badUrl)}
        className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text disabled:opacity-50"
      >
        {busy ? "提交中…" : "保存并发布"}
      </button>
    </div>
  );
}

/* ── 关于页 ───────────────────────────────────── */

function AboutEditor({
  data,
  busy,
  notice,
  onSave,
  onChange,
}: {
  data: AboutData;
  busy: boolean;
  notice: React.ReactNode;
  onSave: (d: AboutData) => void;
  onChange: (d: AboutData) => void;
}) {
  return (
    <div className="space-y-3">
      {notice}

      <label className="block text-sm">
        <span className="text-fg-muted">「这是什么」正文</span>
        <textarea
          value={data.intro}
          onChange={(e) => onChange({ ...data, intro: e.target.value })}
          rows={5}
          className={field}
        />
      </label>

      <label className="block text-sm">
        <span className="text-fg-muted">建站技术栈（逗号分隔）</span>
        <input
          value={data.stack.join(", ")}
          onChange={(e) =>
            onChange({
              ...data,
              stack: e.target.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
            })
          }
          className={`${field} font-mono`}
        />
      </label>

      <p className="text-xs text-fg-faint">
        「关于我」那段用的是站点配置里的个人简介，不在这里改。
      </p>

      <button
        type="button"
        onClick={() => onSave(data)}
        disabled={busy || !data.intro.trim()}
        className="rounded-lg bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text disabled:opacity-50"
      >
        {busy ? "提交中…" : "保存并发布"}
      </button>
    </div>
  );
}