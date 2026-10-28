import raw from "@/data/about.json";

/**
 * 关于页的文案。
 *
 * 只抽「这是什么」和建站技术栈——这两块是纯介绍性文字，
 * 控制台里改起来最方便。
 *
 * 「关于我」那段刻意留在这里不动：它的正文是 siteConfig.profile.bio，
 * 属于个人身份信息，不该由程序代写。
 */

export interface AboutData {
  intro: string;
  stack: string[];
}

export const ABOUT = raw as AboutData;