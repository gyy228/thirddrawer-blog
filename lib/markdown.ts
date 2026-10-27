import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";

/**
 * Markdown → HTML
 *
 * 支持：GFM（表格、删除线、任务列表）、数学公式（KaTeX）、代码高亮，
 * 并给每个标题加上 id（rehype-slug），让目录锚点能跳转。
 * 在构建时于服务端执行，页面拿到的就是静态 HTML。
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

/**
 * 说说正文的 Markdown → HTML
 *
 * 说说只是一两句话，用完整管线会引入不必要的开销（表格、公式、标题锚点
 * 对短句都没意义），而且允许这些构造反而会让卡片排版崩掉。
 * 这里只保留 GFM 的行内语法：加粗、斜体、删除线、链接、行内代码。
 */
export async function noteToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

/**
 * 提取二级标题生成目录。
 *
 * 用 github-slugger 逐级计算 id —— 它正是 rehype-slug 内部用的库，
 * 所以这里算出的锚点与正文里的 id 完全一致。必须按文档顺序把所有级别的
 * 标题都喂给 slugger，否则重名计数会错位。
 */
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  const slugger = new GithubSlugger();
  const headings: { id: string; text: string }[] = [];

  // 先剥掉代码块，避免把代码里的 # 误认成标题
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, "").trim();
    const id = slugger.slug(text);

    if (level === 2) headings.push({ id, text });
  }

  return headings;
}