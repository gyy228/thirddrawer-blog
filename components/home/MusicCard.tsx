"use client";

import { useRef, useState } from "react";
import { siteConfig } from "@/siteConfig";

/**
 * 音乐卡片。
 *
 * 现在没有音频文件，所以做出完整可用的界面但不放 src：
 * 点播放会明确提示「还没配置音乐」，而不是假装在播。
 * 以后把 mp3 放到 public/music/，在 siteConfig 里填上 src 就能响。
 */
export function MusicCard() {
  const { title, song, artist, src } = siteConfig.music;

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
          <p className="truncate text-[0.7rem] text-fg-faint">
            {artist || "—"}
          </p>
        </div>
      </div>

      {/* 进度条：真在播时按播放进度走，没配置时是一条空槽 */}
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
    </section>
  );
}