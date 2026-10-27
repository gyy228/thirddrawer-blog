"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/siteConfig";
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
      <nav className="glass mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5">
        <Link href="/" className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{siteConfig.title}</span>
          <span className="truncate text-[11px] text-fg-faint">{siteConfig.subtitle}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <ul className="hidden items-center gap-1 sm:flex">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    isActive(pathname, item.href)
                      ? "bg-accent-soft text-accent"
                      : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <ThemeToggle />

          <button
            type="button"
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="glass grid size-9 place-items-center rounded-full text-fg-muted sm:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="glass mx-auto mt-2 max-w-3xl rounded-2xl p-1 sm:hidden">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              {/* 点击时直接收起菜单，不靠监听 pathname 的 effect */}
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2 text-sm ${
                  isActive(pathname, item.href)
                    ? "bg-accent-soft text-accent"
                    : "text-fg-muted"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}