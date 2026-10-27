import type { Metadata } from "next";
import { GlassCard } from "@/components/GlassCard";
import { GithubMark } from "@/components/icons";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { getProjects, STATUS_META } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "项目",
  description: `${siteConfig.title}做过和正在做的东西。`,
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">项目</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {projects.length > 0
            ? `一共 ${projects.length} 个，从最近的开始。`
            : "还没往这里放东西。"}
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          抽屉这一格里还是空的。
        </p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_META[project.status];

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">{project.name}</h2>
        <span className={`rounded px-1.5 py-0.5 text-[0.7rem] font-medium ${status.className}`}>
          {status.label}
        </span>
        <span className="font-mono text-xs text-fg-faint">{project.year}</span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{project.description}</p>

      {project.detail && (
        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{project.detail}</p>
      )}

      {project.stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <span
              key={item}
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent-text"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {(project.url || project.repo) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              <ExternalLink className="size-3.5" />
              打开
              <ArrowUpRight className="size-3 opacity-60" />
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--glass-brd)] px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
            >
              <GithubMark className="size-3.5" />
              源码
            </a>
          )}
        </div>
      )}
    </GlassCard>
  );
}