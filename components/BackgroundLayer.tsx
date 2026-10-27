/**
 * 背景光晕层：三团缓慢漂移的模糊色块。
 * 纯 CSS 动画，无 JS；在系统开启「减弱动态效果」时会自动静止。
 */
export function BackgroundLayer() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob" />
      <div className="aurora-blob" />
      <div className="aurora-blob" />
    </div>
  );
}