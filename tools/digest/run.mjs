/**
 * 每日选刊生成：抓取 → 配额筛选 → 模型精选 → 保存。
 *
 * 两种模式：
 *   默认        只写草稿到 digests/drafts/，等你在控制台审核
 *   --publish   直接写进 digests/ 并标记为已发布，站点立刻可见
 *
 * GitHub Actions 每天用的是 --publish（站长授权自动发布）。
 *
 * 用法：
 *   node run.mjs              生成今天的草稿
 *   node run.mjs --publish    生成并直接发布
 *   node run.mjs --force      覆盖今天已有的内容重新生成
 *   node run.mjs --dry        只抓取和筛选，不调用模型（不花钱）
 */

import fs from "node:fs";
import path from "node:path";

import { collect } from "./fetch.mjs";
import { curate } from "./curate.mjs";
import {
  DRAFTS_DIR,
  MAX_CANDIDATES,
  MAX_PER_SOURCE,
  PICK_COUNT,
  SITE_DIGESTS_DIR,
  readApiKey,
  todayString,
  writeJson,
} from "./config.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dry = args.includes("--dry");
const publish = args.includes("--publish");

const today = todayString();

// 输出位置：发布模式写到正式目录，否则写草稿
const outputDir = publish ? SITE_DIGESTS_DIR : DRAFTS_DIR;
const draftFile = path.join(outputDir, `${today}.json`);

async function main() {
  console.log(`\n== 选刊生成 ${today} ==`);
  console.log(publish ? "模式：生成后直接发布" : "模式：只生成草稿，等人工审核");

  // 已有内容时不覆盖，避免误删你改过的内容
  if (fs.existsSync(draftFile) && !force) {
    console.log(`今天（北京时间 ${today}）已有${publish ? "已发布内容" : "草稿"}：${draftFile}`);
    console.log("如需重新生成，加 --force（或在 Actions 页面勾选 force 后手动触发）");
    console.log("本次没有生成新内容。");
    return;
  }

  console.log("抓取订阅源：");
  const { items } = await collect();

  if (items.length === 0) {
    console.log("\n一条都没抓到，检查网络或订阅源。");
    process.exitCode = 1;
    return;
  }

  // 按来源配额筛选，保证版面不被单一站点占满
  const perSource = new Map();
  const candidates = [];

  for (const item of items) {
    const used = perSource.get(item.source) ?? 0;
    if (used >= MAX_PER_SOURCE) continue;
    perSource.set(item.source, used + 1);
    candidates.push(item);
    if (candidates.length >= MAX_CANDIDATES) break;
  }

  console.log(`\n候选 ${candidates.length} 条（每源上限 ${MAX_PER_SOURCE}）`);
  for (const [source, count] of perSource) {
    console.log(`  ${source}：${count}`);
  }

  if (dry) {
    console.log("\n--dry 模式，不调用模型。");
    return;
  }

  const apiKey = readApiKey();
  if (!apiKey) {
    console.log("\n没有找到 API Key，检查 ai-worker/.dev.vars 或设置 AI_API_KEY。");
    process.exitCode = 1;
    return;
  }

  console.log(`\n调用模型精选（目标 ${PICK_COUNT} 条）…`);
  const started = Date.now();

  let picked;
  try {
    picked = await curate(candidates, apiKey);
  } catch (error) {
    console.log("\n精选失败：" + (error instanceof Error ? error.message : error));
    console.log("没有写入任何文件。");
    process.exitCode = 1;
    return;
  }

  console.log(`完成，用时 ${((Date.now() - started) / 1000).toFixed(1)} 秒，选出 ${picked.length} 条`);

  const digest = {
    date: today,
    // 发布模式下直接标记为已发布，站点构建会读它
    status: publish ? "published" : "draft",
    generatedAt: new Date().toISOString(),
    itemCount: picked.length,
    items: picked.map((item, i) => ({ id: String(i + 1), ...item })),
  };

  writeJson(draftFile, digest);

  console.log(
    publish
      ? `\n已发布：${draftFile}`
      : `\n草稿已保存：${draftFile}`,
  );
  console.log("\n预览：");
  for (const item of digest.items) {
    console.log(`\n[${item.topic}] ${item.title}`);
    console.log(`  ${item.source} · ${item.url}`);
    console.log(`  ${item.summary}`);
  }
  console.log(
    publish
      ? "\n已直接发布，稍后随站点构建上线。想撤下就在控制台「选刊」里下架。"
      : "\n下一步：在控制台审核后发布。",
  );
}

main().catch((error) => {
  console.error("\n意外错误：", error);
  process.exitCode = 1;
});