"use client";

import { useEffect, useState } from "react";

/**
 * 阅读进度条：页面顶部一条细线，随滚动填充。
 *
 * 刻意不在 effect 体内同步调用 update() —— 那会触发 React 的
 * `set-state-in-effect` 规则。页面初始就在顶部，进度本就是 0，
 * 靠滚动事件更新即可；锚点跳转也会触发 scroll 事件。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function update() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-0.5"
      role="progressbar"
      aria-label="阅读进度"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}