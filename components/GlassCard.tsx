import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** 是否启用悬停抬起效果（可点击的卡片才需要） */
  hover?: boolean;
}

/** 毛玻璃卡片：全站统一容器 */
export function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div className={`glass ${hover ? "lift" : ""} rounded-2xl ${className}`}>
      {children}
    </div>
  );
}