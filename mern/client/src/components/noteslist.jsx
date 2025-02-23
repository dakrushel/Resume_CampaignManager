import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import NoteItem from "./noteitem";
import NoteForm from "./noteform";

export default function NoteList({ parentLocationID, campaignID }) {
    
    // console.log("notelist campaignID: ", campaignID);
    // console.log("notelist parentLocationID: ", parentLocationID);

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fetchNotes = useCallback(async () => {
        if (!campaignID) {
            setError("Missing campaignID. Cannot fetch notes.");
            return;
        }

        setLoading(true);

        try {
            let endpoint = parentLocationID
                ? `http://localhost:5050/notes/location/${parentLocationID}`
                : `http://localhost:5050/notes/campaign/${campaignID}`;

            console.log("Fetching notes from: ", endpoint);

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error fetching notes: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Fetched notes: ", data);

            if (!Array.isArray(data)) {
                throw new Error("Invalid response: Expected an array of notes.");
            }

            setNotes(data);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [campaignID, parentLocationID]);

    useEffect(() => {
        console.log("useEffect triggered - Fetching notes...");
        fetchNotes();
    }, [fetchNotes]);

    const handleSaveNote = async (savedNote) => {
        console.log("handleSaveNote started savedNote: ", savedNote)
        
        if (!savedNote || !savedNote._id) {
            console.error("Error: Invalid savedNote received in handleSaveNote: ", savedNote);
            return;
        }

        setNotes((prevNotes) => {
            const noteExists = prevNotes.some((note) => note._id === savedNote._id);
            return noteExists
                ? prevNotes.map((note) => (note._id === savedNote._id ? savedNote : note)) // Replace updated note
                : [...prevNotes, savedNote]; // Add new note if it doesn’t exist
        });
        setShowForm(false);
        await fetchNotes();
        console.log("handleSaveNote finished")
    };
    
    const handleUpdateNote = (updatedNote) => {
        setNotes((prevNotes) => prevNotes.map((note) => (note._id === updatedNote._id ? updatedNote : note)));
    };

    const handleDeleteNote = (deletedNoteID) => {
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== deletedNoteID));
    }

    if (loading) return <p className="text-gray-600">Loading notes...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-2 bg-yellow-200 rounded-lg">
            {notes.length === 0 && !showForm ? (
                <p>No notes available. Try creating one!</p>
            ) : (
                notes.map((note) => (
                    <NoteItem
                        key={note._id}
                        note={note}
                        campaignID={campaignID}
                        parentLocationID={parentLocationID}
                        onNoteUpdate={handleUpdateNote}
                        onNoteDelete={handleDeleteNote}
                    />
                ))
            )}

            {showForm ? (
                <NoteForm
                    campaignID={campaignID}
                    parentLocationID={parentLocationID}
                    onSave={(savedNote) => {
                        console.log("NoteList received savedNote:", savedNote); // Debug log
                        if (!savedNote || !savedNote._id) {
                            console.error("Invalid savedNote recieved: ", savedNote);
                            return;
                        }
                        handleSaveNote(savedNote);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
                    +
                </button>
            )}
        </div>
    );
}

NoteList.propTypes = {
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    campaignID: PropTypes.string.isRequired,
};
