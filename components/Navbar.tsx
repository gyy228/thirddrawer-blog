"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/siteConfig";
import { GithubMark, SparkMark } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      {/*
        一条完整的胶囊：站名 + 导航 + 图标挤在同一块玻璃里。
        导航有 10 项，所以容器给到 max-w-4xl（896px）；
        窄于 md（768）会把站名挤扁，一律收进汉堡菜单。
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
        <ul className="mx-auto hidden items-center gap-0.5 md:flex">
          {siteConfig.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-2.5 py-1.5 text-[0.82rem] transition-colors ${
                    active
                      ? "font-medium text-fg"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
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
            className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-accent-soft hover:text-fg md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="nav-glass mx-auto mt-2 max-w-4xl rounded-3xl p-1.5 md:hidden">
          {siteConfig.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                {/* 点击时直接收起菜单，不靠监听 pathname 的 effect */}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-full px-3 py-2 text-sm transition-colors ${
                    active
                      ? "font-medium text-fg"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
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