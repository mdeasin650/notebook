import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Types "../types/notes";
import NotesLib "../lib/notes";

mixin (
  notes : NotesLib.NoteMap,
) {

  var nextNoteId : Nat = 0;

  // Create a new note; returns the created note
  public shared ({ caller }) func createNote(input : Types.NoteInput) : async Types.Note {
    let id = nextNoteId;
    nextNoteId += 1;
    NotesLib.createNote(notes, id, caller, input, Time.now());
  };

  // Auto-save: update an existing note by id; returns the updated note
  public shared ({ caller }) func updateNote(id : Types.NoteId, input : Types.NoteInput) : async Types.Note {
    NotesLib.updateNote(notes, id, caller, input, Time.now());
  };

  // Delete a note by id
  public shared ({ caller }) func deleteNote(id : Types.NoteId) : async () {
    NotesLib.deleteNote(notes, id, caller);
  };

  // List all caller's notes sorted by most recently modified first
  public query ({ caller }) func listNotes() : async [Types.Note] {
    NotesLib.listNotes(notes, caller);
  };

  // Full-text search across title and body of caller's notes
  public query ({ caller }) func searchNotes(term : Text) : async [Types.Note] {
    NotesLib.searchNotes(notes, caller, term);
  };

  // Get a single note by id (only if owned by caller)
  public query ({ caller }) func getNote(id : Types.NoteId) : async ?Types.Note {
    switch (notes.get(id)) {
      case (?note) {
        if (Principal.equal(note.owner, caller)) ?note else null
      };
      case null null;
    };
  };
};
