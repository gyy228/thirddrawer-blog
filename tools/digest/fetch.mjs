/**
 * 抓取所有订阅源，归一化成候选条目。
 *
 * 单个源失败不影响其他源——网络本来就时好时坏，
 * 不能因为一个站挂了就整批失败。
 */

import { FEEDS, USER_AGENT } from "./feeds.mjs";
import { parseFeed } from "./lib/rss.mjs";

/** 只看最近多少小时内发布的 */
const MAX_AGE_HOURS = 48;

async function fetchOne(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!res.ok) {
      return { feed, error: `HTTP ${res.status}`, items: [] };
    }

    const xml = await res.text();

    // 有些站 200 但返回 HTML（反爬页），这里挡掉
    if (!/<rss|<feed|<channel/i.test(xml.slice(0, 3000))) {
      return { feed, error: "返回的不是 feed（可能是 HTML）", items: [] };
    }

    const parsed = parseFeed(xml, feed.name);
    return { feed, error: null, items: parsed.items };
  } catch (error) {
    const reason =
      error?.name === "AbortError"
        ? "超时"
        : error instanceof Error
          ? error.message
          : String(error);
    return { feed, error: reason, items: [] };
  } finally {
    clearTimeout(timer);
  }
}

/** 简单去重：同一 URL 只留一条 */
function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.url.split("?")[0].replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export async function collect({ verbose = true } = {}) {
  const cutoff = Date.now() - MAX_AGE_HOURS * 3600 * 1000;

  const results = await Promise.all(FEEDS.map(fetchOne));

  const all = [];
  for (const { feed, error, items } of results) {
    if (verbose) {
      // 403 / 451 多半是对方按 IP 地区限制了。
      // 阮一峰这类站在国内抓得到、在 GitHub 的海外 runner 上抓不到，
      // 光写「✗ HTTP 403」会让人以为站坏了。
      const geo = /40[13]|451/.test(error ?? "") ? "（可能限制海外访问，国内可抓）" : "";
      const status = error ? `✗ ${error}${geo}` : `✓ ${items.length} 条`;
      console.log(`  ${feed.name.padEnd(8, "　")} ${status}`);
    }
    for (const item of items) {
      // 没有时间的一律保留，交给后面按 URL 去重
      if (item.publishedAt && item.publishedAt.getTime() < cutoff) continue;
      all.push({ ...item, topic: feed.topic });
    }
  }

  const deduped = dedupe(all);

  // 新的排前面；没有时间的排最后
  deduped.sort((a, b) => {
    const ta = a.publishedAt?.getTime() ?? 0;
    const tb = b.publishedAt?.getTime() ?? 0;
    return tb - ta;
  });

  if (verbose) {
    console.log(`\n合计 ${all.length} 条，去重后 ${deduped.length} 条`);
  }

  return { items: deduped, results };
}