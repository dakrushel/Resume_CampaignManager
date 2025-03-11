import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import NpcForm from "./npcform";
import { useAuth0 } from "@auth0/auth0-react";

export default function NpcItem({ npc, campaignID, parentLocationID, onNpcUpdate, onNpcDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    // ✅ Store local state for NPC to update it immediately
    const [npcData, setNpcData] = useState({ ...npc, stats: npc.stats || {} });

    useEffect(() => {
        setNpcData({ ...npc, stats: npc.stats || {} }); // ✅ Ensure npcData updates when new props are received
    }, [npc]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleNpcSave = (updatedNpc) => {
        setEditMode(false);
        setNpcData(updatedNpc); // ✅ Immediately update local state
        onNpcUpdate(updatedNpc); // ✅ Propagate change to parent
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${npcData.charName}?`)) return;
        setDeleting(true);

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch(`http://localhost:5050/npcs/${npcData._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Failed to delete NPC");
            }

            onNpcDelete(npcData._id);
        } catch (error) {
            console.error("Failed to delete NPC:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="p-2 border-b bg-cream border-brown rounded-md shadow shadow-amber-800">
            <button onClick={() => setExpanded(!expanded)} className="text-lg font-semibold flex items-center">
                {expanded ? "▼" : "▶"} {npcData.charName}
            </button>

            {expanded && (
                <div className="mt-2 bg-light-tan p-3 rounded-md">
                    {editMode ? (
                        <NpcForm
                            existingNpc={npcData} // ✅ Pass the updated state
                            campaignID={campaignID}
                            parentLocationID={parentLocationID}
                            onSave={handleNpcSave}
                            onCancel={() => setEditMode(false)}
                        />
                    ) : (
                        <>
                            <p><strong>Race:</strong> {npcData.race}</p>
                            <p><strong>Class:</strong> {npcData.className} (Level {npcData.level})</p>
                            <p><strong>Alignment:</strong> {npcData.alignment}</p>
                            <p><strong>Size:</strong> {npcData.size}, <strong>Speed:</strong> {npcData.speed}ft</p>
                            <p><strong>Age:</strong> {npcData.age}</p>
                            <p><strong>Quirks:</strong> {npcData.quirks || "None"}</p>
                            <p><strong>Features:</strong> {npcData.features || "None"}</p>
                            <p><strong>Vices:</strong> {npcData.vices || "None"}</p>
                            <p><strong>Virtues:</strong> {npcData.virtues || "None"}</p>
                            <p><strong>Ideals:</strong> {npcData.ideals || "None"}</p>

                            {/* Stats Section */}
                            <div className="mt-2">
                                <h3 className="font-bold">Stats</h3>
                                <p>STR: {npcData.stats?.strength || 0}, DEX: {npcData.stats?.dexterity || 0}, CON: {npcData.stats?.constitution || 0}</p>
                                <p>INT: {npcData.stats?.intelligence || 0}, WIS: {npcData.stats?.wisdom || 0}, CHA: {npcData.stats?.charisma || 0}</p>

                            </div>

                            {/* Edit and Delete Buttons */}
                            <div className="mt-3">
                                <button onClick={handleEditClick} className="mr-2 bg-goblin-green text-gold px-3 py-1 rounded">
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className={`bg-cancel-red text-gold px-3 py-1 rounded ${deleting ? "opacity-50" : ""}`}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

NpcItem.propTypes = {
    npc: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        charName: PropTypes.string.isRequired,
        race: PropTypes.string,
        className: PropTypes.string,
        level: PropTypes.number,
        alignment: PropTypes.string,
        size: PropTypes.string,
        speed: PropTypes.number,
        age: PropTypes.string,
        quirks: PropTypes.string,
        features: PropTypes.string,
        vices: PropTypes.string,
        virtues: PropTypes.string,
        ideals: PropTypes.string,
        stats: PropTypes.shape({
            strength: PropTypes.number,
            dexterity: PropTypes.number,
            constitution: PropTypes.number,
            intelligence: PropTypes.number,
            wisdom: PropTypes.number,
            charisma: PropTypes.number,
        }),
    }).isRequired,
    campaignID: PropTypes.string.isRequired,
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    onNpcUpdate: PropTypes.func.isRequired,
    onNpcDelete: PropTypes.func.isRequired,
};
