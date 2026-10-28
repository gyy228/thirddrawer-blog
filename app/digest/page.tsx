import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import {
  formatDigestDate,
  getAllDigests,
  groupByTopic,
} from "@/lib/digests";
import type { DigestItem } from "@/lib/digests";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "每日选刊",
  description: `${siteConfig.title}每天挑几条值得读的。`,
};

export default function DigestPage() {
  const digests = getAllDigests();

  return (
    <div className="space-y-8">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">每日选刊</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {digests.length > 0
            ? "每天从订阅的源里挑几条值得读的，附一句说明。都是审核过才放上来的。"
            : "这里还没开始。"}
        </p>
      </header>

      {digests.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          第一期还没出来。选刊是每天定时抓取、人工核对后才发布的，稍后再来看看。
        </p>
      ) : (
        <div className="space-y-10">
          {digests.map((digest) => (
            <section key={digest.date} className="space-y-4">
              <div className="flex items-baseline gap-3 px-1">
                <h2 className="text-lg font-medium">
                  {formatDigestDate(digest.date)}
                </h2>
                <span className="font-mono text-xs text-fg-faint">
                  {digest.items.length} 条
                </span>
              </div>

              <div className="space-y-3">
                {[...groupByTopic(digest.items)].map(([topic, items]) => (
                  <div key={topic} className="space-y-2">
                    <p className="px-1 text-xs font-medium text-accent-text">
                      {topic}
                    </p>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id} className="reveal">
                          <DigestCard item={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DigestCard({ item }: { item: DigestItem }) {
  return (
    <GlassCard className="p-4">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-start justify-between gap-3"
      >
        <h3 className="text-sm font-medium leading-snug transition-colors group-hover:text-accent-text">
          {item.title}
        </h3>
        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-fg-faint transition-colors group-hover:text-accent-text" />
      </a>

      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{item.summary}</p>

      <p className="mt-2 font-mono text-xs text-fg-faint">{item.source}</p>
    </GlassCard>
  );
}