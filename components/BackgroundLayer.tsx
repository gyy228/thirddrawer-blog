import { BackgroundMedia } from "./BackgroundMedia";

/**
 * 背景层，从后往前三层：
 *
 *   z -3  动图（静态海报打底，桌面端叠一层循环视频）
 *   z -2  遮罩，压住画面亮度，保证文字对比度
 *   z -1  光晕色块
 *
 * 遮罩是必须的：这张壁纸平均亮度 158/255，不加遮罩深色文字压不住。
 */
export function BackgroundLayer() {
  return (
    <>
      <BackgroundMedia />
      <div className="bg-scrim" aria-hidden="true" />
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>
    </>
  );
}