/**
 * 友链清单。
 *
 * 和项目一样是需要人工维护的清单，用 TS 数据而不是 Markdown：
 * 改的时候类型检查会拦住写错的字段。
 *
 * 加一个友链就往数组里加一项。
 */

export interface FriendLink {
  /** 稳定标识，也用作渲染的 key */
  slug: string;
  /** 对方站名 */
  name: string;
  /** 站点地址，必须带协议头 */
  url: string;
  /** 头像或图标地址；留空则显示站名首字 */
  avatar?: string;
  /** 一句话介绍 */
  description: string;
}

export const FRIEND_LINKS: FriendLink[] = [
  // ── 示例条目 ──────────────────────────────────
  // 下面几条是占位示例，用来展示排版效果。
  // 有了真实友链就删掉它们，或者在控制台/本文件里替换。
  {
    slug: "example-1",
    name: "示例友链一",
    url: "https://example.com",
    description: "这里放朋友的一句话介绍，比如「写代码，也写点别的」。",
  },
  {
    slug: "example-2",
    name: "示例友链二",
    url: "https://example.com",
    description: "每条友链占一行，介绍太长会自动折行。",
  },
  {
    slug: "example-3",
    name: "示例友链三",
    url: "https://example.com",
    description: "没有头像时显示站名第一个字，配色和站点保持一致。",
  },
];

/** 本站信息，用于友链申请格式说明 */
export const SITE_INFO = {
  name: "第三层抽屉",
  url: "https://gyy228.github.io/thirddrawer-blog/",
  description: "抽屉里全是说不清有什么用、却舍不得扔的东西。",
  /** 头像地址：提供一条现成的图标，留空则显示首字 */
  avatar: "https://gyy228.github.io/thirddrawer-blog/icon.svg",
} as const;

/** 申请方式：改成你实际愿意接收的渠道 */
export const APPLY_INFO = {
  /** 接收申请的邮箱 */
  email: "2065738974@qq.com",
  /** 附加说明 */
  note: "邮件标题请带上「友链」二字，方便一眼找到。",
} as const;