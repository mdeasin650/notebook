import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes, useSearchNotes } from "@/hooks/useNotes";
import type { Note, NoteId } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { BookOpen, LogOut, Menu, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { NoteCard } from "./NoteCard";

interface SidebarProps {
  activeNoteId: NoteId | null;
  onSelectNote: (id: NoteId) => void;
  onNewNote: () => void;
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export function Sidebar({
  activeNoteId,
  onSelectNote,
  onNewNote,
  activeTag,
  onSelectTag,
  mobileOpen,
  onMobileToggle,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { clear: logout } = useInternetIdentity();

  const { data: allNotes = [], isLoading } = useNotes();
  const { data: searchResults = [] } = useSearchNotes(searchTerm);

  const displayNotes: Note[] = searchTerm.trim() ? searchResults : allNotes;
  const allTags = Array.from(new Set(allNotes.flatMap((n) => n.tags))).sort();
  const filteredNotes = activeTag
    ? displayNotes.filter((n) => n.tags.includes(activeTag))
    : displayNotes;

  const handleSelectNote = (id: NoteId) => {
    onSelectNote(id);
    if (mobileOpen) onMobileToggle(); // close on mobile after selecting
  };

  const handleNewNote = () => {
    onNewNote();
    if (mobileOpen) onMobileToggle(); // close on mobile after creating
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 md:hidden"
          onClick={onMobileToggle}
          onKeyDown={(e) => e.key === "Escape" && onMobileToggle()}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "flex flex-col h-full border-r border-border w-72 shrink-0 z-40",
          "fixed md:relative inset-y-0 left-0 transition-transform duration-300",
          "bg-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        data-ocid="sidebar.panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold text-foreground text-lg">
              Zenith Notes
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground transition-smooth p-1 rounded"
              aria-label="Sign out"
              data-ocid="sidebar.logout_button"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onMobileToggle}
              className="text-muted-foreground hover:text-foreground transition-smooth p-1 rounded md:hidden"
              aria-label="Close sidebar"
              data-ocid="sidebar.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Note Button */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <Button
            className="w-full gap-2"
            onClick={handleNewNote}
            data-ocid="sidebar.new_note_button"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8 text-sm bg-background border-input"
              placeholder="Search notes…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-ocid="sidebar.search_input"
            />
          </div>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="px-3 pb-2 shrink-0">
            <p className="text-muted-hint mb-1.5 px-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className={[
                  "tag-base transition-smooth",
                  !activeTag
                    ? "bg-accent/20 border-accent/50 text-accent"
                    : "hover:bg-accent/15",
                ].join(" ")}
                onClick={() => onSelectTag(null)}
                data-ocid="sidebar.tag_all"
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={[
                    "tag-base transition-smooth",
                    activeTag === tag
                      ? "bg-accent/20 border-accent/50 text-accent"
                      : "hover:bg-accent/15",
                  ].join(" ")}
                  onClick={() => onSelectTag(activeTag === tag ? null : tag)}
                  data-ocid={`sidebar.tag.${tag.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Note List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          {isLoading ? (
            ["s1", "s2", "s3", "s4"].map((k) => (
              <div
                key={k}
                className="p-4 rounded-md border border-border space-y-2"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))
          ) : filteredNotes.length === 0 ? (
            <div
              className="text-center py-10 space-y-2"
              data-ocid="notes.empty_state"
            >
              <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-body-sm text-muted-foreground">
                {searchTerm
                  ? "No notes match your search."
                  : "No notes yet. Create your first!"}
              </p>
            </div>
          ) : (
            filteredNotes.map((note, i) => (
              <NoteCard
                key={note.id.toString()}
                note={note}
                isActive={activeNoteId === note.id}
                onClick={() => handleSelectNote(note.id)}
                index={i + 1}
              />
            ))
          )}
        </div>
      </aside>

      {/* Mobile toggle button (visible when sidebar is closed) */}
      <button
        type="button"
        onClick={onMobileToggle}
        className="fixed top-3 left-3 z-20 md:hidden bg-card border border-border rounded-md p-2 shadow-sm text-foreground"
        aria-label="Open sidebar"
        data-ocid="sidebar.open_button"
      >
        <Menu className="w-4 h-4" />
      </button>
    </>
  );
}
