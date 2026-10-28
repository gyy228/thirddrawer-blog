"use client";

import { useState } from "react";
import { useSession } from "./SessionProvider";

/**
 * 登录门。
 *
 * 说明为什么要用 Token 而不是密码：这是静态站，没有服务端，
 * 任何「密码校验」都能被 F12 绕过。Token 则是由 GitHub 在服务端验证的，
 * 没有它连一个字节都写不进去。
 */
export function LoginGate({ children }: { children: React.ReactNode }) {
  const { token, ready, busy, error, login } = useSession();

  const [input, setInput] = useState("");
  const [remember, setRemember] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-sm text-fg-muted">正在校验保存的凭据…</p>
      </div>
    );
  }

  if (token) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl space-y-5 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">个人空间</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          这里可以改站点的全部内容。需要 GitHub 访问令牌才能进——
          令牌由 GitHub 在服务端校验，没有它谁也改不了东西。
        </p>
      </header>

      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await login(input, remember);
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">访问令牌</span>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="github_pat_... 或 ghp_..."
            autoComplete="off"
            spellCheck={false}
            className="mt-1.5 w-full rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent-text"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-4"
          />
          在这台设备上记住（否则关掉标签页就失效）
        </label>

        {error && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-full rounded-lg bg-accent-soft px-4 py-2.5 text-sm font-medium text-accent-text disabled:opacity-50"
        >
          {busy ? "校验中…" : "进入"}
        </button>
      </form>

      <section className="glass rounded-2xl p-4 text-sm leading-relaxed text-fg-muted">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="font-medium text-accent-text"
        >
          {showHelp ? "收起" : "怎么创建令牌？"}
        </button>

        {showHelp && (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>
              打开{" "}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
                className="text-accent-text underline"
              >
                GitHub 新建令牌
              </a>
            </li>
            <li>Repository access 选 Only select repositories → 只勾 thirddrawer-blog</li>
            <li>
              Permissions → Repository permissions → <b>Contents</b> 选{" "}
              <b>Read and write</b>
            </li>
            <li>过期时间建议设 90 天，到期重新建一个</li>
            <li>Generate token，复制出来（只显示一次）</li>
          </ol>
        )}
      </section>
    </div>
  );
}