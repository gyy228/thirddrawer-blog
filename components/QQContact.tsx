"use client";

import { useEffect, useRef, useState } from "react";
import { QQMark } from "./icons";

/**
 * QQ 联系方式。
 *
 * 为什么不是普通链接：wpa.qq.com 的临时会话依赖对方账号的隐私设置
 * （「允许通过临时会话找到我」）。没开的话点开就是 QQ 的
 * 「抱歉，无法发起临时会话」页面，链接本身没写错，但等于没用。
 *
 * 所以点开就地弹出号码，附一个复制按钮——这条路径不依赖任何设置。
 * 朋友在 QQ 里手动加好友即可。
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

export function QQContact({ number }: { number: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const numberRef = useRef<HTMLParagraphElement>(null);
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
    const ok = await tryCopy(number);
    setCopied(ok);
    setFailed(!ok);

    if (ok) {
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      // 复制不了就把号码选中，用户按 Ctrl+C 就行
      const node = numberRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="QQ"
        aria-label="QQ"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full bg-white/92 text-[#1c2434] ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-0.5 hover:ring-black/10"
      >
        <QQMark className="size-[18px]" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="QQ 号码"
          className="absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-xl border border-[color:var(--glass-brd)] bg-[color:var(--popover-bg)] p-3 text-left shadow-xl"
        >
          <p className="text-[0.65rem] text-fg-faint">QQ</p>

          {/* 做成独立的块：一眼看出这是可以被选中/复制的号码 */}
          <p
            ref={numberRef}
            className="mt-1 select-all rounded-lg bg-black/5 px-2 py-1 font-mono text-sm tracking-wide text-fg"
          >
            {number}
          </p>

          <button
            type="button"
            onClick={copy}
            className="mt-2 w-full rounded-lg bg-accent-soft px-2 py-1 text-xs text-accent-text transition-colors hover:bg-accent-soft/70"
          >
            {copied ? "已复制" : "复制号码"}
          </button>

          <p className="mt-2 text-[0.65rem] leading-relaxed text-fg-faint">
            {failed
              ? "已选中号码，按 Ctrl+C 复制。"
              : "在 QQ 里搜索这个号码加好友就能聊。"}
          </p>
        </div>
      )}
    </div>
  );
}