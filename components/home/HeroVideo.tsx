"use client";

import { useEffect, useRef } from "react";
import { BASE_PATH } from "@/lib/basePath";

/**
 * 顶部横幅里的动图。
 *
 * 裁切用 object-top（顶部对齐）而不是居中：
 * 壁纸是 1920×1080，横幅 1406×544 比它宽得多，cover 之后要纵向裁掉约 31%。
 * 居中裁会切掉人物头顶（头在 y≈10%~35%），顶部对齐就正好露出整张脸。
 *
 * 和全站背景那套一样：先渲染静态海报，<video> 初始不带 src，
 * 只有桌面宽度、未开启减弱动效、未开启省流量时才注入并播放。
 * 手机端因此不会为了一个横幅白耗 2.7 MB。
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    type NetworkInformation = { saveData?: boolean };
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    if (!desktop || calm || conn?.saveData === true) return;

    video.src = `${BASE_PATH}/bg/background.mp4`;

    const onPlaying = () => video.classList.add("is-playing");
    video.addEventListener("playing", onPlaying);
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <>
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={`${BASE_PATH}/bg/background-mobile.jpg`}
        />
        <img
          src={`${BASE_PATH}/bg/background.jpg`}
          alt=""
          className="absolute inset-0 size-full object-cover object-top"
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
        aria-hidden="true"
        className="hero-video absolute inset-0 size-full object-cover object-top"
      />
    </>
  );
}