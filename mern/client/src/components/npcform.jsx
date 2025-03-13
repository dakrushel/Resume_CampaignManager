import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";
// import { randGen } from "../utils/randomGeneration/characterGenerator.mjs";
import { randGen } from "../utils/RandomGeneration/characterGenerator";


export default function NPCForm({ campaignID, locationID, existingNPC, onSave, onCancel }) {
    const [npcData, setNPCData] = useState({
        charName: existingNPC?.charName || "",
        age: existingNPC?.age || 0,
        race: existingNPC?.race || "",
        gender: existingNPC?.gender || "",
        alignment: existingNPC?.alignment || "",
        className: existingNPC?.className || "",
        level: existingNPC?.level || 1,
        size: existingNPC?.size || "Medium",
        speed: existingNPC?.speed || 30,
        quirks: existingNPC?.quirks || "",
        features: existingNPC?.features || "",
        vices: existingNPC?.vices || "",
        virtues: existingNPC?.virtues || "",
        ideals: existingNPC?.ideals || "",
        campaignID,
        locationID,
        stats: existingNPC?.stats || {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
        },
    });

    const { getAccessTokenSilently } = useAuth0();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNPCData((prev) =>
            name in prev.stats
                ? { ...prev, stats: { ...prev.stats, [name]: Number(value) || 10 } }
                : { ...prev, [name]: value }
        );
    };

    const handleGenerate = () => {
        const newNPC = randGen();
        setNPCData({
            charName: newNPC.charName,
            age: newNPC.age,
            race: newNPC.race,
            gender: newNPC.gender,
            alignment: newNPC.alignment,
            className: newNPC.className,
            level: newNPC.level,
            size: newNPC.size,
            speed: newNPC.speed,
            quirks: newNPC.quirks,
            features: newNPC.features,
            vices: newNPC.vices,
            virtues: newNPC.virtues,
            ideals: newNPC.ideals,
            campaignID,
            locationID,
            stats: newNPC.stats,
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
    
        const token = await getAccessTokenSilently();
        const url = existingNPC ? `http://localhost:5050/npcs/${existingNPC._id}` : "http://localhost:5050/npcs";
        const method = existingNPC ? "PUT" : "POST";
    
        const payload = {
            campaignID,
            locationID,
            charName: npcData.charName.trim(),
            age: Number(npcData.age) || 0,
            race: npcData.race.trim(),
            gender: npcData.gender ? npcData.gender.trim() : null,
            alignment: npcData.alignment.trim(),
            className: npcData.className ? npcData.className.trim() : "",
            level: Number(npcData.level) || 1,
            size: npcData.size.trim(),
            speed: Number(npcData.speed) || 30,
            quirks: npcData.quirks.trim(),
            features: npcData.features.trim(),
            vices: npcData.vices.trim(),
            virtues: npcData.virtues.trim(),
            ideals: npcData.ideals.trim(),
            stats: {
                strength: Number(npcData.stats.strength) || 10,
                dexterity: Number(npcData.stats.dexterity) || 10,
                constitution: Number(npcData.stats.constitution) || 10,
                intelligence: Number(npcData.stats.intelligence) || 10,
                wisdom: Number(npcData.stats.wisdom) || 10,
                charisma: Number(npcData.stats.charisma) || 10,
            },
        };
    
        console.log("Submitting NPC:", payload); // Log the request before sending
    
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(`Failed to save NPC: ${errorText}`);
            }
    
            const result = await response.json();
            console.log("NPC saved successfully:", result);
            onSave(result);
        } catch (error) {
            console.error("Failed to save NPC:", error);
            alert(`Error saving NPC: ${error.message}`);
        }
    };
    

    return (
        <form onSubmit={handleSave} className="p-4 bg-white rounded shadow-md">
            <label>Name:</label>
            <input type="text" name="charName" value={npcData.charName} onChange={handleChange} required />

            <label>Age:</label>
            <input type="number" name="age" value={npcData.age} onChange={handleChange} required />

            <label>Race:</label>
            <input type="text" name="race" value={npcData.race} onChange={handleChange} required />

            <label>Gender:</label>
            <input type="text" name="gender" value={npcData.gender} onChange={handleChange} required />

            <label>Alignment:</label>
            <input type="text" name="alignment" value={npcData.alignment} onChange={handleChange} required />

            <label>Class:</label>
            <input type="text" name="className" value={npcData.className} onChange={handleChange} />

            <label>Level:</label>
            <input type="number" name="level" value={npcData.level} onChange={handleChange} required />

            <label>Size:</label>
            <input type="text" name="size" value={npcData.size} onChange={handleChange} required />

            <label>Speed:</label>
            <input type="number" name="speed" value={npcData.speed} onChange={handleChange} required />

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

            <button type="button" onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
                Generate
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
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
