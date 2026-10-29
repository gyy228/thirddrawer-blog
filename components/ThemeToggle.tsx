"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="切换深浅色主题"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg"
    >
      {/* 靠 CSS 按 .dark 切换图标，而不是用 effect 判断是否已挂载，
          这样服务端与客户端首次渲染完全一致，也不触发 hooks lint 规则 */}
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}