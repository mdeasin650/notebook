export type NoteId = bigint;

export interface Note {
  id: NoteId;
  title: string;
  body: string;
  tags: string[];
  createdAt: bigint;
  updatedAt: bigint;
}

export interface NoteInput {
  title: string;
  body: string;
  tags: string[];
}
