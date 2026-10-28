/**
 * 配置与密钥读取。
 *
 * 这套工具现在住在站点仓库里（tools/digest/），
 * 由 GitHub Actions 每天定时跑，不再依赖你电脑开机。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * 站点根目录。
 *
 * 默认是本文件的祖父目录（tools/digest → 仓库根）。
 * GitHub Actions 里 SITE_DIR 设成 workspace，本地跑也落在同一个地方，
 * 所以两种情况都不用改代码。
 */
export const SITE_DIR = process.env.SITE_DIR
  ? path.resolve(process.env.SITE_DIR)
  : path.resolve(DIR, "..", "..");

/** 正式选刊目录 */
export const SITE_DIGESTS_DIR = path.join(SITE_DIR, "digests");

/** 草稿目录：进仓库，但不发布 */
export const DRAFTS_DIR = path.join(SITE_DIGESTS_DIR, "drafts");

/** 每个源最多取几条候选，防止某个源刷屏 */
export const MAX_PER_SOURCE = 12;

/** 送进模型的候选上限 */
export const MAX_CANDIDATES = 80;

/** 每天选几条 */
export const PICK_COUNT = 5;

export const MODEL = "deepseek-flash";
export const API_URL = "https://api.deepseek.com/chat/completions";

/**
 * 读 API Key。
 *
 * 优先级：环境变量 > 本地 .dev.vars。
 * Actions 里用仓库 secret 注入环境变量；本地跑时读 ai-worker/.dev.vars。
 * 只在内存里用，不打印、不落盘。
 */
export function readApiKey() {
  if (process.env.AI_API_KEY) return process.env.AI_API_KEY.trim();

  // 本地跑时，Key 在 ai-worker/.dev.vars（工作区同级目录）
  const candidates = [
    path.join(SITE_DIR, "..", "ai-worker", ".dev.vars"),
    path.join(SITE_DIR, ".dev.vars"),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;

    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (line.trim().startsWith("#")) continue;
      const m = /^\s*AI_API_KEY\s*=\s*(.+)$/.exec(line);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }

  return "";
}

/**
 * YYYY-MM-DD，固定按北京时间。
 *
 * 不能用本机时区：GitHub 的 runner 是 UTC，而北京比它早 8 小时。
 * 北京时间 0:00～8:00 之间跑，UTC 还停在前一天，
 * 算出来的「今天」会变成昨天，于是命中已有草稿直接静默跳过——
 * 表现为工作流显示成功却什么都没生成。
 *
 * 选刊是给人看的，日期应当以你所在的时区为准。
 */
export function todayString(date = new Date()) {
  // en-CA 的日期格式正好是 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}