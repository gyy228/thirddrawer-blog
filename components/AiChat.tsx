"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

/**
 * 把底层报错翻译成用户看得懂的话。
 *
 * 浏览器对网络失败抛的是「Failed to fetch」这类原文，对访客毫无意义。
 *
 * 特别说明：导览接口部署在 Cloudflare Workers，而 workers.dev 在国内
 * 被 DNS 污染（实测阿里/DNSPod 都解析到 Facebook、Dropbox 的 IP），
 * 所以大陆访客一定会走到这个分支。文案要让人明白是「这个功能需要代理」，
 * 而不是「你的网站坏了」——站点其他页面确实是好的。
 */
function toFriendlyError(error: unknown): string {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "连不上导览服务。如果你在中国大陆，这个功能需要代理才能访问——站点其他页面不受影响。";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "出了点问题，稍后再试试。";
}

/**
 * 站内 AI 导览。
 *
 * 只在 siteConfig.ai.endpoint 配置了之后才渲染入口——
 * 接口没部署时不出现一个点了就报错的按钮。
 *
 * 后端是 Cloudflare Worker，API Key 在 Worker 侧，前端只拿到流式文本。
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiChat({ endpoint, label }: { endpoint: string; label: string }) {
  const [open, setOpen] = useState(false);

  // 接口没配置就什么都不渲染。
  // 放在所有 Hook 之后、真正返回之前——Hook 的调用顺序不能因条件而变。
  const enabled = endpoint.trim().length > 0;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 打开面板时把焦点放到输入框
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // 新消息时滚到底
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  // 组件卸载时中断进行中的请求
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(async () => {
    const question = input.trim();
    if (!question || busy) return;

    setInput("");
    setError("");
    setBusy(true);

    const nextMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          // 只带最近几轮，后端也会再截断一次
          history: nextMessages.slice(-7, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(
          (detail as { error?: string } | null)?.error ?? `请求失败（${response.status}）`,
        );
      }

      if (!response.body) throw new Error("服务端没有返回内容");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE：事件之间用空行分隔
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              answer += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: answer };
                return copy;
              });
            }
          } catch {
            // 单条解析失败不该中断整个流
          }
        }
      }

      if (!answer) throw new Error("没有收到回答，请再试一次");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;

      setError(toFriendlyError(e));
      // 把占位的空回答去掉
      setMessages((prev) => prev.filter((m, i) => i !== prev.length - 1 || m.content));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [busy, endpoint, input, messages]);

  return (
    <>
      {!enabled ? null : (
        <>
          <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "收起导览" : "打开导览"}
        aria-expanded={open}
        className="glass lift fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full text-accent-text shadow-lg"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>

      {open && (
        <section
          aria-label="站内导览"
          className="glass fixed bottom-20 right-5 z-40 flex max-h-[70vh] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <header className="flex items-center justify-between border-b border-[color:var(--glass-brd)] px-4 py-2.5">
            <p className="text-sm font-medium">{label}</p>
            <span className="text-xs text-fg-faint">只答站内内容</span>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-fg-muted">
                可以问我站里写过什么。比如「有没有关于写作的」「最近更新了什么」。
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-xl bg-accent-soft px-3 py-2 text-sm text-fg"
                    : "mr-2 text-sm leading-relaxed text-fg-muted"
                }
              >
                {message.content || (busy && index === messages.length - 1 ? "……" : "")}
              </div>
            ))}

            {error && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
                {error}
              </p>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-[color:var(--glass-brd)] p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              maxLength={300}
              placeholder={busy ? "正在回答…" : "问点什么"}
              className="min-w-0 flex-1 rounded-lg border border-[color:var(--glass-brd)] bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-accent-text disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="发送"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      )}
        </>
      )}
    </>
  );
}