"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  Clock,
  FolderCode,
  House,
  Image as ImageIcon,
  Link2,
  Lock,
  Menu,
  MessageCircle,
  Newspaper,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { GithubMark, SparkMark } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

/**
 * 每个栏目的小图标与配色。
 *
 * 按 href 索引而不是塞进 siteConfig：siteConfig 是纯数据模块，
 * 服务端也要用，放 React 组件进去会把它变成客户端依赖。
 *
 * 颜色取中等明度，浅色深色主题下都能看清；没有用纯饱和色，
 * 否则十个彩色图标堆一排会把玻璃导航压垮。
 */
const NAV_ICONS: Record<string, { Icon: LucideIcon; color: string }> = {
  "/": { Icon: House, color: "#5b7cfa" },
  "/digest": { Icon: Newspaper, color: "#e0883f" },
  "/notes": { Icon: MessageCircle, color: "#25a97d" },
  "/timeline": { Icon: Clock, color: "#7a6ff0" },
  "/archive": { Icon: Archive, color: "#c2618f" },
  "/projects": { Icon: FolderCode, color: "#2f9bb5" },
  "/photos": { Icon: ImageIcon, color: "#c99a1e" },
  "/friends": { Icon: Link2, color: "#d4636b" },
  "/about": { Icon: User, color: "#4a90d9" },
  "/console": { Icon: Lock, color: "#6b7a90" },
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 栏目小图标：没配到的栏目就不渲染图标，不会留空位 */
function NavIcon({ href, active }: { href: string; active: boolean }) {
  const meta = NAV_ICONS[href];
  if (!meta) return null;
  const { Icon, color } = meta;

  return (
    <Icon
      className="size-3.5 shrink-0 transition-opacity"
      // 当前页图标略暗一点，和文字的明暗变化呼应
      style={{ color, opacity: active ? 1 : 0.75 }}
      strokeWidth={2.2}
      aria-hidden="true"
    />
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      {/*
        一条完整的胶囊：站名 + 导航 + 图标挤在同一块玻璃里。
        导航有 10 项且每项带图标，实测需要约 918px 视口才排得下
        （768 时会出现横向滚动条），所以断点放在 940px。
      */}
      <nav className="nav-glass mx-auto flex max-w-4xl items-center gap-2 rounded-full px-4 py-2 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-1 transition-opacity hover:opacity-80"
        >
          <SparkMark className="size-3 text-accent-text" />
          <span className="text-sm font-semibold tracking-tight">
            {siteConfig.title}
          </span>
        </Link>

        {/* 中间导航：不加背景块，靠明暗区分当前页——参考图就是这个做法 */}
        <ul className="mx-auto hidden items-center gap-0.5 min-[940px]:flex">
          {siteConfig.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 text-[0.8rem] transition-colors ${
                    active
                      ? "font-medium text-fg"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  <NavIcon href={item.href} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 min-[940px]:ml-0">
          <a
            href={siteConfig.profile.links.github}
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            aria-label="GitHub"
            className="hidden size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg sm:grid"
          >
            <GithubMark className="size-4" />
          </a>

          <ThemeToggle />

          <button
            type="button"
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg min-[940px]:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="nav-glass mx-auto mt-2 max-w-4xl rounded-3xl p-1.5 min-[940px]:hidden">
          {siteConfig.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                {/* 点击时直接收起菜单，不靠监听 pathname 的 effect */}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${
                    active
                      ? "font-medium text-fg"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  <NavIcon href={item.href} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
}