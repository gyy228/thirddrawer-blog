# 桃之夭夭

> 抽屉里全是说不清有什么用、却舍不得扔的东西。

一个毛玻璃风格的个人博客。Next.js 16 + React 19 + Tailwind 4 + TypeScript，内容为纯 Markdown，构建成**静态站点**后部署在 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:3000/thirddrawer-blog
```

注意地址带着 `/thirddrawer-blog` 子路径——因为 GitHub Pages 的项目仓库部署在这个路径下（`basePath`），本地开发也保持一致。

其他命令：

```bash
npm run build    # 生成静态站点到 out/
npm run lint     # ESLint
```

**没有 `npm start`**：本站采用 `output: "export"` 静态导出，没有服务器运行时，`next start` 不再适用。要预览构建产物，把 `out/` 目录整个挂到 `/thirddrawer-blog/` 路径下即可，日常开发用 `npm run dev` 就够了。

## 写一篇文章

在 `posts/` 下新建一个 `.md` 文件，文件名就是网址 slug：

```
posts/my-first-post.md  →  /posts/my-first-post
```

开头用 front-matter 描述元信息：

```markdown
---
title: 标题
date: 2026-10-27
tags: [随笔, 工具]
summary: 显示在列表页的一句话摘要
cover: https://example.com/cover.jpg   # 可选
draft: false                            # 设为 true 则不发布
---

正文从这里开始。
```

文件名**尽量用英文**，改了文件名等于改了网址。

正文支持 GFM（表格、删除线、任务列表）、代码高亮、LaTeX 公式（`$...$` 与 `$$...$$`），二级标题会自动生成目录。

## 改站点信息

站点名、副标题、作者、导航、个人名片、联系方式都集中在 `siteConfig.ts`，改文案只需要动这一个文件。

## 目录结构

```
app/
  page.tsx              首页：个人名片 + 文章列表
  posts/[slug]/         文章详情：目录、正文、相邻导航
  archive/              归档：按年份 + 标签统计
  about/                关于
  globals.css           设计令牌、毛玻璃、背景动效、代码高亮配色
components/             导航、主题切换、卡片、名片、阅读进度
lib/
  posts.ts              扫描并解析 posts/ 下的 Markdown
  markdown.ts           remark/rehype 渲染管线
posts/                  文章源文件
siteConfig.ts           全站配置
```

## 部署

本站是纯静态站点，通过 GitHub Actions 自动部署到 GitHub Pages。

工作流在 `.github/workflows/deploy.yml`：推送到 `main` 分支即触发——安装依赖、跑 lint、`npm run build` 生成 `out/`，再上传并发布到 Pages。

**首次启用需要在仓库里做两件事**：

1. **把仓库设为 Public**（免费的 GitHub Pages 只对公开仓库开放）
2. **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**

之后每次推送会自动重新部署，站点地址是 `https://<用户名>.github.io/thirddrawer-blog/`。

> 换到自定义域名时，记得同步删掉 `next.config.ts` 里的 `basePath`，否则资源路径会多一层前缀。

## 说明

- 主题跟随系统，右上角可手动切换。
- 深色/浅色、玻璃、高亮配色全部走 CSS 变量，集中在 `app/globals.css` 顶部。
- 不用 Google Fonts：字体使用中文优先的系统字体栈，构建不依赖境外网络。

## 参考

「公网前端 + 本地管理控制台」的双目录架构思路参考了 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)，代码为独立实现。