import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 纯静态导出：本站所有页面在构建时就已预渲染，不需要服务器运行时。
  // 注意：启用后不再支持 cacheComponents / PPR，`npm start` 也不再可用，
  // 本地开发用 `npm run dev`（页面在 /thirddrawer-blog 子路径下）。
  output: "export",

  // GitHub Pages 的项目仓库部署在 /<repo>/ 子路径下，
  // 不配 basePath 的话所有静态资源都会 404。
  basePath: "/thirddrawer-blog",

  // 生成 about/index.html 而不是 about.html，对各种静态托管都更兼容
  trailingSlash: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;