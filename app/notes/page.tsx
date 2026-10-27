import type { Metadata } from "next";
import { NoteCard } from "@/components/NoteCard";
import { getAllNotes, groupNotesByMonth } from "@/lib/notes";
import { siteConfig } from "@/siteConfig";

export const metadata: Metadata = {
  title: "说说",
  description: `${siteConfig.title}的零碎记录：不用写成长文的那几句。`,
};

export default function NotesPage() {
  const notes = getAllNotes();
  const groups = groupNotesByMonth(notes);

  return (
    <div className="space-y-6">
      <header className="px-1">
        <h1 className="text-2xl font-semibold">说说</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {notes.length > 0
            ? `不用写成长文的几句，一共 ${notes.length} 条。`
            : "这里放那些不值得写成长文、又想记下来的几句话。"}
        </p>
      </header>

      {groups.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-fg-muted">
          还没有说说。
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <h2 className="px-1 font-mono text-sm text-fg-faint">{group.label}</h2>
            <div className="space-y-2">
              {group.notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}