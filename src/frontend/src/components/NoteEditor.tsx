import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useUpdateNote,
} from "@/hooks/useNotes";
import type { NoteId } from "@/types";
import {
  Bold,
  FileText,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface NoteEditorProps {
  noteId: NoteId | null;
  isCreating: boolean;
  onNoteCreated: (id: NoteId) => void;
  onNoteDeleted: () => void;
}

// --- Rich Text Toolbar ---
function RichToolbar({
  onExec,
}: { onExec: (cmd: string, value?: string) => void }) {
  const tools: Array<{
    icon: React.ReactNode;
    cmd: string;
    label: string;
    value?: string;
  }> = [
    { icon: <Bold className="w-3.5 h-3.5" />, cmd: "bold", label: "Bold" },
    {
      icon: <Italic className="w-3.5 h-3.5" />,
      cmd: "italic",
      label: "Italic",
    },
    {
      icon: <Heading1 className="w-3.5 h-3.5" />,
      cmd: "formatBlock",
      value: "H1",
      label: "Heading 1",
    },
    {
      icon: <Heading2 className="w-3.5 h-3.5" />,
      cmd: "formatBlock",
      value: "H2",
      label: "Heading 2",
    },
    {
      icon: <List className="w-3.5 h-3.5" />,
      cmd: "insertUnorderedList",
      label: "Bullet List",
    },
    {
      icon: <ListOrdered className="w-3.5 h-3.5" />,
      cmd: "insertOrderedList",
      label: "Numbered List",
    },
  ];

  return (
    <div className="flex items-center gap-0.5 px-1" data-ocid="editor.toolbar">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          aria-label={t.label}
          title={t.label}
          onMouseDown={(e) => {
            e.preventDefault();
            onExec(t.cmd, t.value);
          }}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}

// --- Tag Input ---
function TagInput({
  tags,
  onChange,
}: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      {tags.map((tag) => (
        <span key={tag} className="tag-base gap-1">
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="hover:text-destructive transition-colors"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-[80px]"
        placeholder="Add tag…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        data-ocid="editor.tag_input"
      />
    </div>
  );
}

// Imperative HTML editor — uses a ref-based approach to avoid contentEditable + React state conflicts
function RichEditor({
  initialHtml,
  onChange,
  editorRef,
}: {
  initialHtml: string;
  onChange: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Use a key-based reset to sync initial content imperatively
  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className="min-h-[400px] w-full bg-transparent text-foreground text-body-lg outline-none font-body leading-relaxed cursor-text
        [&>h1]:text-display-lg [&>h1]:font-display [&>h1]:mb-3 [&>h1]:mt-5
        [&>h2]:text-display-md [&>h2]:font-display [&>h2]:mb-2 [&>h2]:mt-4
        [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ul]:space-y-0.5
        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&>ol]:space-y-0.5"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled rich text editor
      dangerouslySetInnerHTML={{ __html: initialHtml }}
      onInput={onChange}
      data-ocid="editor.canvas_target"
      aria-label="Note body"
      aria-multiline="true"
    />
  );
}

// --- Main Editor ---
export function NoteEditor({
  noteId,
  isCreating,
  onNoteCreated,
  onNoteDeleted,
}: NoteEditorProps) {
  const { data: note, isLoading } = useNote(noteId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  // Key to force-remount RichEditor when note changes
  const [editorKey, setEditorKey] = useState(0);
  const [initialHtml, setInitialHtml] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({ noteId, isCreating, title, tags });

  // Keep ref current for use inside callbacks
  stateRef.current = { noteId, isCreating, title, tags };

  // Sync when note ID or creating mode changes
  useEffect(() => {
    if (isCreating) {
      setTitle("");
      setTags([]);
      setIsDirty(false);
      setInitialHtml("");
      setEditorKey((k) => k + 1);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isCreating]);

  useEffect(() => {
    if (!isCreating && note) {
      setTitle(note.title);
      setTags(note.tags);
      setIsDirty(false);
      setInitialHtml(note.body);
      setEditorKey((k) => k + 1);
    }
  }, [note, isCreating]);

  const saveNote = useCallback(
    async (silent = false) => {
      const {
        noteId: currentId,
        isCreating: currentCreating,
        title: currentTitle,
        tags: currentTags,
      } = stateRef.current;
      const body = editorRef.current?.innerHTML ?? "";
      const input = {
        title: currentTitle.trim() || "Untitled",
        body,
        tags: currentTags,
      };
      try {
        if (currentCreating) {
          const created = await createNote.mutateAsync(input);
          onNoteCreated(created.id);
          if (!silent) toast.success("Note created");
        } else if (currentId !== null) {
          await updateNote.mutateAsync({ id: currentId, input });
          setIsDirty(false);
          setAutoSaving(false);
          if (!silent) toast.success("Note saved");
        }
      } catch {
        if (!silent) toast.error("Failed to save note");
        setAutoSaving(false);
      }
    },
    [createNote, updateNote, onNoteCreated],
  );

  const triggerAutoSave = useCallback(() => {
    const { isCreating: creating, noteId: id } = stateRef.current;
    if (creating || id === null) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsDirty(true);
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaving(true);
      saveNote(true);
    }, 1000);
  }, [saveNote]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const handleExecCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
    triggerAutoSave();
  };

  const handleManualSave = async () => {
    setIsSavingManual(true);
    await saveNote(false);
    setIsSavingManual(false);
  };

  const handleDelete = async () => {
    if (noteId === null) return;
    try {
      await deleteNote.mutateAsync(noteId);
      onNoteDeleted();
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const isSaving =
    isSavingManual || createNote.isPending || updateNote.isPending;

  if (!isCreating && noteId === null) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center p-10"
        data-ocid="editor.empty_state"
      >
        <FileText className="w-14 h-14 text-muted-foreground/20 mb-5" />
        <h2 className="text-display-sm text-muted-foreground/50 mb-2">
          Select a note
        </h2>
        <p className="text-body-sm text-muted-foreground/40 max-w-xs">
          Choose a note from the sidebar, or create a new one to get started.
        </p>
      </div>
    );
  }

  if (isLoading && noteId !== null) {
    return (
      <div
        className="h-full p-8 space-y-4 max-w-3xl mx-auto"
        data-ocid="editor.loading_state"
      >
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-2 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-ocid="editor.panel">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <RichToolbar onExec={handleExecCommand} />
        </div>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-muted-hint" data-ocid="editor.loading_state">
              Saving…
            </span>
          )}
          {isDirty && !autoSaving && (
            <span className="text-muted-hint">Unsaved</span>
          )}

          {!isCreating && noteId !== null && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                  disabled={deleteNote.isPending}
                  data-ocid="editor.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="editor.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The note "
                    {title || "Untitled"}" will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="editor.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="editor.confirm_button"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isCreating && (
            <Button
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              className="gap-1.5"
              data-ocid="editor.save_button"
            >
              {isSaving ? "Creating…" : "Create Note"}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              triggerAutoSave();
            }}
            placeholder="Note title"
            className="text-display-md border-none bg-transparent px-0 placeholder:text-muted-foreground/40 focus-visible:ring-0 shadow-none font-display"
            data-ocid="editor.title_input"
          />

          <div className="pb-3 border-b border-border/60">
            <TagInput
              tags={tags}
              onChange={(t) => {
                setTags(t);
                triggerAutoSave();
              }}
            />
          </div>

          <RichEditor
            key={editorKey}
            initialHtml={initialHtml}
            onChange={triggerAutoSave}
            editorRef={editorRef}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 bg-muted/30 px-6 md:px-10 py-2 shrink-0">
        <p className="text-muted-hint text-right">
          {!isCreating && note
            ? `Last edited ${new Date(
                Number(note.updatedAt) / 1_000_000,
              ).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}`
            : "New note"}
          &nbsp;· © {new Date().getFullYear()} Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
