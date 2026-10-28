import raw from "@/data/tags.json";

/**
 * 预设标签。
 *
 * 控制台里写文章勾选它们，不用每次手打。归档页的筛选按钮也来自这里。
 *
 * 想增删：改 data/tags.json。已有的文章不会受影响——
 * 文章里的标签是自由的，这里只是给新文章提供选项。
 */
export const PRESET_TAGS: string[] = (raw as { tags: string[] }).tags;

/**
 * 合并「预设」与「文章里实际出现过的」标签。
 *
 * 归档页要显示的是真实存在的标签（带数量），
 * 预设里没被用过的标签不该出现在筛选里。
 */
export function mergeWithActual(actual: string[]): string[] {
  const seen = new Set(actual);
  const out = [...actual];

  for (const tag of PRESET_TAGS) {
    if (!seen.has(tag)) {
      // 预设里还没用过的排在后面，方便以后用
      out.push(tag);
      seen.add(tag);
    }
  }

  return out;
}