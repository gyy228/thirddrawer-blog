/**
 * 个人名片的占位。
 *
 * 站长说这块以后再做，所以先留一个同尺寸的虚线框，
 * 而不是彻底空着——空着会让人以为页面坏了。
 */
export function ProfilePlaceholder() {
  return (
    <div className="glass flex min-h-[11.5rem] flex-col items-center justify-center gap-2 rounded-2xl border-dashed p-5 text-center">
      <div className="grid size-14 place-items-center rounded-full border border-dashed border-[color:var(--glass-brd)] text-fg-faint">
        <span className="text-lg">?</span>
      </div>
      <p className="text-xs text-fg-faint">个人名片待补</p>
    </div>
  );
}