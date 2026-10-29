"use client";

import { useEffect, useState } from "react";

/**
 * 日历卡片。
 *
 * 静态导出时构建日期会被冻进 HTML，所以「今天」必须在客户端算。
 *
 * 服务端先渲染一个同高的空壳，挂载后再填内容：
 * 这样既不会 hydration 不匹配，也不会因为晚一拍而跳动。
 */

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = first.getDay();

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 补到整行，避免最后一行塌陷
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function CalendarCard() {
  const [now, setNow] = useState<{ year: number; month: number; day: number } | null>(null);

  useEffect(() => {
    // 包一层 async：直接同步 setState 会触发
    // react-hooks/set-state-in-effect，这个仓库里统一用这种写法绕开
    void (async () => {
      const d = new Date();
      setNow({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    })();
  }, []);

  if (!now) {
    return (
      <section className="glass rounded-2xl p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
          <span className="text-accent-text">#</span>
          日期
        </h3>
        <div className="mt-3 h-[11.5rem]" aria-hidden="true" />
      </section>
    );
  }

  const cells = buildMonth(now.year, now.month);

  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <span className="text-accent-text">#</span>
        日期
      </h3>

      <p className="mt-2 text-center text-xs text-fg-muted">
        {now.year} 年 {now.month + 1} 月
      </p>

      <div className="mt-2 grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 text-[0.65rem] text-fg-faint">
            {w}
          </span>
        ))}

        {cells.map((day, index) => {
          const isToday = day === now.day;
          return (
            <span
              key={index}
              className={[
                "grid aspect-square place-items-center rounded text-[0.7rem]",
                day === null
                  ? ""
                  : isToday
                    ? "bg-accent font-medium text-white"
                    : "text-fg-muted",
              ].join(" ")}
            >
              {day ?? ""}
            </span>
          );
        })}
      </div>
    </section>
  );
}