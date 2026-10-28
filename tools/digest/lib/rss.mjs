/**
 * 极简 RSS 2.0 / Atom 解析器。
 *
 * 为什么不装 rss-parser：只用到标题、链接、时间、摘要四项，
 * 自己写一百来行就够，还省掉一个依赖和它的升级负担。
 *
 * 容错优先：真实 feed 里 CDATA、HTML 实体、自闭合标签混着来，
 * 这里全部按「拿不到就跳过」处理，绝不让一条坏数据中断整批。
 */

/** 解码常见 HTML 实体（feed 里 &amp; &#8211; &nbsp; 到处都是） */
export function decodeEntities(text) {
  if (!text) return "";
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** 去掉 CDATA 包裹 */
function unwrapCdata(text) {
  return text.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

/** 取第一个匹配标签的内容，兼容 CDATA */
function pickTag(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(xml);
  if (!m) return "";
  return decodeEntities(unwrapCdata(m[1].trim()));
}

/** 把 HTML 压成纯文本，供摘要和提示词使用 */
export function stripHtml(html) {
  if (!html) return "";
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** 解析日期，失败返回 null */
function parseDate(raw) {
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(t);
}

/**
 * 解析 feed 文本。
 *
 * 返回 { title, items: [{ title, url, summary, publishedAt }] }
 */
export function parseFeed(xml, sourceName) {
  const isAtom = /<feed[\s>]/i.test(xml.slice(0, 2000));

  const channelTitle = isAtom ? pickTag(xml, "title") : pickTag(xml, "title");

  // Atom 用 <entry>，RSS 用 <item>
  const blockTag = isAtom ? "entry" : "item";
  const blocks = [
    ...xml.matchAll(new RegExp(`<${blockTag}(?:\\s[^>]*)?>([\\s\\S]*?)</${blockTag}>`, "gi")),
  ].map((m) => m[1]);

  const items = [];

  for (const block of blocks) {
    const title = pickTag(block, "title").trim();

    let url = "";
    if (isAtom) {
      // Atom: <link rel="alternate" href="..."/> 或 <link href="..."/>
      const links = [...block.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
      const alternate = links.find((l) => /rel=["']alternate["']/i.test(l)) ?? links[0];
      if (alternate) {
        url = decodeEntities(/href=["']([^"']+)["']/i.exec(alternate)?.[1] ?? "");
      }
      if (!url) url = pickTag(block, "id");
    } else {
      url = pickTag(block, "link");
      // 有些 RSS 是 <link/> 带 href 的自闭合形式
      if (!url) {
        const m = /<link\b[^>]*href=["']([^"']+)["']/i.exec(block);
        if (m) url = decodeEntities(m[1]);
      }
      if (!url) url = pickTag(block, "guid");
    }

    const rawSummary =
      pickTag(block, "description") ||
      pickTag(block, "summary") ||
      pickTag(block, "content:encoded") ||
      pickTag(block, "content");

    const publishedAt =
      parseDate(pickTag(block, "pubDate")) ||
      parseDate(pickTag(block, "published")) ||
      parseDate(pickTag(block, "updated")) ||
      parseDate(pickTag(block, "dc:date"));

    if (!title || !url) continue;

    items.push({
      title,
      url,
      summary: stripHtml(rawSummary).slice(0, 500),
      publishedAt,
      source: sourceName,
    });
  }

  return { title: channelTitle, items };
}