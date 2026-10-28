"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/**
 * 路由级错误边界。
 *
 * 静态站点通常不会有运行时异常，但只要有一个页面组件抛错，
 * 没有这个文件用户看到的就是 Next 的默认错误页（英文、白屏风格）。
 *
 * 注意 error.tsx 必须是客户端组件，且只捕获渲染期间的错误——
 * 构建期错误由 next build 直接报出来，不会走到这里。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本地开发时把完整错误打到控制台，方便定位
    console.error(error);
  }, [error]);

  return (
    <div className="glass mx-auto mt-6 max-w-xl rounded-2xl p-8 text-center">
      <h1 className="text-lg font-semibold">这一格抽屉卡住了</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
        页面渲染时出了点问题。可以先重试一次；如果反复出现，说明是代码里的 bug。
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-xs text-fg-faint">错误编号：{error.digest}</p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--glass-brd)] px-4 py-2 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <RotateCcw className="size-3.5" />
        重试
      </button>
    </div>
  );
}