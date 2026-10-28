import { buildAiIndex } from "@/lib/aiIndex";

/**
 * 站内内容索引，供 AI 助手作为上下文。
 *
 * 静态导出下这是构建时生成的一个普通 JSON 文件，
 * 内容随文章/说说/项目的变更一起更新，不需要额外维护。
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildAiIndex(), {
    headers: {
      // 允许 AI Worker 跨域读取
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}