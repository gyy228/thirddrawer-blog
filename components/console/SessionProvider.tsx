"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_REPO, GitHubError, verifyAccess } from "@/lib/console/github";
import type { RepoConfig, RepoInfo } from "@/lib/console/github";

/**
 * Token 会话。
 *
 * 默认存 sessionStorage：关掉标签页就没了，在别人电脑上用也不会留下。
 * 勾了「记住我」才写 localStorage。
 *
 * 这不是「安全」的全部——真正的安全在于 Token 本身只在你手里，
 * 且 GitHub 在服务端校验。这里只决定它在这台浏览器上停留多久。
 */

const SESSION_KEY = "thirddrawer.console.token";
const PERSIST_KEY = "thirddrawer.console.token.persist";

interface SessionValue {
  token: string;
  repo: RepoConfig;
  info: RepoInfo | null;
  ready: boolean;
  /** 登录中/校验中 */
  busy: boolean;
  error: string;
  login: (token: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [info, setInfo] = useState<RepoInfo | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 首次加载：把之前存下的 Token 捡回来并重新校验
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const saved =
        window.sessionStorage.getItem(SESSION_KEY) ??
        window.localStorage.getItem(SESSION_KEY) ??
        "";

      if (!saved) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const repoInfo = await verifyAccess(saved);
        if (cancelled) return;
        setToken(saved);
        setInfo(repoInfo);
      } catch (e) {
        // 存着的 Token 失效了就清掉，别让它一直报错
        window.sessionStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem(SESSION_KEY);
        if (!cancelled) {
          setError(
            e instanceof GitHubError
              ? `${e.message}（已清除保存的凭据）`
              : "校验凭据失败，请重新登录。",
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: string, remember: boolean) => {
    const value = input.trim();
    if (!value) {
      setError("请填写 Token。");
      return false;
    }

    setBusy(true);
    setError("");

    try {
      const repoInfo = await verifyAccess(value);
      setToken(value);
      setInfo(repoInfo);

      // 先清掉两边，避免「上次记住、这次不记住」时残留
      window.sessionStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(SESSION_KEY);

      if (remember) {
        window.localStorage.setItem(SESSION_KEY, value);
        window.localStorage.setItem(PERSIST_KEY, "1");
      } else {
        window.sessionStorage.setItem(SESSION_KEY, value);
      }

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(PERSIST_KEY);
    setToken("");
    setInfo(null);
    setError("");
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      token,
      repo: DEFAULT_REPO,
      info,
      ready,
      busy,
      error,
      login,
      logout,
    }),
    [token, info, ready, busy, error, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession 必须在 SessionProvider 内使用");
  return value;
}