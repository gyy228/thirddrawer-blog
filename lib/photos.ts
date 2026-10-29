import fs from "node:fs";
import path from "node:path";
import { BASE_PATH } from "./basePath";

/**
 * 照片墙。
 *
 * 设计成「目录即数据」：把图片放进 public/photos/，页面自动列出来。
 * 不需要手工维护一份清单，也不会出现「图上去了但忘了加条目」的情况。
 *
 * 可选的说明文字放在 public/photos/captions.json：
 *   { "DSC01234.jpg": "某个下午", "IMG_5678.jpg": "出门走走" }
 * 没有 captions.json 也能正常工作。
 */

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const CAPTIONS_FILE = path.join(PHOTOS_DIR, "captions.json");

/** 只认这几种扩展名，其他文件（如 .DS_Store、说明文档）一律忽略 */
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export interface Photo {
  /** 文件名，同时用作渲染的 key */
  fileName: string;
  /** 可以直接放进 img src 的地址（含 basePath） */
  src: string;
  /** 说明文字，可能为空 */
  caption: string;
}


function readCaptions(): Record<string, string> {
  if (!fs.existsSync(CAPTIONS_FILE)) return {};

  try {
    let raw = fs.readFileSync(CAPTIONS_FILE, "utf8");

    // 去掉 UTF-8 BOM。用 PowerShell 的 Set-Content -Encoding utf8 或
    // 记事本另存为都会带上 BOM，而 JSON.parse 不认它——
    // 表现为「说明文字死活不显示」，很难看出原因。
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("顶层应该是一个对象");
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string") result[key] = value;
    }
    return result;
  } catch (error) {
    // 说明文件写坏了不该让整站构建失败，但也不能一声不吭——
    // 否则用户以为功能没生效，反复排查也找不到原因。
    const message = error instanceof Error ? error.message : String(error);
    console.warn(
      `[photos] captions.json 解析失败，本次不显示照片说明文字：${message}\n` +
        `文件位置：${CAPTIONS_FILE}`,
    );
    return {};
  }
}

/** 按文件名倒序，让新加的照片排在前面（通常文件名是日期或递增编号） */
export function getPhotos(): Photo[] {
  if (!fs.existsSync(PHOTOS_DIR)) return [];

  const captions = readCaptions();

  return fs
    .readdirSync(PHOTOS_DIR)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .map((file) => ({
      fileName: file,
      src: `${BASE_PATH}/photos/${encodeURIComponent(file)}`,
      caption: captions[file] ?? "",
    }));
}