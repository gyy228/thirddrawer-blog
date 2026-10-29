import type { SVGProps } from "react";

/**
 * 站名前的四角星，纯装饰。
 *
 * 用 currentColor，跟着导航文字色走，两种主题都不用另配。
 */
export function SparkMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 1.8c.7 4.9 3.2 7.5 8.1 8.2-4.9.7-7.4 3.3-8.1 8.2-.7-4.9-3.2-7.5-8.1-8.2 4.9-.7 7.4-3.3 8.1-8.2Z" />
    </svg>
  );
}

/**
 * 品牌标记。
 *
 * lucide-react 1.x 移除了全部品牌图标（Github 已不存在），这几个只能自绘。
 *
 * QQ / 哔哩哔哩 / 抖音 用各自的品牌配色画成实色，
 * GitHub 和邮箱用 currentColor（它们本来就是单色标记）。
 *
 * 因为这些彩色图标里含黑色和白色，必须放在浅底上才看得清，
 * 所以名片上的图标底座统一是白色圆片，两种主题下都一样。
 * 深色主题里如果底座跟着变暗，黑企鹅会直接消失。
 */

/** GitHub 官方 mark */
export function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const QQ_BLACK = "#111318";
const QQ_WHITE = "#fdfdfd";
const QQ_ORANGE = "#f5a623";
const QQ_RED = "#e8453c";

/**
 * QQ：黑身白肚的企鹅。
 *
 * 比例要对：企鹅本体是竖长的（高宽比约 1.25），画成圆球就变成别的动物了。
 * 另外三样东西让它一眼是 QQ 而不是普通企鹅：
 * 两侧翘出来的翅膀、脖子上的红围巾（还垂下一角）、黄嘴黄脚。
 */
export function QQMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {/* 身体：竖长的蛋形 */}
      <ellipse cx="12" cy="12.3" rx="6.7" ry="8.7" fill={QQ_BLACK} />
      {/* 两侧翅膀，从身体边缘探出去一点 */}
      <path
        d="M5.9 11.2c-1.7 1.5-2.5 3.8-2.1 5.8.2 1.2 1.3 1.7 2.3 1.1 1.2-.7 2-2.2 2.3-4.1z"
        fill={QQ_BLACK}
      />
      <path
        d="M18.1 11.2c1.7 1.5 2.5 3.8 2.1 5.8-.2 1.2-1.3 1.7-2.3 1.1-1.2-.7-2-2.2-2.3-4.1z"
        fill={QQ_BLACK}
      />
      {/* 白肚 */}
      <ellipse cx="12" cy="14.6" rx="4.5" ry="6" fill={QQ_WHITE} />
      {/* 眼睛：眼白 + 瞳孔 + 高光。高光让小尺寸也显得有神 */}
      <ellipse cx="10.1" cy="7.3" rx="1.5" ry="1.85" fill={QQ_WHITE} />
      <ellipse cx="13.9" cy="7.3" rx="1.5" ry="1.85" fill={QQ_WHITE} />
      <circle cx="10.45" cy="7.65" r=".8" fill={QQ_BLACK} />
      <circle cx="13.55" cy="7.65" r=".8" fill={QQ_BLACK} />
      <circle cx="10.18" cy="7.4" r=".26" fill={QQ_WHITE} />
      <circle cx="13.28" cy="7.4" r=".26" fill={QQ_WHITE} />
      {/* 嘴：宽扁的橙黄色 */}
      <path
        d="M8.7 9.4h6.6c.3 0 .45.35.25.6l-2.7 1.7c-.5.3-1.2.3-1.7 0L8.45 10c-.2-.25-.05-.6.25-.6z"
        fill={QQ_ORANGE}
      />
      {/* 围巾垂下来的一角（先画，上沿会被围巾本身盖住） */}
      <path
        d="M7.35 12.7h1.95v3.6c0 .52-.44.95-.98.95s-.97-.43-.97-.95z"
        fill={QQ_RED}
      />
      {/* 围巾本身 */}
      <path
        d="M5.2 10.7c1.9 1.1 4.3 1.65 6.8 1.65s4.9-.55 6.8-1.65l.5 1.9c-2.1 1.3-4.6 1.9-7.3 1.9s-5.2-.6-7.3-1.9z"
        fill={QQ_RED}
      />
      {/* 脚 */}
      <ellipse cx="9.4" cy="21" rx="2.2" ry="1.05" fill={QQ_ORANGE} />
      <ellipse cx="14.6" cy="21" rx="2.2" ry="1.05" fill={QQ_ORANGE} />
    </svg>
  );
}

const BILI_BLUE = "#00a1d6";

/** 哔哩哔哩：品牌蓝的小电视 */
export function BilibiliMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect
        x="2.6"
        y="6.6"
        width="18.8"
        height="12.8"
        rx="4"
        fill="none"
        stroke={BILI_BLUE}
        strokeWidth="2.3"
      />
      <path
        d="M7 3.1 10.3 6.6M17 3.1 13.7 6.6"
        stroke={BILI_BLUE}
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="9.3" cy="13" rx="1.05" ry="1.45" fill={BILI_BLUE} />
      <ellipse cx="14.7" cy="13" rx="1.05" ry="1.45" fill={BILI_BLUE} />
    </svg>
  );
}

const DY_CYAN = "#25f4ee";
const DY_RED = "#fe2c55";

/** 抖音：黑色音符 + 青红外偏色（就是官方那个故障感） */
export function DouyinMark(props: SVGProps<SVGSVGElement>) {
  // 同一个音符画三遍：青色往左上偏、红色往右下偏、黑色压在上面
  const note =
    "M14.7 3.1c.55 2.45 2.15 4.05 4.6 4.35v3.05c-1.75 0-3.3-.5-4.6-1.5v6.55c0 3.5-2.7 6.25-6.2 6.25S2.3 19.05 2.3 15.55s2.5-6.1 5.85-6.25v3.1c-1.6.15-2.85 1.5-2.85 3.15 0 1.75 1.4 3.15 3.15 3.15s3.15-1.4 3.15-3.15V3.1z";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d={note} fill={DY_CYAN} transform="translate(-0.75,-0.7)" />
      <path d={note} fill={DY_RED} transform="translate(0.75,0.7)" />
      <path d={note} fill="#111318" />
    </svg>
  );
}