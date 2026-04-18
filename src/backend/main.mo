import Map "mo:core/Map";
import NotesMixin "mixins/notes-api";
import NotesLib "lib/notes";
import NoteTypes "types/notes";

actor {
  let notes : NotesLib.NoteMap = Map.empty<NoteTypes.NoteId, NoteTypes.Note>();

  include NotesMixin(notes);
};
