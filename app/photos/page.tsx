import type { Metadata } from "next";
import { ImageOff } from "lucide-react";
import { getPhotos } from "@/lib/photos";
import type { Photo } from "@/lib/photos";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "照片",
  description: `${siteConfig.title}拍过的一些照片。`,
};

export default function PhotosPage() {
  const photos = getPhotos();

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">照片</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {photos.length > 0
            ? `一共 ${photos.length} 张。点开看原图。`
            : "还没往这里放照片。"}
        </p>
      </header>

      {photos.length === 0 ? (
        <EmptyState />
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </div>
  );
}

/**
 * 瀑布流。
 *
 * 用 CSS columns 而不是 grid：grid 会把每张图压成同样大小，
 * 竖构图和横构图一起出现时会很难看。columns 让每张图保持原始比例。
 */
function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {photos.map((photo) => (
        <figure key={photo.fileName} className="mb-3 break-inside-avoid">
          <a
            href={photo.src}
            target="_blank"
            rel="noreferrer"
            className="glass lift block overflow-hidden rounded-xl"
          >
            {/*
              用原生 img：静态导出下 next/image 需要为每张图生成尺寸，
              而照片是用户随时丢进来的，没有固定尺寸可写。
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.caption || photo.fileName}
              loading="lazy"
              className="block w-full"
            />
          </a>

          {photo.caption && (
            <figcaption className="mt-1.5 px-1 text-xs text-fg-muted">
              {photo.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center">
      <ImageOff className="size-6 text-fg-faint" />
      <p className="text-sm text-fg-muted">这一格抽屉还是空的。</p>
      <p className="max-w-sm text-xs leading-relaxed text-fg-faint">
        把图片放进 <span className="font-mono">public/photos/</span> 就会自动出现在这里；
        想加说明文字，在同一个目录下建一个
        <span className="font-mono"> captions.json</span>。
      </p>
    </div>
  );
}