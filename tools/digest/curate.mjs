/**
 * 让模型从候选里挑 5 条，并写中文摘要。
 *
 * 关键约束：
 * - 只能从给定编号里挑，不能自己编条目
 * - 三个栏目都要有，避免全被 V2EX 这种高频源占满
 * - 摘要必须基于给出的标题和简介，不许补充原文没有的信息
 */

import { API_URL, MODEL } from "./config.mjs";

const SYSTEM_PROMPT = `你是「第三层抽屉」这个个人博客的选刊编辑。

每天从前一天的科技与开发资讯里挑 5 条值得一读的，写给中文读者看。

【挑选标准】
1. 优先有信息增量的：新技术、新工具、有观点的分析、值得借鉴的工程实践。
2. 排除纯水贴：求助帖、二手交易、招募、情绪宣泄、无实质内容的问答、广告。
3. 三个栏目尽量都有覆盖（AI / 编程 / 设计产品），不要全挤在同一个源。
4. 同一来源最多 2 条，避免版面上被单一站点占据。

【写摘要的要求】
- 每条 40～70 字中文，说清「这是什么、为什么值得看」。
- 只依据给出的标题和简介，不许补充你没看到的内容。
- 不吹捧、不用「震惊」「必看」这类词。
- 不用第一人称，不加自己的评价立场。

【输出格式】
只输出 JSON，不要任何解释文字或代码块标记：
{
  "items": [
    { "index": 12, "topic": "AI / 机器学习", "summary": "……" }
  ]
}
其中 index 必须是候选列表里的编号，topic 必须是给定的三个栏目之一。`;

/**
 * 拼候选清单。
 *
 * 编号用 1 开始，方便模型引用；同时在提示里保留来源，
 * 让模型能自己判断「同一来源最多 2 条」。
 */
function buildCandidateList(candidates) {
  return candidates
    .map((c, i) => {
      const n = i + 1;
      const summary = c.summary ? c.summary.slice(0, 120) : "（无简介）";
      return `${n}. [${c.source}] ${c.title}\n   栏目建议：${c.topic}\n   简介：${summary}`;
    })
    .join("\n\n");
}

export async function curate(candidates, apiKey) {
  const list = buildCandidateList(candidates);

  const userPrompt = `下面是今天抓到的 ${candidates.length} 条候选，请按标准挑 5 条并写摘要。

${list}`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      // 必须给足。deepseek-flash 是会先「思考」的模型，
      // max_tokens 同时限制思考过程和正式回答——原来给 1500，
      // 某次思考就吃光了全部额度，content 直接是空字符串，
      // 表现为「模型没有返回可解析的 JSON」，很难看出真实原因。
      // 按实际用量付费，给大不浪费。
      max_tokens: 4000,
      response_format: { type: "json_object" },
      stream: false,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`模型返回 ${res.status}：${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const choice = data?.choices?.[0];
  const raw = choice?.message?.content ?? "";
  const finish = choice?.finish_reason ?? "未知";
  const usage = data?.usage;

  // 空回答单独报错，并把 finish_reason / 用量带上。
  // 否则只会看到「没有返回可解析的 JSON，原文前 300 字：」后面一片空白。
  if (!String(raw).trim()) {
    const why =
      finish === "length"
        ? "思考过程把 max_tokens 用完了，正式回答被截断成空"
        : "模型返回了空内容";
    throw new Error(
      `${why}（finish_reason=${finish}，` +
        `completion=${usage?.completion_tokens ?? "?"} ` +
        `其中思考=${usage?.completion_tokens_details?.reasoning_tokens ?? "?"}）`,
    );
  }

  const parsed = parseModelJson(raw);
  if (!parsed) {
    throw new Error(
      `模型没有返回可解析的 JSON（finish_reason=${finish}），原文前 300 字：${raw.slice(0, 300)}`,
    );
  }

  const picked = [];

  for (const entry of parsed.items ?? []) {
    const index = Number(entry?.index);
    if (!Number.isInteger(index) || index < 1 || index > candidates.length) continue;

    const source = candidates[index - 1];
    const summary = String(entry?.summary ?? "").trim();
    if (!summary) continue;

    const topic = String(entry?.topic ?? "").trim() || source.topic;

    picked.push({
      title: source.title,
      url: source.url,
      source: source.source,
      topic,
      summary,
      publishedAt: source.publishedAt ? source.publishedAt.toISOString() : null,
    });
  }

  // 模型可能少给几条，只警告不失败——人工审核那一步会补
  if (picked.length === 0) {
    throw new Error("模型一条也没挑出来");
  }

  return picked;
}

/** 模型有时会套一层 ```json，这里兜住 */
function parseModelJson(raw) {
  const text = String(raw).trim();
  const attempts = [
    text,
    text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, ""),
    text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1),
  ];

  for (const candidate of attempts) {
    if (!candidate) continue;
    try {
      const obj = JSON.parse(candidate);
      if (obj && typeof obj === "object") return obj;
    } catch {
      /* 试下一种 */
    }
  }
  return null;
}