import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass rounded-2xl p-10 text-center sm:p-14">
      <p className="font-mono text-5xl font-semibold text-accent-text">404</p>
      <p className="mt-4 text-sm text-fg-muted">这个页面不存在。</p>
      <Link
        href="/"
        className="glass lift mt-7 inline-block rounded-full px-4 py-2 text-sm text-fg-muted"
      >
        回到首页
      </Link>
    </div>
  );
}