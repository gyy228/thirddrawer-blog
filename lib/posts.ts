import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Markdown 源文件目录 */
const POSTS_DIR = path.join(process.cwd(), "posts");

/** front-matter 的原始形态（字段都可缺省） */
export interface PostFrontMatter {
  title?: string;
  date?: string | Date;
  tags?: string[];
  summary?: string;
  cover?: string;
  draft?: boolean;
}

/** 归一化之后、供页面使用的文章元信息 */
export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  cover?: string;
  draft: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

function readSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/** 把 Date 或各种写法统一成 YYYY-MM-DD */
function normalizeDate(value: string | Date | undefined): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function toPostMeta(slug: string, data: PostFrontMatter): PostMeta {
  return {
    slug,
    title: data.title ?? slug,
    date: normalizeDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    summary: data.summary ?? "",
    cover: data.cover || undefined,
    draft: Boolean(data.draft),
  };
}

/**
 * 解析 front-matter，出错时把文件路径带进错误信息。
 *
 * gray-matter 抛的 YAMLException 只给行号、不给文件名，文章一多就无从下手。
 * 这里补上相对路径和常见原因，让构建失败时能直接定位。
 */
function parseFrontMatter(raw: string, filePath: string) {
  try {
    return matter(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const relative = path.relative(process.cwd(), filePath);
    throw new Error(
      `无法解析 ${relative} 的 front-matter\n\n${message}\n\n` +
        `常见原因：数组或对象没闭合、冒号后面缺空格、缩进不一致、含特殊字符却没用引号。`,
    );
  }
}

/** 取全部文章，默认按日期倒序并过滤草稿 */
export function getAllPosts(options: { includeDrafts?: boolean } = {}): PostMeta[] {
  const { includeDrafts = false } = options;

  return readSlugs()
    .map((slug) => {
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = parseFrontMatter(raw, filePath);
      return toPostMeta(slug, data as PostFrontMatter);
    })
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/**
 * 按 slug 取单篇文章（含正文），不存在返回 null。
 *
 * 默认**过滤草稿**：`generateStaticParams` 虽然跳过了草稿，但
 * `dynamicParams` 默认允许按需渲染，若这里不过滤，草稿页仍可通过
 * 直接访问 URL 读到——等于把未发布内容公开了。
 * 本地控制台预览草稿时传 `includeDrafts: true`。
 */
export function getPostBySlug(
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Post | null {
  const { includeDrafts = false } = options;

  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = parseFrontMatter(raw, file);
  const post: Post = { ...toPostMeta(slug, data as PostFrontMatter), content };

  if (post.draft && !includeDrafts) return null;

  return post;
}

/** 标签统计，用于归档页 */
export function getAllTags(): { tag: string; count: number }[] {
  const counter = new Map<string, number>();

  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }

  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"));
}

/** 2026-10-27 → 2026 年 10 月 27 日 */
export function formatDate(date: string): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

/** 按年份分组，用于归档页时间轴 */
export function groupByYear(posts: PostMeta[]): { year: string; posts: PostMeta[] }[] {
  const groups = new Map<string, PostMeta[]>();

  for (const post of posts) {
    const year = post.date.slice(0, 4) || "未知";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(post);
  }

  return [...groups.entries()]
    .map(([year, list]) => ({ year, posts: list }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

/**
 * 取相邻文章。
 *
 * 文章列表按日期倒序（新的在前），所以：
 * - 索引 +1 = 更早发布 = 「上一篇」
 * - 索引 -1 = 更晚发布 = 「下一篇」
 */
export function getAdjacentPosts(slug: string): {
  older: PostMeta | null;
  newer: PostMeta | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) return { older: null, newer: null };

  return {
    older: posts[index + 1] ?? null,
    newer: posts[index - 1] ?? null,
  };
}