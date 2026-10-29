"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * 需要「复制 / 另开页面」而不是直接跳转的联系方式。
 *
 * 为什么有些联系方式不能做普通链接：
 * - QQ：wpa.qq.com 的临时会话依赖对方账号的隐私设置，
 *   没开就落到「抱歉，无法发起临时会话」页面。
 * - 邮箱：`mailto:` 在没配默认邮件客户端的机器上点了毫无反应。
 *
 * 两者的共同点是「点了可能什么都不发生」，所以统一改成
 * 就地弹出一块内容：值可选中、能复制、必要时给一个网页版入口。
 */

/**
 * 复制到剪贴板。
 *
 * 现代接口在非安全上下文、或用户拒绝剪贴板权限时会直接抛错，
 * 所以再退一层到 execCommand——它虽然过时，但几乎所有浏览器还认。
 * 两条路都失败才返回 false，由调用方给出「手动复制」提示。
 */
async function tryCopy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 继续尝试兜底方案
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function ContactPopover({
  label,
  value,
  hint,
  icon,
  variant = "badge",
  copyLabel = "复制",
  extra,
}: {
  /** 弹层顶部的小标题，也是按钮的 aria-label */
  label: string;
  /** 要展示和复制的内容 */
  value: string;
  /** 正常状态下的说明文字 */
  hint: string;
  /** 按钮里的图标（尺寸由调用方通过 className 控制） */
  icon: ReactNode;
  /** badge = 首页名片的圆形图标；pill = 关于页那种带文字的胶囊 */
  variant?: "badge" | "pill";
  copyLabel?: string;
  /** 可选的第二入口，比如「打开 QQ 邮箱」 */
  extra?: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // 点外面 / 按 Esc 关闭
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function copy() {
    const ok = await tryCopy(value);
    setCopied(ok);
    setFailed(!ok);

    if (ok) {
      window.setTimeout(() => setCopied(false), 1800);
      return;
    }

    // 复制不了就把内容选中，用户按 Ctrl+C 就行
    const node = valueRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          variant === "pill"
            ? "glass lift inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-fg-muted"
            : "grid size-9 place-items-center rounded-full bg-white/92 text-[#1c2434] ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-0.5 hover:ring-black/10"
        }
      >
        {icon}
        {variant === "pill" && label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`${label} 内容`}
          className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-[color:var(--glass-brd)] bg-[color:var(--popover-bg)] p-3 text-left shadow-xl"
        >
          <p className="text-[0.65rem] text-fg-faint">{label}</p>

          {/* 独立的块：一眼看出这是可以被选中/复制的内容 */}
          <p
            ref={valueRef}
            className="mt-1 break-all select-all rounded-lg bg-black/5 px-2 py-1 font-mono text-sm text-fg"
          >
            {value}
          </p>

          <button
            type="button"
            onClick={copy}
            className="mt-2 w-full rounded-lg bg-accent-soft px-2 py-1 text-xs text-accent-text transition-colors hover:bg-accent-soft/70"
          >
            {copied ? "已复制" : copyLabel}
          </button>

          {extra && (
            <a
              href={extra.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block w-full rounded-lg px-2 py-1 text-center text-xs text-accent-text transition-colors hover:bg-accent-soft"
            >
              {extra.label}
            </a>
          )}

          <p className="mt-2 text-[0.65rem] leading-relaxed text-fg-faint">
            {failed ? "已选中，按 Ctrl+C 复制。" : hint}
          </p>
        </div>
      )}
    </div>
  );
}