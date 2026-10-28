/**
 * 订阅源清单。
 *
 * 全部实测可直接访问（2026-10）。需要带浏览器 UA，否则多数站返回 403。
 * 机器之心 / 36氪 / 优设 返回的是 HTML 不是 feed，已排除；
 * 酷壳已无法访问，虎嗅超时，同样排除。
 */

export const FEEDS = [
  {
    name: "少数派",
    url: "https://sspai.com/feed",
    topic: "设计 / 产品",
  },
  {
    name: "极客公园",
    url: "https://www.geekpark.net/rss",
    topic: "设计 / 产品",
  },
  {
    name: "爱范儿",
    url: "https://www.ifanr.com/feed",
    topic: "设计 / 产品",
  },
  {
    name: "Solidot",
    url: "https://www.solidot.org/index.rss",
    topic: "AI / 机器学习",
  },
  {
    name: "开源中国",
    url: "https://www.oschina.net/news/rss",
    topic: "编程 / 工程实践",
  },
  {
    name: "掘金",
    url: "https://juejin.cn/rss",
    topic: "编程 / 工程实践",
  },
  {
    name: "V2EX",
    url: "https://www.v2ex.com/index.xml",
    topic: "编程 / 工程实践",
  },
  {
    name: "阮一峰",
    url: "https://www.ruanyifeng.com/blog/atom.xml",
    topic: "编程 / 工程实践",
  },
];

/** 站内选刊页展示用的三个栏目 */
export const TOPICS = ["AI / 机器学习", "编程 / 工程实践", "设计 / 产品"];

/**
 * 部分站点会拒绝没有 UA 的请求（实测 403），
 * 伪装成普通浏览器是最省事的做法。
 */
export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";