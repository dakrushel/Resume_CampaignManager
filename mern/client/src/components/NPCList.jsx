import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import NpcItem from "./npc";
// import NPCForm from "./npcform";
import NPCform from "./npcform"
import { useAuth0 } from "@auth0/auth0-react";

export default function NpcList({ parentLocationID, campaignID }) {
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    // Fetch NPCs from the backend
    const fetchNpcs = useCallback(async () => {
        if (!campaignID) {
            setError("Missing campaignID. Cannot fetch NPCs.");
            return;
        }

        setLoading(true);

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const endpoint = `http://localhost:5050/npcs/location/${parentLocationID}`
                // : `http://localhost:5050/npcs/campaign/${campaignID}`;

            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`Error fetching NPCs: ${response.statusText}`);
            }

            const data = await response.json();
            setNpcs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch NPCs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [campaignID, parentLocationID, getAccessTokenSilently]);

    // Fetch NPCs when component mounts or dependencies change
    useEffect(() => {
        fetchNpcs();
    }, [fetchNpcs]);

    // Handle saving (add/update)
    const handleSaveNpc = async (savedNpc) => {
        if (!savedNpc || !savedNpc._id) {
            console.error("Invalid savedNpc received in handleSaveNpc:", savedNpc);
            return;
        }

        setNpcs((prevNpcs) => {
            const npcExists = prevNpcs.some((npc) => npc._id === savedNpc._id);
            return npcExists
                ? prevNpcs.map((npc) => (npc._id === savedNpc._id ? savedNpc : npc)) // Replace updated NPC
                : [...prevNpcs, savedNpc]; // Add new NPC if it doesn’t exist
        });

        setShowForm(false);
        await fetchNpcs();
    };

    // Handle update
    const handleUpdateNpc = (updatedNpc) => {
        if (!updatedNpc || !updatedNpc._id) {
            console.error("Error: Invalid NPC received in handleUpdateNpc:", updatedNpc);
            return;
        }
    
        setNpcs((prevNpcs) =>
            prevNpcs.map((npc) => (npc._id === updatedNpc._id ? updatedNpc : npc))
        );
    };
    

    // Handle delete
    const handleDeleteNpc = (deletedNpcID) => {
        setNpcs((prevNpcs) => prevNpcs.filter((npc) => npc._id !== deletedNpcID));
    };

    if (loading) return <p className="text-brown text-lg">Loading NPCs...</p>;
    if (error) return <p className="bg-light-tan text-red-800 font-bold text-lg">Error: {error}. Sorry!</p>;

    return (
        <div className="p-4 bg-light-tan rounded-lg">
            {npcs.length === 0 && !showForm ? (
                <p className="text-lg">No NPCs available. Try creating one!</p>
            ) : (
                npcs.map((npc) => (
                    <NpcItem
                        key={npc._id}
                        npc={npc}
                        campaignID={campaignID}
                        parentLocationID={parentLocationID}
                        onNpcUpdate={handleUpdateNpc}
                        onNpcDelete={handleDeleteNpc}
                    />
                ))
            )}

            {showForm ? (
                <NPCform
                    campaignID={campaignID}
                    parentLocationID={parentLocationID}
                    onSave={handleSaveNpc}
                    onCancel={() => setShowForm(false)}
                    isNew={isNew}
                />
            ) : (
                <button
                    onClick={() => {setIsNew(true); setShowForm(true)}}
                    className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
                >
                    +
                </button>
            )}
        </div>
    );
}

NpcList.propTypes = {
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    campaignID: PropTypes.string.isRequired,
};