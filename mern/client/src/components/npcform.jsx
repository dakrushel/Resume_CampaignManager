import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

export default function NPCForm({ campaignID, locationID, existingNPC, onSave, onCancel }) {
    const [npcData, setNPCData] = useState({
        charName: existingNPC?.charName || "",
        race: existingNPC?.race || "",
        gender: existingNPC?.gender || "",
        alignment: existingNPC?.alignment || "",
        className: existingNPC?.className || "",
        quirks: existingNPC?.quirks || "",
        vices: existingNPC?.vices || "",
        virtues: existingNPC?.virtues || "",
        ideals: existingNPC?.ideals || "",
        campaignID,
        locationID,
        stats: {
            strength: existingNPC?.stats?.strength || 10,
            dexterity: existingNPC?.stats?.dexterity || 10,
            constitution: existingNPC?.stats?.constitution || 10,
            intelligence: existingNPC?.stats?.intelligence || 10,
            wisdom: existingNPC?.stats?.wisdom || 10,
            charisma: existingNPC?.stats?.charisma || 10,
        },
    });

    const { getAccessTokenSilently } = useAuth0();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setNPCData((prev) => {
            if (["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].includes(name)) {
                return {
                    ...prev,
                    stats: { ...prev.stats, [name]: Number(value) || 10 },
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = await getAccessTokenSilently();
        const url = existingNPC ? `http://localhost:5050/npcs/${existingNPC._id}` : "http://localhost:5050/npcs";
        const method = existingNPC ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(npcData),
        });

        const result = await response.json();
        onSave(result);
    };

    return (
        <form onSubmit={handleSave} className="p-4 bg-white rounded shadow-md">
            <label>Name:</label>
            <input type="text" name="charName" value={npcData.charName} onChange={handleChange} required />

            <label>Race:</label>
            <input type="text" name="race" value={npcData.race} onChange={handleChange} required />

            <label>Alignment:</label>
            <input type="text" name="alignment" value={npcData.alignment} onChange={handleChange} required />

            <label>Class:</label>
            <input type="text" name="className" value={npcData.className} onChange={handleChange} />

            <div className="npc-stats">
                <label>Stats:</label>
                <div className="stat-block">
                    {Object.keys(npcData.stats).map((stat) => (
                        <div className="stat" key={stat}>
                            <p>{stat.charAt(0).toUpperCase() + stat.slice(1)}</p>
                            <input type="number" name={stat} value={npcData.stats[stat]} onChange={handleChange} />
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}

NPCForm.propTypes = {
    campaignID: PropTypes.string.isRequired,
    locationID: PropTypes.string.isRequired,
    existingNPC: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
