"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "@/siteConfig";

/**
 * 音乐卡片。
 *
 * 两种音源，按 siteConfig.music 里填了哪个决定：
 *
 * - `bvid` → 嵌入 B 站官方播放器。音频从 B 站加载，不经过本站仓库。
 * - `src`  → 用 <audio> 播放 public/music/ 下的自托管文件。
 *
 * B 站播放器必须给足尺寸：iframe 太小（测试中 206×116）时它会退化成
 * 一张「进入哔哩哔哩观看更高清」的推广卡，根本不播放；800×450 才正常。
 * 侧栏只有 240px，所以点播放改成弹层。
 */
export function MusicCard() {
  const { title, song, artist, src, bvid } = siteConfig.music;

  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <span className="text-accent-text">#</span>
        {title}
      </h3>

      <div className="mt-3 flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm text-accent-text">
          ♪
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-fg">{song}</p>
          <p className="truncate text-[0.7rem] text-fg-faint">{artist || "—"}</p>
        </div>
      </div>

      {bvid ? <BilibiliEntry bvid={bvid} /> : <LocalAudioPlayer src={src} />}
    </section>
  );
}

/**
 * B 站播放器入口。
 *
 * 弹层用 portal 挂到 body：卡片本身带 backdrop-filter，
 * 会创建层叠上下文，弹层留在卡里就会被裁在这张卡内。
 */
function BilibiliEntry({ bvid }: { bvid: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    // 弹层打开时锁住页面滚动
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-soft px-3 py-1.5 text-xs text-accent-text transition-colors hover:bg-accent-soft/70"
      >
        ▶ 播放
      </button>
      <p className="mt-2 text-[0.7rem] text-fg-faint">
        音频由 B 站提供，点播放后打开。
      </p>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="B 站播放器"
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-3xl"
              // 点内容区不要冒泡到遮罩上导致关闭
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
                <iframe
                  src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1&danmaku=0&high_quality=1`}
                  title="B 站播放器"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0"
                  className="size-full"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <a
                  href={`https://www.bilibili.com/video/${bvid}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-white/80 hover:text-white hover:underline"
                >
                  在 B 站打开
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-white/15 px-3 py-1 text-xs text-white transition-colors hover:bg-white/25"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * 自托管音频播放器。
 *
 * src 为空时不假装在播，点了明确提示还没配置。
 */
function LocalAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState("");

  function toggle() {
    const audio = audioRef.current;

    if (!src || !audio) {
      setNotice("还没配置音乐文件");
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setNotice("");
      void audio.play().then(
        () => setPlaying(true),
        () => setNotice("播放失败，检查音频地址"),
      );
    }
  }

  return (
    <>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color:var(--glass-brd)]">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "暂停" : "播放"}
          className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent-text transition-colors hover:bg-accent-soft/70"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <span className="text-[0.7rem] text-fg-faint">
          {src ? (playing ? "播放中" : "点击播放") : "未配置"}
        </span>
      </div>

      {notice && <p className="mt-2 text-[0.7rem] text-fg-faint">{notice}</p>}

      <audio
        ref={audioRef}
        src={src || undefined}
        // 不预加载：一首歌好几 MB，没人点播放就不该占流量
        preload="none"
        loop
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          setProgress((el.currentTime / el.duration) * 100);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        hidden
      />
    </>
  );
}