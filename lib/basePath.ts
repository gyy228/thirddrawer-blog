/**
 * 站点的 basePath，只此一份。
 *
 * 站点部署在 GitHub Pages 的项目子路径下，public/ 里的资源实际地址带一层
 * /thirddrawer-blog 前缀，漏了就是线上全部 404。
 *
 * 换自定义域名时：删掉这个前缀，同时改 next.config.ts 的 basePath，
 * 以及 thirddrawer-studio/lib/site.ts 里的 SITE_BASE_PATH。
 */
export const BASE_PATH = "/thirddrawer-blog";