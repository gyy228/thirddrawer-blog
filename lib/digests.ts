import fs from "node:fs";
import path from "node:path";

/**
 * 每日选刊数据。
 *
 * 数据源是站点仓库里的 digests/*.json，一天一个文件。
 * 只有审核通过的内容才会写到这里——草稿留在 digest-tool/drafts/，
 * 不随站点发布。
 */

const DIGESTS_DIR = path.join(process.cwd(), "digests");

export interface DigestItem {
  id: string;
  title: string;
  url: string;
  source: string;
  topic: string;
  summary: string;
  publishedAt: string | null;
}

export interface Digest {
  date: string;
  status: "draft" | "published";
  generatedAt: string;
  itemCount: number;
  items: DigestItem[];
}

/** 读所有已发布的选刊，新的在前 */
export function getAllDigests(): Digest[] {
  if (!fs.existsSync(DIGESTS_DIR)) return [];

  const files = fs.readdirSync(DIGESTS_DIR).filter((name) => name.endsWith(".json"));

  const digests: Digest[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(DIGESTS_DIR, file), "utf8");
      // 有些编辑器会写 BOM，JSON.parse 会直接失败
      const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
      const data = JSON.parse(text) as Digest;

      // 只展示已发布的；草稿即使误放进仓库也不该出现在页面上
      if (data.status !== "published") continue;
      if (!Array.isArray(data.items) || data.items.length === 0) continue;

      digests.push(data);
    } catch {
      // 单个文件坏了不该让整页崩掉
      console.warn(`[digests] 跳过无法解析的文件：${file}`);
    }
  }

  return digests.sort((a, b) => b.date.localeCompare(a.date));
}

/** 按栏目分组，页面上按栏目展示 */
export function groupByTopic(items: DigestItem[]): Map<string, DigestItem[]> {
  const groups = new Map<string, DigestItem[]>();
  for (const item of items) {
    const list = groups.get(item.topic) ?? [];
    list.push(item);
    groups.set(item.topic, list);
  }
  return groups;
}

/** 把 2026-10-28 显示成 10 月 28 日 */
export function formatDigestDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${Number(m)} 月 ${Number(d)} 日`;
}