"use client";

import { useEffect, useRef } from "react";
import { BASE_PATH } from "@/lib/basePath";

/**
 * 背景动图。
 *
 * 策略：
 * - 服务端先渲染静态海报（<picture>），手机、无 JS、减弱动效都靠它。
 * - <video> 初始没有 src，preload="none"，所以默认一个字节都不下载。
 * - 只有桌面宽度、未开启「减弱动态效果」、未开启省流量模式时，
 *   才在 effect 里注入 src 并播放。
 *
 * 这样手机端不会白耗 2.6 MB 流量，也不会有 hydration 不一致的问题——
 * 服务端和客户端渲染出的初始 HTML 完全一样。
 */
export function BackgroundMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type NetworkInformation = { saveData?: boolean };
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const saving = conn?.saveData === true;

    if (!desktop || calm || saving) return;

    // 先把 src 指过去再 play：直接设 autoPlay 会让手机也下载
    video.src = `${BASE_PATH}/bg/background.mp4`;

    const onPlaying = () => video.classList.add("is-playing");
    video.addEventListener("playing", onPlaying);

    // 自动播放被浏览器拦下时什么也不做，海报继续显示
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <div className="bg-media" aria-hidden="true">
      <picture>
        {/* 竖屏用单独裁的版本，否则 cover 会把画面裁得只剩中间一条 */}
        <source
          media="(max-width: 767px)"
          srcSet={`${BASE_PATH}/bg/background-mobile.jpg`}
        />
        <img
          src={`${BASE_PATH}/bg/background.jpg`}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        // 没有 poster：海报已经由下面的 <img> 承担，
        // 再给 video 一个 poster 会多下载一次同一张图
      />
    </div>
  );
}