import { getAllPosts } from "./posts";
import { getAllNotes } from "./notes";
import { getProjects } from "./projects";
import { siteConfig } from "@/siteConfig";

/**
 * 给 AI 用的站内内容索引。
 *
 * 设计取向：只放「用于定位和回答」的最小信息，不放全文。
 * - 文章：标题、地址、日期、标签、摘要
 * - 说说：日期、正文截断（说说本身就是短句，截断足够）
 * - 项目：名称、简介、地址
 *
 * 不放全文的理由：一是体积，二是让模型回答时以摘要为依据，
 * 减少「看似引用了原文其实在编」的概率。
 *
 * 注意：草稿不会进入索引——getAllPosts/getAllNotes 默认已过滤。
 */

/** 说说正文在索引里的最大长度 */
const NOTE_EXCERPT = 160;

export interface AiIndex {
  site: string;
  description: string;
  /** 索引对应的内容快照日期，用构建日期而不是当前时间，避免每次构建都变 */
  snapshot: string;
  posts: {
    title: string;
    url: string;
    date: string;
    tags: string[];
    summary: string;
  }[];
  notes: {
    date: string;
    excerpt: string;
  }[];
  projects: {
    name: string;
    description: string;
    url?: string;
  }[];
}

export function buildAiIndex(): AiIndex {
  const posts = getAllPosts();
  const notes = getAllNotes();
  const projects = getProjects();

  return {
    site: siteConfig.title,
    description: siteConfig.description,
    snapshot: siteConfig.buildDate,
    posts: posts.map((post) => ({
      title: post.title,
      url: `/posts/${post.slug}/`,
      date: post.date,
      tags: post.tags,
      summary: post.summary,
    })),
    notes: notes.map((note) => ({
      date: note.date,
      excerpt:
        note.content.length > NOTE_EXCERPT
          ? `${note.content.slice(0, NOTE_EXCERPT)}…`
          : note.content,
    })),
    projects: projects.map((project) => ({
      name: project.name,
      description: project.description,
      url: project.url,
    })),
  };
}