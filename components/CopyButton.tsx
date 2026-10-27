"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * 一键复制。
 *
 * navigator.clipboard 只在安全上下文（https 或 localhost）可用——
 * 站点是 https，控制台是 localhost，两边都满足。
 * 万一浏览器不给权限，退回到「选中文本让用户自己 Ctrl+C」。
 */
export function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // 复制成功两秒后恢复，避免一直显示「已复制」
  useEffect(() => {
    if (!copied && !failed) return;
    const timer = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [copied, failed]);

  async function handleCopy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          已复制
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          {failed ? "复制失败，请手动选中" : label}
        </>
      )}
    </button>
  );
}