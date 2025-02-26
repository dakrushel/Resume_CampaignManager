import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import NPC from "./npc";
import NPCForm from "./npcform";
import { useAuth0 } from "@auth0/auth0-react";

export default function NPCList({ campaignID, locationID }) {
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    // Fetch NPCs from the backend
    const fetchNPCs = useCallback(async () => {
        if (!campaignID) {
            setError("Missing campaignID. Cannot fetch NPCs.");
            return;
        }

        setLoading(true);

        try {
            const token = await getAccessTokenSilently();

            if (!locationID) {
              setError("Missing locationID. Cannot fetch NPCs");
              setLoading(false);
              return;
            }
            let endpoint = `http://localhost:5050/npcs/location/${locationID}`
                // : `http://localhost:5050/npcs/campaign/${campaignID}`;

            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Error fetching NPCs: ${response.statusText}`);

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid response: Expected an array of NPCs.");

            setNpcs(data);
        } catch (err) {
            console.error("Failed to fetch NPCs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [campaignID, locationID, getAccessTokenSilently]);

    useEffect(() => {
        fetchNPCs();
    }, [fetchNPCs]);

    // Handle Saving a New or Updated NPC
    const handleSaveNPC = async (savedNPC) => {
        if (!savedNPC || !savedNPC._id) {
            console.error("Invalid saved NPC received:", savedNPC);
            return;
        }

        setNpcs((prevNPCs) => {
            const exists = prevNPCs.some((npc) => npc._id === savedNPC._id);
            return exists
                ? prevNPCs.map((npc) => (npc._id === savedNPC._id ? savedNPC : npc)) // Update existing NPC
                : [...prevNPCs, savedNPC]; // Add new NPC
        });

        setShowForm(false);
    };

    // Handle Deleting an NPC
    const handleDeleteNPC = (deletedNPCID) => {
        setNpcs((prevNPCs) => prevNPCs.filter((npc) => npc._id !== deletedNPCID));
    };

    if (loading) return <p>Loading NPCs...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-2 bg-yellow-200 rounded-lg">
            {npcs.length === 0 && !showForm ? (
                <p>No NPCs found. Try adding one!</p>
            ) : (
                npcs.map((npc) => (
                    <NPC
                        key={npc._id}
                        npc={npc}
                        campaignID={campaignID}
                        locationID={locationID}
                        onUpdateNPC={handleSaveNPC}  // Supposed to handle updates immediately
                        onDeleteNPC={handleDeleteNPC}
                    />
                ))
            )}

            {showForm ? (
                <NPCForm
                    campaignID={campaignID}
                    locationID={locationID}
                    onSave={handleSaveNPC} // Ensure NPCs update immediately
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

NPCList.propTypes = {
    campaignID: PropTypes.string.isRequired,
    locationID: PropTypes.string.isRequired,
};
