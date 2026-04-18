import Principal "mo:core/Principal";

module {
  public type NoteId = Nat;

  public type Note = {
    id : NoteId;
    owner : Principal;
    title : Text;
    body : Text; // HTML string
    tags : [Text];
    createdAt : Int; // nanoseconds
    updatedAt : Int; // nanoseconds
  };

  public type NoteInput = {
    title : Text;
    body : Text;
    tags : [Text];
  };
};
