import { useState } from "react";
import PropTypes from "prop-types";
import NPCForm from "./npcform";
import { useAuth0 } from "@auth0/auth0-react";

export default function NPC({ npc, campaignID, locationID, onUpdateNPC, onDeleteNPC }) {
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    const handleEditClick = () => setEditMode(true);

    const handleSave = (updatedNPC) => {
        setEditMode(false);
        onUpdateNPC(updatedNPC);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this NPC?")) return;
        setDeleting(true);

        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:5050/npcs/${npc._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete NPC");

            onDeleteNPC(npc._id);
        } catch (error) {
            console.error("Failed to delete NPC:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-2 border-b bg-white rounded-md shadow">
            <button onClick={() => setExpanded(!expanded)} className="text-lg font-semibold">
                {expanded ? "▼" : "▶"} {npc.charName || "Unnamed NPC"}
            </button>

            {expanded && (
            <div className="mt-2">
                {editMode ? (
                    <NPCForm
                        existingNPC={npc}
                        campaignID={campaignID}
                        locationID={locationID}
                        onSave={handleSave}
                        onCancel={() => setEditMode(false)}
                    />
                ) : (
                    <>
                        <p><strong>Race:</strong> {npc.race}</p>
                        <p><strong>Alignment:</strong> {npc.alignment}</p>
                        <p><strong>Class:</strong> {npc.className || "N/A"}</p>
                
                        <div className="npc-stats">
                            <label>Stats:</label>
                            <div className="stat-block">
                                {Object.keys(npc.stats).map((stat) => (
                                    <div key={stat}>
                                        <p>{stat.charAt(0).toUpperCase() + stat.slice(1)}: {npc.stats[stat]}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                            
                        <button onClick={handleEditClick} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className={`bg-red-600 text-white px-3 py-1 rounded ${deleting ? "opacity-50" : ""}`}
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

NPC.propTypes = {
    npc: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        charName: PropTypes.string.isRequired,
        race: PropTypes.string.isRequired,
        alignment: PropTypes.string.isRequired,
        className: PropTypes.string,
        stats: PropTypes.shape({
            strength: PropTypes.number.isRequired,
            dexterity: PropTypes.number.isRequired,
            constitution: PropTypes.number.isRequired,
            intelligence: PropTypes.number.isRequired,
            wisdom: PropTypes.number.isRequired,
            charisma: PropTypes.number.isRequired,
        }).isRequired,
    }).isRequired,
    campaignID: PropTypes.string.isRequired,
    locationID: PropTypes.string.isRequired,
    onUpdateNPC: PropTypes.func.isRequired,
    onDeleteNPC: PropTypes.func.isRequired,

};
