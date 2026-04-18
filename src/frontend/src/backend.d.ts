import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type NoteId = bigint;
export interface NoteInput {
    title: string;
    body: string;
    tags: Array<string>;
}
export interface Note {
    id: NoteId;
    title: string;
    owner: Principal;
    body: string;
    createdAt: bigint;
    tags: Array<string>;
    updatedAt: bigint;
}
export interface backendInterface {
    createNote(input: NoteInput): Promise<Note>;
    deleteNote(id: NoteId): Promise<void>;
    getNote(id: NoteId): Promise<Note | null>;
    listNotes(): Promise<Array<Note>>;
    searchNotes(term: string): Promise<Array<Note>>;
    updateNote(id: NoteId, input: NoteInput): Promise<Note>;
}
