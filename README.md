# 第三层抽屉

> 抽屉里全是说不清有什么用、却舍不得扔的东西。

一个毛玻璃风格的个人博客。Next.js 16 + React 19 + Tailwind 4 + TypeScript，内容为纯 Markdown，构建成静态页面后部署在 Vercel。

## 本地运行

```bash
npm install
npm run dev      # http://localhost:3000
```

其他命令：

```bash
npm run build    # 生产构建
npm start        # 跑生产构建
npm run lint     # ESLint
```

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

推送到 GitHub 后，在 Vercel 导入仓库即可，Framework Preset 选 Next.js，无需额外配置。

## 说明

- 主题跟随系统，右上角可手动切换。
- 深色/浅色、玻璃、高亮配色全部走 CSS 变量，集中在 `app/globals.css` 顶部。
- 不用 Google Fonts：字体使用中文优先的系统字体栈，构建不依赖境外网络。

## 参考

「公网前端 + 本地管理控制台」的双目录架构思路参考了 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs)，代码为独立实现。