import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Types "../types/notes";

module {
  public type NoteMap = Map.Map<Types.NoteId, Types.Note>;

  // Create a new note for the given caller; returns the new note
  public func createNote(
    notes : NoteMap,
    nextId : Nat,
    caller : Principal,
    input : Types.NoteInput,
    now : Int,
  ) : Types.Note {
    let note : Types.Note = {
      id = nextId;
      owner = caller;
      title = input.title;
      body = input.body;
      tags = input.tags;
      createdAt = now;
      updatedAt = now;
    };
    notes.add(nextId, note);
    note;
  };

  // Update an existing note by id; traps if not found or not owned by caller
  public func updateNote(
    notes : NoteMap,
    id : Types.NoteId,
    caller : Principal,
    input : Types.NoteInput,
    now : Int,
  ) : Types.Note {
    let existing = switch (notes.get(id)) {
      case (?n) n;
      case null Runtime.trap("Note not found");
    };
    if (not Principal.equal(existing.owner, caller)) {
      Runtime.trap("Not authorized");
    };
    let updated : Types.Note = {
      existing with
      title = input.title;
      body = input.body;
      tags = input.tags;
      updatedAt = now;
    };
    notes.add(id, updated);
    updated;
  };

  // Delete a note by id; traps if not found or not owned by caller
  public func deleteNote(
    notes : NoteMap,
    id : Types.NoteId,
    caller : Principal,
  ) : () {
    let existing = switch (notes.get(id)) {
      case (?n) n;
      case null Runtime.trap("Note not found");
    };
    if (not Principal.equal(existing.owner, caller)) {
      Runtime.trap("Not authorized");
    };
    notes.remove(id);
  };

  // Return all notes for caller, sorted by most recently modified first
  public func listNotes(
    notes : NoteMap,
    caller : Principal,
  ) : [Types.Note] {
    let callerNotes = notes.entries()
      |> _.filter(func((_, n) : (Types.NoteId, Types.Note)) : Bool {
        Principal.equal(n.owner, caller)
      })
      |> _.map(func((_, n) : (Types.NoteId, Types.Note)) : Types.Note { n })
      |> _.toArray();
    callerNotes.sort(func(a : Types.Note, b : Types.Note) : { #less; #equal; #greater } {
      Int.compare(b.updatedAt, a.updatedAt)
    });
  };

  // Full-text search across title and body for caller's notes
  public func searchNotes(
    notes : NoteMap,
    caller : Principal,
    term : Text,
  ) : [Types.Note] {
    let lowerTerm = term.toLower();
    let matched = notes.entries()
      |> _.filter(func((_, n) : (Types.NoteId, Types.Note)) : Bool {
        Principal.equal(n.owner, caller) and (
          n.title.toLower().contains(#text lowerTerm) or
          n.body.toLower().contains(#text lowerTerm)
        )
      })
      |> _.map(func((_, n) : (Types.NoteId, Types.Note)) : Types.Note { n })
      |> _.toArray();
    matched.sort(func(a : Types.Note, b : Types.Note) : { #less; #equal; #greater } {
      Int.compare(b.updatedAt, a.updatedAt)
    });
  };
};
