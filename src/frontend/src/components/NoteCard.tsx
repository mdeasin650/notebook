import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  isActive?: boolean;
  onClick: () => void;
  index: number;
}

function relativeTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diffMs = Date.now() - ms;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ms).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?(p|div|h[1-6]|li)[^>]*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function NoteCard({ note, isActive, onClick, index }: NoteCardProps) {
  const preview = stripHtml(note.body);

  return (
    <button
      type="button"
      className={[
        "note-card w-full text-left group",
        isActive ? "border-accent/60 bg-accent/5 shadow-sm" : "",
      ].join(" ")}
      onClick={onClick}
      data-ocid={`notes.item.${index}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-body-lg font-semibold text-foreground truncate min-w-0 flex-1">
          {note.title || "Untitled"}
        </h3>
        <time className="text-muted-hint shrink-0 pt-0.5">
          {relativeTime(note.updatedAt)}
        </time>
      </div>

      {preview && (
        <p className="text-body-sm text-muted-foreground line-clamp-2 mb-2">
          {preview}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-base">
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="tag-base">+{note.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}
