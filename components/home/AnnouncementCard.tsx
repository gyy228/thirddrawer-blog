import Link from "next/link";
import { siteConfig } from "@/siteConfig";

export function AnnouncementCard() {
  const { title, text, link, linkLabel } = siteConfig.announcement;

  return (
    <section className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <span className="text-accent-text">#</span>
        {title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-fg-muted">{text}</p>
      {link && (
        <Link
          href={link}
          className="mt-3 inline-block rounded-lg bg-accent-soft px-3 py-1 text-xs text-accent-text transition-colors hover:bg-accent-soft/70"
        >
          {linkLabel}
        </Link>
      )}
    </section>
  );
}