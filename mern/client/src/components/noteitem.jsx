import { useState } from "react";
import PropTypes from "prop-types";
import NoteForm from "./noteform";
import { useAuth0 } from "@auth0/auth0-react";

export default function NoteItem({ note, campaignID, parentLocationID, onNoteUpdate, onNoteDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleNoteSave = (updatedNote) => {
        setEditMode(false);
        onNoteUpdate(updatedNote);
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        setDeleting(true);

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
            const response = await fetch(`http://localhost:5050/notes/${note._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete note");
            }

            onNoteDelete(note._id);
        } catch (error) {
            console.error("Failed to delete note:", error);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="p-2 border-b bg-cream border-brown rounded-md shadow-sm shadow-amber-700">
            <button onClick={() => setExpanded(!expanded)} className="text-lg font-semibold">
                {expanded ? "▲" : "▼"} {note.title}
            </button>

            {expanded && (
                <div className="mt-2">
                    {editMode ? (
                        <NoteForm
                            existingNote={note}
                            // existingNote={{...note, _id: note._id?.toString()}}
                            campaignID={campaignID}
                            parentLocationID={parentLocationID}
                            onSave={handleNoteSave}
                            onCancel={() => setEditMode(false)} />
                    ) : (
                        <>
                            <p className="p-4 bg-light-tan rounded text-left">{note.body}</p>
                            <button onClick={handleEditClick} className="font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800">
                                Edit
                            </button>
                            <button
                                    onClick={handleDelete}
                                    className={`font-bold bg-cancel-red button ml-2 hover:shadow-sm hover:shadow-amber-800 text-gold px-3 py-1 rounded ${deleting ? "opacity-50" : ""}`}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

NoteItem.propTypes = {
    note: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        body: PropTypes.string.isRequired,
    }).isRequired,
    campaignID: PropTypes.string.isRequired,
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    onNoteUpdate: PropTypes.func.isRequired,
    onNoteDelete: PropTypes.func.isRequired,
};