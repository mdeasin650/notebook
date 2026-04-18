import { createActor } from "@/backend";
import type { Note, NoteId, NoteInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function useBackend() {
  return useActor(createActor);
}

export function useNotes() {
  const { actor, isFetching } = useBackend();
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNote(id: NoteId | null) {
  const { actor, isFetching } = useBackend();
  return useQuery<Note | null>({
    queryKey: ["note", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getNote(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSearchNotes(term: string) {
  const { actor, isFetching } = useBackend();
  return useQuery<Note[]>({
    queryKey: ["notes", "search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchNotes(term);
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

export function useCreateNote() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation<Note, Error, NoteInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createNote(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation<Note, Error, { id: NoteId; input: NoteInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateNote(id, input);
    },
    onSuccess: (note) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["note", note.id.toString()] });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useBackend();
  const qc = useQueryClient();
  return useMutation<void, Error, NoteId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteNote(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
