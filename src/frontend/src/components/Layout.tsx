import type { NoteId } from "@/types";
import { useState } from "react";
import { NoteEditor } from "./NoteEditor";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [activeNoteId, setActiveNoteId] = useState<NoteId | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNewNote = () => {
    setActiveNoteId(null);
    setIsCreating(true);
  };

  const handleSelectNote = (id: NoteId) => {
    setActiveNoteId(id);
    setIsCreating(false);
  };

  const handleNoteCreated = (id: NoteId) => {
    setActiveNoteId(id);
    setIsCreating(false);
  };

  const handleNoteDeleted = () => {
    setActiveNoteId(null);
    setIsCreating(false);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-background"
      data-ocid="app.page"
    >
      <Sidebar
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={toggleMobileSidebar}
      />

      <main
        className="flex-1 overflow-hidden bg-background min-w-0"
        data-ocid="editor.panel"
      >
        <NoteEditor
          noteId={activeNoteId}
          isCreating={isCreating}
          onNoteCreated={handleNoteCreated}
          onNoteDeleted={handleNoteDeleted}
        />
      </main>
    </div>
  );
}
