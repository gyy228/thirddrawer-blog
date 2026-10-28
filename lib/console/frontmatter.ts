/**
 * 极简 front-matter 解析与序列化（纯浏览器）。
 *
 * 为什么不直接用 gray-matter：它依赖 Buffer，在浏览器里需要 polyfill，
 * 而控制台没有构建期注入的垫片。我们只需要处理站点实际用到的几种写法：
 * 带引号的字符串、数组（缩进块或行内）、布尔值。
 */

export interface FrontMatter {
  [key: string]: string | string[] | boolean | undefined;
}

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** 去掉一层的引号 */
function unquote(value: string): string {
  const text = value.trim();
  if (
    (text.startsWith('"') && text.endsWith('"') && text.length >= 2) ||
    (text.startsWith("'") && text.endsWith("'") && text.length >= 2)
  ) {
    return text.slice(1, -1);
  }
  return text;
}

export function parseFrontMatter(raw: string): { data: FrontMatter; body: string } {
  const text = raw.replace(/^\uFEFF/, "");
  const match = FENCE.exec(text);

  if (!match) return { data: {}, body: text };

  const data: FrontMatter = {};
  const lines = match[1].split(/\r?\n/);

  let currentKey: string | null = null;
  let listBuffer: string[] = [];

  const flush = () => {
    if (currentKey && listBuffer.length > 0) {
      data[currentKey] = listBuffer.join(" ");
    }
    currentKey = null;
    listBuffer = [];
  };

  for (const line of lines) {
    // 缩进项：- 值
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && currentKey) {
      data[currentKey] = [
        ...((data[currentKey] as string[] | undefined) ?? []),
        unquote(item[1]),
      ];
      continue;
    }

    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();

      if (value === "") {
        // 后面可能跟数组
        data[currentKey] = [] as string[];
      } else if (value.startsWith("[") && value.endsWith("]")) {
        data[currentKey] = value
          .slice(1, -1)
          .split(",")
          .map((s) => unquote(s))
          .filter(Boolean);
      } else if (value === "true" || value === "false") {
        data[currentKey] = value === "true";
      } else {
        data[currentKey] = unquote(value);
      }
      continue;
    }

    flush();
  }

  flush();

  // 清掉空数组（值为空且后面没跟项）
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length === 0) delete data[key];
  }

  return { data, body: text.slice(match[0].length) };
}

/** 需要时给值加引号，避免冒号、井号把 YAML 弄坏 */
function quoteIfNeeded(value: string): string {
  if (value === "") return '""';
  if (/^[\w\u4e00-\u9fa5][^:#]*$/.test(value)) return value;
  return `"${value.replace(/"/g, '\\"')}"`;
}

export function buildFrontMatter(data: FrontMatter, body: string): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      if (value) lines.push(`${key}: true`);
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${quoteIfNeeded(String(item))}`);
      continue;
    }
    if (String(value).trim() === "") continue;
    lines.push(`${key}: ${quoteIfNeeded(String(value))}`);
  }

  lines.push("---", "");
  return `${lines.join("\n")}\n${body.replace(/^\n+/, "")}`;
}

/** 从标题生成 slug：中文标题退化成时间戳，避免空 slug */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || `post-${Date.now().toString(36)}`;
}