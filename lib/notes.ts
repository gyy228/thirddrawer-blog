import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * 说说（notes）
 *
 * 和文章的区别：没有标题，正文是一两句话，可选配图。
 * 站点上是 /notes 页面的紧凑卡片流。
 *
 * 源文件放 posts/notes/*.md，这样不会和文章混在同一个目录里
 * ——文章扫描用的是 posts/*.md（非递归），两个目录天然隔离。
 */

const NOTES_DIR = path.join(process.cwd(), "posts", "notes");

export interface NoteFrontMatter {
  date?: string | Date;
  images?: string[];
  draft?: boolean;
}

export interface Note {
  /** 文件名去掉 .md，同时用作稳定的 id */
  id: string;
  date: string;
  /** 说说的文字内容（Markdown 原文，实际只支持最基础的几个行内语法） */
  content: string;
  images: string[];
  draft: boolean;
}

/** 把 Date 或各种写法统一成 YYYY-MM-DD */
function normalizeDate(value: string | Date | undefined): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const raw = String(value ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

function parseNote(raw: string, filePath: string): Note {
  let parsed;
  try {
    parsed = matter(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const relative = path.relative(process.cwd(), filePath);
    throw new Error(
      `说说的 front-matter 解析失败：${relative}\n${message}\n` +
        `常见原因：数组未闭合、冒号后缺空格、缩进不一致、特殊字符没加引号。`,
    );
  }

  const data = parsed.data as NoteFrontMatter;
  const id = path.basename(filePath, ".md");

  return {
    id,
    date: normalizeDate(data.date),
    content: parsed.content.trim(),
    images: Array.isArray(data.images) ? data.images.map(String).filter(Boolean) : [],
    draft: Boolean(data.draft),
  };
}

/**
 * 读取全部说说，按日期倒序。
 *
 * 默认过滤草稿；同一天的多条按文件名倒序，保证顺序稳定
 * （否则同一日期下每次排序结果可能不同，构建产物会抖动）。
 */
export function getAllNotes({ includeDrafts = false } = {}): Note[] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  const notes = fs
    .readdirSync(NOTES_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parseNote(fs.readFileSync(path.join(NOTES_DIR, file), "utf8"), path.join(NOTES_DIR, file)));

  return notes
    .filter((note) => includeDrafts || !note.draft)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.id < b.id ? 1 : -1;
    });
}

/** 按年月分组，供页面分节展示 */
export function groupNotesByMonth(
  notes: Note[],
): { key: string; label: string; notes: Note[] }[] {
  const groups = new Map<string, Note[]>();

  for (const note of notes) {
    // 日期缺失时归到「未标注日期」，而不是丢弃
    const key = note.date ? note.date.slice(0, 7) : "unknown";
    const list = groups.get(key) ?? [];
    list.push(note);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([key, list]) => ({
    key,
    label: key === "unknown" ? "未标注日期" : key.replace("-", " 年 ") + " 月",
    notes: list,
  }));
}