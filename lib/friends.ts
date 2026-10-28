import raw from "@/data/friends.json";

/**
 * 友链清单。
 *
 * 数据在 data/friends.json，控制台直接读写。
 * 加一条友链不用改源码。
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

export interface FriendsData {
  links: FriendLink[];
  siteInfo: {
    name: string;
    url: string;
    description: string;
    avatar?: string;
  };
  applyInfo: {
    email: string;
    note: string;
  };
}

const data = raw as FriendsData;

export const FRIEND_LINKS: FriendLink[] = data.links;

/** 本站信息，用于友链申请格式说明 */
export const SITE_INFO = data.siteInfo;

/** 申请方式 */
export const APPLY_INFO = data.applyInfo;