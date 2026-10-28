"use client";

import { useState } from "react";
import { SessionProvider, useSession } from "./SessionProvider";
import { LoginGate } from "./LoginGate";
import { PostsPanel } from "./PostsPanel";
import { NotesPanel } from "./NotesPanel";
import { DigestPanel } from "./DigestPanel";
import { PhotosPanel } from "./PhotosPanel";
import { DataPanel } from "./DataPanel";

const TABS = [
  { id: "posts", label: "文章" },
  { id: "notes", label: "说说" },
  { id: "digest", label: "选刊" },
  { id: "projects", label: "项目" },
  { id: "photos", label: "照片" },
  { id: "friends", label: "友链" },
  { id: "about", label: "关于页" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ConsoleApp() {
  return (
    <SessionProvider>
      <LoginGate>
        <ConsoleShell />
      </LoginGate>
    </SessionProvider>
  );
}

function ConsoleShell() {
  const { info, logout } = useSession();
  const [tab, setTab] = useState<TabId>("posts");

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">个人空间</h1>
          <p className="mt-0.5 text-xs text-fg-faint">
            {info?.full_name ?? ""} · {info?.private ? "私有仓库" : "公开仓库"}
            {" · 保存即提交，约 1 分钟后上线"}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted"
        >
          退出
        </button>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-[color:var(--glass-brd)] pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              tab === item.id
                ? "bg-accent-soft text-accent-text"
                : "text-fg-muted hover:bg-[color:var(--code-bg)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "posts" && <PostsPanel />}
      {tab === "notes" && <NotesPanel />}
      {tab === "digest" && <DigestPanel />}
      {tab === "projects" && <DataPanel kind="projects" />}
      {tab === "photos" && <PhotosPanel />}
      {tab === "friends" && <DataPanel kind="friends" />}
      {tab === "about" && <DataPanel kind="about" />}
    </div>
  );
}